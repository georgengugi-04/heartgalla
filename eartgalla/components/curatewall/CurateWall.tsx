"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import type { CollectionItem } from "@/lib/collection";

type Piece = { uid: string; slug: string; x: number; y: number; w: number };

// The wall is always 16:10, so a piece's height (as a fraction of the wall's height) is w * 1.6 / ratio.
const WALL_RATIO = 16 / 10;
const MIN_W = 0.08;
const MAX_W = 0.6;
const WALLS = [
  { id: "plaster", label: "Plaster", color: "#e7e1d5", ink: "#1a1918" },
  { id: "charcoal", label: "Charcoal", color: "#2b2927", ink: "#ece6da" },
  { id: "clay", label: "Clay", color: "#b0603f", ink: "#f4ece0" },
] as const;

const HANDLED_KEYS = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_", "Delete", "Backspace"];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * EXPERIMENT 08 — CURATE YOUR WALL
 * Put a few pieces side by side before you commit to any of them. Drag to move, the gold handle resizes,
 * × removes, and "Save mockup" writes the wall to a PNG on your device. Nothing is uploaded anywhere.
 * Sizes are relative — no real-world dimensions are implied.
 */
export default function CurateWall({ works }: { works: CollectionItem[] }) {
  const [placed, setPlaced] = useState<Piece[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [wallId, setWallId] = useState<(typeof WALLS)[number]["id"]>("plaster");
  const [status, setStatus] = useState("");
  const wallRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    uid: string;
    mode: "move" | "resize";
    sx: number;
    sy: number;
    ox: number;
    oy: number;
    ow: number;
  } | null>(null);

  const wall = WALLS.find((w) => w.id === wallId) ?? WALLS[0];
  const bySlug = (slug: string) => works.find((w) => w.slug === slug);
  const ratioOf = (slug: string) => {
    const w = bySlug(slug);
    return w ? w.width / w.height : 1;
  };
  const hFrac = (p: Piece) => (p.w * WALL_RATIO) / ratioOf(p.slug);

  function toggle(work: CollectionItem) {
    const existing = placed.find((p) => p.slug === work.slug);
    if (existing) {
      setPlaced((ps) => ps.filter((p) => p.uid !== existing.uid));
      setSelected(null);
      setStatus(`${work.title} removed from your wall.`);
      return;
    }
    const ratio = work.width / work.height;
    const w = clamp((0.46 * ratio) / WALL_RATIO, MIN_W, 0.26); // ~46% of the wall's height, capped
    const n = placed.length;
    const h = (w * WALL_RATIO) / ratio;
    const p: Piece = {
      uid: work.slug, // one piece per artwork, so the slug is a stable id
      slug: work.slug,
      w,
      x: clamp(0.5 - w / 2 + ((n % 5) - 2) * 0.12, 0, 1 - w),
      y: clamp(0.5 - h / 2 + (n % 2 ? 0.06 : -0.04), 0, 1 - h),
    };
    setPlaced((ps) => [...ps, p]);
    setSelected(p.uid);
    setStatus(`${work.title} added to your wall.`);
  }

  function front(uid: string) {
    setPlaced((ps) => {
      const p = ps.find((x) => x.uid === uid);
      return p && ps[ps.length - 1] !== p ? [...ps.filter((x) => x.uid !== uid), p] : ps;
    });
  }

  function down(e: React.PointerEvent, p: Piece, mode: "move" | "resize") {
    e.stopPropagation();
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { uid: p.uid, mode, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, ow: p.w };
    setSelected(p.uid);
    front(p.uid);
  }

  function move(e: React.PointerEvent) {
    const d = drag.current;
    const rect = wallRef.current?.getBoundingClientRect();
    if (!d || !rect) return;
    const dx = (e.clientX - d.sx) / rect.width;
    const dy = (e.clientY - d.sy) / rect.height;
    setPlaced((ps) =>
      ps.map((p) => {
        if (p.uid !== d.uid) return p;
        const ratio = ratioOf(p.slug);
        if (d.mode === "move") {
          const h = (p.w * WALL_RATIO) / ratio;
          return { ...p, x: clamp(d.ox + dx, 0, 1 - p.w), y: clamp(d.oy + dy, 0, 1 - h) };
        }
        // resize: keep the top-left corner, grow to the right, and stay inside the wall
        const maxByWall = Math.min(MAX_W, 1 - p.x, ((1 - p.y) * ratio) / WALL_RATIO);
        return { ...p, w: clamp(d.ow + dx, MIN_W, Math.max(MIN_W, maxByWall)) };
      }),
    );
  }

  const up = () => {
    drag.current = null;
  };

  function key(e: React.KeyboardEvent, p: Piece) {
    if (!HANDLED_KEYS.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "Delete" || e.key === "Backspace") {
      setPlaced((ps) => ps.filter((q) => q.uid !== p.uid));
      setSelected(null);
      return;
    }
    const step = e.shiftKey ? 0.04 : 0.01;
    const ratio = ratioOf(p.slug);
    setPlaced((ps) =>
      ps.map((q) => {
        if (q.uid !== p.uid) return q;
        const h = (q.w * WALL_RATIO) / ratio;
        const maxW = Math.min(MAX_W, 1 - q.x, ((1 - q.y) * ratio) / WALL_RATIO);
        switch (e.key) {
          case "ArrowLeft": return { ...q, x: clamp(q.x - step, 0, 1 - q.w) };
          case "ArrowRight": return { ...q, x: clamp(q.x + step, 0, 1 - q.w) };
          case "ArrowUp": return { ...q, y: clamp(q.y - step, 0, 1 - h) };
          case "ArrowDown": return { ...q, y: clamp(q.y + step, 0, 1 - h) };
          case "+": case "=": return { ...q, w: clamp(q.w + step, MIN_W, Math.max(MIN_W, maxW)) };
          default: return { ...q, w: clamp(q.w - step, MIN_W, MAX_W) }; // "-" / "_"
        }
      }),
    );
  }

  async function save() {
    if (placed.length === 0) return;
    setStatus("Preparing your mockup…");
    const W = 1600;
    const H = 1000;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return setStatus("Your browser couldn't make the image.");
    ctx.fillStyle = wall.color;
    ctx.fillRect(0, 0, W, H);
    const light = ctx.createRadialGradient(W * 0.5, H * 0.35, 80, W * 0.5, H * 0.5, W * 0.75);
    light.addColorStop(0, "rgba(255,255,255,0.10)");
    light.addColorStop(1, "rgba(0,0,0,0.14)");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, W, H);

    const load = (src: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    try {
      for (const p of placed) {
        const work = bySlug(p.slug);
        if (!work) continue;
        const img = await load(work.image);
        const w = p.w * W;
        const h = (w * img.naturalHeight) / img.naturalWidth;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.38)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 14;
        ctx.drawImage(img, p.x * W, p.y * H, w, h);
        ctx.restore();
      }
    } catch {
      return setStatus("One of the images couldn't be loaded, so the mockup wasn't saved.");
    }
    ctx.fillStyle = wall.ink;
    ctx.globalAlpha = 0.5;
    ctx.font = "500 20px system-ui, sans-serif";
    ctx.fillText("EARTGALLA · CURATE YOUR WALL", 40, H - 36);
    ctx.globalAlpha = 1;
    canvas.toBlob((blob) => {
      if (!blob) return setStatus("The mockup couldn't be saved.");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "eartgalla-wall-mockup.png";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setStatus("Mockup saved to your device.");
    }, "image/png");
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 08</span>
          <span>·</span><span>SPATIAL</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">CURATE YOUR WALL</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto">
          See a few pieces together before you commit to any of them.
        </p>
      </div>

      {works.length === 0 ? (
        <p className="px-6 text-center font-editorial text-xl text-ivory/60">No pieces are ready for the wall yet.</p>
      ) : (
        <div className="px-6 md:px-10 mx-auto max-w-5xl">
          {/* THE WALL */}
          <div
            ref={wallRef}
            className="relative aspect-[16/10] w-full select-none overflow-hidden border border-ivory/10 touch-none"
            style={{ background: wall.color }}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onPointerDown={() => setSelected(null)}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(90% 80% at 50% 35%, rgba(255,255,255,0.10), rgba(0,0,0,0.14))" }}
            />
            {placed.length === 0 && (
              <p
                className="label-mono pointer-events-none absolute inset-0 flex items-center justify-center text-center opacity-45"
                style={{ color: wall.ink }}
              >
                Your wall is empty
              </p>
            )}
            {placed.map((p) => {
              const work = bySlug(p.slug);
              if (!work) return null;
              const isSel = selected === p.uid;
              return (
                <div
                  key={p.uid}
                  role="group"
                  tabIndex={0}
                  aria-label={`${work.title}. Drag to move. Arrow keys move, plus and minus resize, Delete removes.`}
                  onPointerDown={(e) => down(e, p, "move")}
                  onKeyDown={(e) => key(e, p)}
                  onFocus={() => setSelected(p.uid)}
                  className={`group absolute cursor-grab active:cursor-grabbing touch-none shadow-[0_18px_40px_-14px_rgba(0,0,0,0.5)] focus:outline-none ${
                    isSel ? "outline outline-2 outline-offset-2 outline-gold" : ""
                  }`}
                  style={{
                    left: `${p.x * 100}%`,
                    top: `${p.y * 100}%`,
                    width: `${p.w * 100}%`,
                    aspectRatio: `${work.width} / ${work.height}`,
                  }}
                >
                  <Image src={work.image} alt="" fill sizes="30vw" draggable={false} className="pointer-events-none object-contain" />
                  <button
                    type="button"
                    aria-label={`Remove ${work.title}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      setPlaced((ps) => ps.filter((q) => q.uid !== p.uid));
                      setSelected(null);
                    }}
                    className={`absolute -right-3 -top-3 grid h-8 w-8 place-items-center rounded-full bg-charcoal text-ivory shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                      isSel ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                  <span
                    aria-hidden="true"
                    onPointerDown={(e) => down(e, p, "resize")}
                    className={`absolute -bottom-3 -right-3 grid h-8 w-8 cursor-nwse-resize place-items-center touch-none transition-opacity group-hover:opacity-100 ${
                      isSel ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full border-2 border-charcoal bg-gold shadow" />
                  </span>
                  <span className="sr-only">{`${Math.round(hFrac(p) * 100)}% of the wall's height`}</span>
                </div>
              );
            })}
          </div>

          {/* CONTROLS */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={placed.length === 0}
              data-cursor="style"
              className="label-mono rounded-full border border-gold px-6 py-3 text-gold transition-colors hover:bg-gold hover:text-charcoal disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              ↓ SAVE MOCKUP
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaced([]);
                setSelected(null);
                setStatus("Wall cleared.");
              }}
              disabled={placed.length === 0}
              className="label-mono rounded-full border border-ivory/40 px-6 py-3 transition-colors hover:border-ivory disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              CLEAR WALL
            </button>
            <div className="ml-auto flex items-center gap-3 label-mono text-ivory/50" role="group" aria-label="Wall colour">
              WALL
              {WALLS.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWallId(w.id)}
                  aria-label={`${w.label} wall`}
                  aria-pressed={wallId === w.id}
                  className={`h-8 w-8 rounded-full border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    wallId === w.id ? "border-gold" : "border-ivory/25"
                  }`}
                  style={{ background: w.color }}
                />
              ))}
            </div>
          </div>
          <p className="label-mono mt-5 text-ivory/40">DRAG TO REPOSITION · GOLD HANDLE TO RESIZE · × TO REMOVE</p>

          {/* THE TRAY */}
          <p className="label-mono mt-12 mb-4 text-ivory/60">TAP A PIECE BELOW TO ADD IT TO YOUR WALL</p>
          <ul className="grid grid-cols-5 gap-2 md:gap-4">
            {works.map((w) => {
              const on = placed.some((p) => p.slug === w.slug);
              return (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => toggle(w)}
                    aria-pressed={on}
                    aria-label={`${on ? "Remove" : "Add"} ${w.title} ${on ? "from" : "to"} your wall`}
                    data-cursor="view"
                    className={`relative block aspect-[4/5] w-full overflow-hidden bg-black/30 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                      on ? "opacity-40" : "hover:opacity-80"
                    }`}
                  >
                    <Image src={w.image} alt="" fill sizes="(max-width: 768px) 20vw, 180px" className="object-contain p-1.5" />
                    {on && (
                      <span className="label-mono absolute inset-x-0 bottom-1 text-center !text-[0.65rem] text-gold">ON WALL</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="sr-only" aria-live="polite">
            {status}
          </p>
        </div>
      )}
    </section>
  );
}
