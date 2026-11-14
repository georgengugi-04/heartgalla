import { ctxOf, img, type CanvasLike, type StudioDoc } from "./doc";

export type ExportBackground = "current" | "transparent" | "white";
export type CardInfo = {
  title: string;
  creator: string;
  /** the artist whose colours were borrowed */
  artistName: string;
  /** only when the artwork's title is reliable */
  artworkTitle?: string | null;
  /** the colours in the working palette, as hex */
  palette: string[];
  date: Date;
};
export type ExportOptions = { scale: 1 | 2; background: ExportBackground; card?: CardInfo | null };

export const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "") || "untitled";
export const exportFilename = (title: string, opts: ExportOptions) => `eartgalla-${slugify(title)}${opts.background === "transparent" ? "-transparent" : ""}${opts.scale === 2 ? "@2x" : ""}.png`;

const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

/** Flattens the drawing (and, optionally, an information strip) into one canvas ready to be saved as PNG. */
export function renderExport(doc: StudioDoc, opts: ExportOptions): CanvasLike {
  const w = doc.width * opts.scale, h = doc.height * opts.scale;
  const footer = opts.card ? Math.round(w * 0.2) : 0;
  const out = doc.factory(w, h + footer);
  const ctx = ctxOf(out);
  const bg = opts.background === "transparent" ? null : opts.background === "white" ? "#FFFFFF" : "current";
  // paint the picture into its own canvas first so "transparent" really is transparent
  const art = doc.factory(w, h);
  doc.renderTo(ctxOf(art), opts.scale, bg);
  ctx.drawImage(img(art), 0, 0);

  if (opts.card) {
    const c = opts.card, u = w / 1000; // layout unit: 1000 units across
    ctx.fillStyle = "#0E0E0E"; ctx.fillRect(0, h, w, footer);
    ctx.fillStyle = "#B8974F"; ctx.fillRect(0, h, w, Math.max(1, u * 2));
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#F5F2EA"; ctx.font = `${Math.round(u * 38)}px ${SERIF}`;
    ctx.fillText(fit(ctx, c.title || "Untitled", w - u * 360), u * 40, h + u * 64);
    ctx.fillStyle = "rgba(245,242,234,0.75)"; ctx.font = `${Math.round(u * 20)}px ${SERIF}`;
    ctx.fillText(`by ${c.creator || "Anonymous"}`, u * 40, h + u * 98);
    ctx.fillStyle = "rgba(245,242,234,0.6)"; ctx.font = `${Math.round(u * 15)}px ${MONO}`;
    const borrowed = `COLOURS BORROWED FROM ${c.artistName.toUpperCase()}${c.artworkTitle ? ` · ${c.artworkTitle.toUpperCase()}` : ""}`;
    ctx.fillText(fit(ctx, borrowed, w - u * 80), u * 40, h + u * 134);
    const sw = Math.min(u * 44, (w - u * 80) / Math.max(1, c.palette.length) - u * 4);
    c.palette.forEach((hex, i) => { ctx.fillStyle = hex; ctx.fillRect(u * 40 + i * (sw + u * 4), h + u * 148, sw, u * 30); });
    ctx.textAlign = "right"; ctx.fillStyle = "#F5F2EA"; ctx.font = `${Math.round(u * 24)}px ${SERIF}`;
    ctx.fillText("EARTGALLA", w - u * 40, h + u * 64);
    ctx.fillStyle = "rgba(245,242,234,0.6)"; ctx.font = `${Math.round(u * 14)}px ${MONO}`;
    ctx.fillText(c.date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase(), w - u * 40, h + u * 90);
    ctx.fillText("THE BORROWED PALETTE · ART LAB", w - u * 40, h + u * 112);
    ctx.textAlign = "left";
  }
  return out;
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number): string {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > max) t = t.slice(0, -1);
  return t + "…";
}

export const canvasToBlob = (c: CanvasLike, type = "image/png"): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const el = c as unknown as HTMLCanvasElement;
    if (!el.toBlob) return reject(new Error("This browser cannot export images."));
    el.toBlob((b) => (b ? resolve(b) : reject(new Error("The image could not be created. Try the standard size."))), type);
  });
