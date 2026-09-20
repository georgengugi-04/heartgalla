"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { artists, artworks } from "@/lib/data";
import { extractPalette, rgbToCss, RGB } from "@/lib/palette";

// two representative real works per artist — their palette is merged into one
// small "signature" set. Nothing here claims to teach their technique, only
// borrows their colors.
const REF_SLUGS: Record<string, string[]> = {
  lenny: ["happiness", "tiger-in-frost"],
  john: ["the-royals", "queen-of-hearts"],
  alvin: ["unbound", "golden-gaze"],
};

const BRUSH_SIZES = [4, 10, 20];

export default function BorrowedPalette() {
  const [artistId, setArtistId] = useState(artists[0].id);
  const [palette, setPalette] = useState<RGB[]>([]);
  const [color, setColor] = useState<RGB>({ r: 184, g: 151, b: 79 });
  const [brushSize, setBrushSize] = useState(10);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [saving, setSaving] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const loadedImgsRef = useRef<Record<string, HTMLImageElement[]>>({});

  const artist = artists.find((a) => a.id === artistId)!;

  // size the canvas once, crisp at device pixel ratio, and give it a blank
  // paper base so undo/clear always has something sane to return to
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function resize() {
      const c = canvasRef.current;
      const parent = c?.parentElement;
      if (!c || !parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const prevDrawing = hasDrawn ? c.toDataURL() : null;
      c.width = parent.clientWidth * dpr;
      c.height = parent.clientHeight * dpr;
      c.style.width = parent.clientWidth + "px";
      c.style.height = parent.clientHeight + "px";
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#f4f0e6";
      ctx.fillRect(0, 0, parent.clientWidth, parent.clientHeight);
      if (prevDrawing) {
        const img = new window.Image();
        img.onload = () => ctx.drawImage(img, 0, 0, parent.clientWidth, parent.clientHeight);
        img.src = prevDrawing;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // build the artist's signature palette from their real reference works
  useEffect(() => {
    let cancelled = false;
    async function build() {
      const slugs = REF_SLUGS[artistId] ?? [];
      const refs = slugs.map((s) => artworks.find((a) => a.slug === s)).filter(Boolean);
      const collected: RGB[] = [];
      for (const ref of refs) {
        if (!ref) continue;
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = ref.image;
        await new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
        });
        loadedImgsRef.current[artistId] = [...(loadedImgsRef.current[artistId] ?? []), img];
        try {
          collected.push(...extractPalette(img, 4));
        } catch {
          // graceful fallback below covers this
        }
      }
      if (cancelled) return;
      const finalPalette = collected.length > 0 ? collected : [{ r: 184, g: 151, b: 79 }, { r: 90, g: 70, b: 60 }];
      setPalette(finalPalette);
      setColor(finalPalette[0]);
    }
    build();
    return () => {
      cancelled = true;
    };
  }, [artistId]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function pushUndoSnapshot() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current = [...undoStackRef.current, snap].slice(-20);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    pushUndoSnapshot();
    drawingRef.current = true;
    const p = getPoint(e);
    lastPointRef.current = p;
    // a single dab so a tap/click leaves a mark even with no drag
    ctx.save();
    ctx.fillStyle = rgbToCss(color);
    ctx.beginPath();
    ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    setHasDrawn(true);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !lastPointRef.current) return;
    const p = getPoint(e);
    ctx.save();
    ctx.strokeStyle = rgbToCss(color);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // soft painterly bleed rather than a hard vector line
    ctx.shadowColor = rgbToCss(color, 0.5);
    ctx.shadowBlur = brushSize * 0.5;
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.restore();
    lastPointRef.current = p;
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastPointRef.current = null;
  }

  function undo() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const snap = undoStackRef.current.pop();
    if (snap) ctx.putImageData(snap, 0, 0);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    pushUndoSnapshot();
    const parent = canvas.parentElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.fillStyle = "#f4f0e6";
    ctx.fillRect(0, 0, (parent?.clientWidth ?? canvas.width) * dpr, (parent?.clientHeight ?? canvas.height) * dpr);
    setHasDrawn(false);
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "eartgalla-borrowed-palette.png";
      a.click();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-14 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 09</span>
          <span>·</span><span>CREATE</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE BORROWED PALETTE</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto">
          Their colors, in your hand. Not a lesson — just a loan.
        </p>
      </div>

      <div className="px-6 md:px-10 max-w-4xl mx-auto">
        {/* artist selector — pick whose real palette you're borrowing */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {artists.map((a) => (
            <button
              key={a.id}
              onClick={() => setArtistId(a.id)}
              aria-pressed={artistId === a.id}
              className={`label-mono border rounded-full px-5 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                artistId === a.id ? "border-gold text-gold bg-gold/10" : "border-ivory/25 text-ivory/60 hover:text-ivory"
              }`}
            >
              {a.name.toUpperCase()}
            </button>
          ))}
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-[42vh] md:h-[52vh] touch-none cursor-crosshair"
        />

        {/* palette swatches from this artist's real work */}
        <div className="flex items-center justify-center gap-3 flex-wrap mt-6">
          {palette.map((c, i) => (
            <button
              key={i}
              onClick={() => setColor(c)}
              aria-label={`Use this color from ${artist.name}'s palette`}
              aria-pressed={color.r === c.r && color.g === c.g && color.b === c.b}
              className="w-9 h-9 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: rgbToCss(c), borderColor: color === c ? "#c9a24a" : "rgba(255,255,255,0.15)" }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <div className="flex items-center gap-2">
            {BRUSH_SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setBrushSize(s)}
                aria-label={`Brush size ${s}`}
                aria-pressed={brushSize === s}
                className={`rounded-full border flex items-center justify-center transition-colors ${
                  brushSize === s ? "border-gold" : "border-ivory/25"
                }`}
                style={{ width: 32, height: 32 }}
              >
                <span className="rounded-full bg-ivory/70" style={{ width: s * 0.7, height: s * 0.7 }} />
              </button>
            ))}
          </div>

          <button onClick={undo} className="label-mono border border-ivory/40 rounded-full px-5 py-2.5 hover:border-ivory transition-colors">
            UNDO
          </button>
          <button onClick={clearCanvas} className="label-mono border border-ivory/40 rounded-full px-5 py-2.5 hover:border-ivory transition-colors">
            CLEAR
          </button>
          <button
            onClick={save}
            disabled={!hasDrawn || saving}
            data-cursor="style"
            className="label-mono border border-gold text-gold rounded-full px-6 py-2.5 hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            {saving ? "SAVING…" : "↓ SAVE"}
          </button>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8 opacity-60">
          <div className="relative w-8 h-10 overflow-hidden rounded-sm bg-gold/10 flex items-center justify-center">
            {artist.portrait ? (
              <Image src={artist.portrait} alt={artist.name} fill sizes="32px" className="object-cover" />
            ) : (
              <span className="font-editorial text-gold text-xs">
                {artist.name.split(" ").map((w) => w[0]).join("")}
              </span>
            )}
          </div>
          <p className="label-mono text-ivory/40">PALETTE DRAWN FROM {artist.name.toUpperCase()}&apos;S REAL WORK</p>
        </div>
      </div>
    </section>
  );
}
