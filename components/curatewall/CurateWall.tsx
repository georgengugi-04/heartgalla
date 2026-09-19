"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { artworks } from "@/lib/data";

const TRAY_SLUGS = [
  "happiness", "guardians-of-the-plain", "mountain-solitude", "the-spearman",
  "bloom-beneath-the-surface", "unbound", "the-royals", "queen-of-hearts",
  "two-skies", "golden-gaze",
];
const TRAY = TRAY_SLUGS.map((s) => artworks.find((a) => a.slug === s)).filter(
  (a): a is (typeof artworks)[number] => !!a
);

const MIN_SIZE = 80;
const MAX_SIZE = 260;
const DEFAULT_SIZE = 150;

type PlacedItem = {
  uid: string;
  artwork: (typeof artworks)[number];
  x: number;
  y: number;
  size: number;
  z: number;
};

export default function CurateWall() {
  const [items, setItems] = useState<PlacedItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const wallRef = useRef<HTMLDivElement>(null);
  const zCounter = useRef(1);
  const uidCounter = useRef(1);

  function bringToFront(uid: string) {
    zCounter.current += 1;
    setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, z: zCounter.current } : it)));
  }

  function addFromTray(artwork: (typeof artworks)[number]) {
    const wall = wallRef.current;
    const wallW = wall?.clientWidth ?? 600;
    const wallH = wall?.clientHeight ?? 400;
    const n = items.length;
    zCounter.current += 1;
    uidCounter.current += 1;
    const size = DEFAULT_SIZE;
    const x = Math.min(wallW - size - 10, 30 + (n % 5) * 28);
    const y = Math.min(wallH - size * 1.33 - 10, 30 + (n % 4) * 22);
    setItems((prev) => [
      ...prev,
      { uid: `w${uidCounter.current}`, artwork, x: Math.max(10, x), y: Math.max(10, y), size, z: zCounter.current },
    ]);
  }

  function removeItem(uid: string) {
    setItems((prev) => prev.filter((it) => it.uid !== uid));
  }

  function clearWall() {
    setItems([]);
  }

  function startDrag(e: React.PointerEvent, uid: string) {
    e.preventDefault();
    e.stopPropagation();
    bringToFront(uid);
    const wall = wallRef.current;
    if (!wall) return;
    const wallW = wall.clientWidth, wallH = wall.clientHeight;
    const item = items.find((it) => it.uid === uid);
    if (!item) return;
    const startX = e.clientX, startY = e.clientY;
    const origX = item.x, origY = item.y;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      setItems((prev) =>
        prev.map((it) =>
          it.uid === uid
            ? {
                ...it,
                x: Math.max(0, Math.min(wallW - it.size, origX + dx)),
                y: Math.max(0, Math.min(wallH - it.size * 1.33, origY + dy)),
              }
            : it
        )
      );
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function startResize(e: React.PointerEvent, uid: string) {
    e.preventDefault();
    e.stopPropagation();
    bringToFront(uid);
    const item = items.find((it) => it.uid === uid);
    if (!item) return;
    const startX = e.clientX;
    const origSize = item.size;

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX;
      const size = Math.max(MIN_SIZE, Math.min(MAX_SIZE, origSize + dx));
      setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, size } : it)));
    }
    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  async function saveMockup() {
    const wall = wallRef.current;
    if (!wall || items.length === 0) return;
    setSaving(true);
    setSaveError(false);
    try {
      const rect = wall.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement("canvas");
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#e9e3d6";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const sorted = [...items].sort((a, b) => a.z - b.z);
      for (const it of sorted) {
        const img = new window.Image();
        img.src = it.artwork.image;
        await new Promise((resolve) => {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
        });
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 6;
        ctx.drawImage(img, it.x, it.y, it.size, it.size * 1.33);
        ctx.restore();
      }

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "eartgalla-my-wall.png";
      a.click();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-14 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 09</span>
          <span>·</span><span>SPATIAL</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">CURATE YOUR WALL</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto">
          See a few pieces together before you commit to any of them.
        </p>
      </div>

      <div className="px-6 md:px-10 max-w-5xl mx-auto">
        <div
          ref={wallRef}
          className="relative w-full h-[50vh] md:h-[62vh] overflow-hidden select-none touch-none"
          style={{ background: "linear-gradient(180deg, #efe9dd 0%, #e3ddcf 100%)" }}
        >
          {items.length === 0 && (
            <p className="absolute inset-0 flex items-center justify-center label-mono text-charcoal/30 text-center px-8">
              TAP A PIECE BELOW TO ADD IT TO YOUR WALL
            </p>
          )}
          {items.map((it) => (
            <div
              key={it.uid}
              className="absolute group"
              style={{ left: it.x, top: it.y, width: it.size, height: it.size * 1.33, zIndex: it.z }}
            >
              <div
                onPointerDown={(e) => startDrag(e, it.uid)}
                className="relative w-full h-full cursor-grab active:cursor-grabbing"
                style={{ boxShadow: "0 10px 28px rgba(0,0,0,0.35)" }}
              >
                <Image
                  src={it.artwork.image}
                  alt={it.artwork.title}
                  fill
                  sizes="260px"
                  className="object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
              <button
                onClick={() => removeItem(it.uid)}
                aria-label={`Remove ${it.artwork.title} from wall`}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-charcoal text-ivory text-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
              <div
                onPointerDown={(e) => startResize(e, it.uid)}
                aria-label={`Resize ${it.artwork.title}`}
                role="slider"
                aria-valuenow={it.size}
                tabIndex={-1}
                className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full bg-gold opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity cursor-nwse-resize"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto py-6 -mx-6 px-6 md:mx-0 md:px-0">
          {TRAY.map((a) => (
            <button
              key={a.id}
              onClick={() => addFromTray(a)}
              aria-label={`Add ${a.title} to your wall`}
              data-cursor="style"
              className="relative flex-shrink-0 w-16 h-20 md:w-20 md:h-24 overflow-hidden hover:opacity-80 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <Image src={a.image} alt={a.title} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={saveMockup}
            disabled={items.length === 0 || saving}
            data-cursor="style"
            className="label-mono border border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            {saving ? "SAVING…" : "↓ SAVE MOCKUP"}
          </button>
          <button
            onClick={clearWall}
            disabled={items.length === 0}
            className="label-mono border border-ivory/40 rounded-full px-6 py-3 hover:border-ivory transition-colors disabled:opacity-20 disabled:pointer-events-none"
          >
            CLEAR WALL
          </button>
        </div>
        {saveError && (
          <p className="label-mono text-ivory/40 text-center mt-4">
            Couldn&apos;t save an image this time — the wall is still here to keep arranging.
          </p>
        )}
        <p className="label-mono text-ivory/30 text-center mt-6">
          DRAG TO REPOSITION · GOLD HANDLE TO RESIZE · × TO REMOVE
        </p>
      </div>
    </section>
  );
}
