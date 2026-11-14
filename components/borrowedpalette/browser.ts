import { analyse, type Analysis } from "@/lib/borrowedpalette/extract";
import { canvasToBlob } from "@/lib/borrowedpalette/export";
import type { CanvasFactory, CanvasLike } from "@/lib/borrowedpalette/doc";
import type { Codec } from "@/lib/borrowedpalette/persist";

export const domFactory: CanvasFactory = (w, h) => {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c as unknown as CanvasLike;
};

export const domCodec: Codec = {
  toBlob: (c) => canvasToBlob(c),
  decode: async (b) => {
    if (typeof createImageBitmap === "function") return createImageBitmap(b);
    const url = URL.createObjectURL(b);
    try { return await loadImage(url, false); } finally { URL.revokeObjectURL(url); }
  },
};

const images = new Map<string, Promise<HTMLImageElement>>();
/** Loads an image once and remembers it. Artwork lives on this same site, so reading its pixels is allowed. */
export function loadImage(url: string, cache = true): Promise<HTMLImageElement> {
  const hit = cache ? images.get(url) : undefined;
  if (hit) return hit;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = () => resolve(im);
    im.onerror = () => { images.delete(url); reject(new Error("This artwork couldn't be loaded.")); };
    im.src = url;
  });
  if (cache) images.set(url, p);
  return p;
}

/** A sampled region as fractions of the picture (0–1). */
export type Crop = { x: number; y: number; w: number; h: number };

/** Reads the colours of an artwork (or just the chosen part of it) at a size that never freezes the page. */
export async function analyseUrl(url: string, crop: Crop | null, ignoreBackground: boolean): Promise<Analysis> {
  const im = await loadImage(url);
  const c = crop ?? { x: 0, y: 0, w: 1, h: 1 };
  const sx = Math.round(c.x * im.naturalWidth), sy = Math.round(c.y * im.naturalHeight);
  const sw = Math.max(8, Math.round(c.w * im.naturalWidth)), sh = Math.max(8, Math.round(c.h * im.naturalHeight));
  const k = Math.min(1, 240 / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * k)), h = Math.max(1, Math.round(sh * k));
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("This browser couldn't read the artwork's colours.");
  ctx.drawImage(im, sx, sy, sw, sh, 0, 0, w, h);
  let data: ImageData;
  try { data = ctx.getImageData(0, 0, w, h); } catch { throw new Error("The browser blocked reading this artwork's colours."); }
  // yield once so a slow phone can paint its loading state before we crunch
  await new Promise((r) => setTimeout(r, 0));
  return analyse(data.data, w, h, { ignoreBackground });
}

export async function copyText(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    try {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      const ok = document.execCommand("copy");
      t.remove();
      return ok;
    } catch { return false; }
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
