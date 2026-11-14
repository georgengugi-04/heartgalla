"use client";
import Image from "next/image";
import { useRef, useState, type Dispatch } from "react";
import { rgbCss, rgbToHex, sameRgb, readableOn, type RGB } from "@/lib/borrowedpalette/color";
import { PALETTE_SIZES, rolesOf, swatchFromHex, temperatureOf } from "@/lib/borrowedpalette/extract";
import { rgbToHsl } from "@/lib/borrowedpalette/color";
import { LIMITED_COUNT, type PaletteAction, type PaletteModel } from "@/lib/borrowedpalette/paletteModel";
import { VARIATIONS } from "@/lib/borrowedpalette/variations";
import type { StudioArtist, StudioWork } from "@/lib/borrowedpalette/artworks";
import type { Crop } from "./browser";
import type { Mode } from "./types";

type Props = {
  artist: StudioArtist;
  work: StudioWork;
  onWork: (slug: string) => void;
  crop: Crop | null;
  onCrop: (c: Crop | null) => void;
  ignoreBg: boolean;
  onIgnoreBg: (v: boolean) => void;
  status: "loading" | "ready" | "error";
  error: string | null;
  onRetry: () => void;
  backgroundFound: string | null;
  model: PaletteModel;
  dispatch: Dispatch<PaletteAction>;
  color: RGB;
  onColor: (c: RGB) => void;
  mode: Mode;
  savedPalettes: { id: string; name: string; colors: string[] }[];
  onSavePalette: () => void;
  onApplySaved: (colors: string[]) => void;
  onDeleteSaved: (id: string) => void;
};

/** Left panel: whose colours these are, where they came from, and the palette itself. */
export default function PalettePanel(p: Props) {
  const { model, dispatch, mode } = p;
  const roles = rolesOf(model.entries.map((e) => ({ hex: rgbToHex(e.rgb), rgb: e.rgb, hsl: rgbToHsl(e.rgb), share: e.share, temperature: temperatureOf(rgbToHsl(e.rgb)) })));
  const warm = model.entries.filter((e) => temperatureOf(rgbToHsl(e.rgb)) === "warm").length;
  const cool = model.entries.filter((e) => temperatureOf(rgbToHsl(e.rgb)) === "cool").length;
  const n = model.entries.length || 1;
  const limitedMode = mode === "limited";
  const restricted = mode === "translate" || mode === "limited";

  return (
    <div className="space-y-7">
      <ArtworkHeader {...p} />

      <section aria-labelledby="bp-palette">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h3 id="bp-palette" className="label-mono text-ivory/60">{limitedMode ? `CHOOSE ${LIMITED_COUNT} · ${model.limited.length}/${LIMITED_COUNT}` : "BORROWED PALETTE"}</h3>
          {model.removed.length > 0 && <button type="button" onClick={() => dispatch({ type: "restore" })} className="label-mono min-h-11 text-[0.65rem] text-gold hover:underline">RESTORE {model.removed.length} REMOVED</button>}
        </div>
        {p.status === "loading" && <div role="status" aria-live="polite" className="grid grid-cols-4 gap-2">{Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-square animate-pulse bg-ivory/10" />)}<span className="sr-only">Reading the artwork’s colours…</span></div>}
        {p.status === "error" && (
          <div role="alert" className="border border-kenya-red/60 p-4 text-sm">
            <p>{p.error}</p>
            <button type="button" onClick={p.onRetry} className="label-mono mt-3 min-h-11 border border-ivory/40 px-5 hover:border-gold">TRY AGAIN</button>
          </div>
        )}
        {p.status === "ready" && (
          <ul className="grid grid-cols-4 gap-2" aria-label="Palette colours">
            {model.entries.map((e) => {
              const active = sameRgb(e.rgb, p.color);
              const chosen = model.limited.includes(e.id);
              const dim = limitedMode && !chosen;
              const r = roles.get(rgbToHex(e.rgb));
              const hex = rgbToHex(e.rgb);
              return (
                <li key={e.id}>
                  <button type="button"
                    onClick={() => { if (limitedMode) { dispatch({ type: "limit", id: e.id }); if (!chosen && model.limited.length < LIMITED_COUNT) p.onColor(e.rgb); } else p.onColor(e.rgb); }}
                    aria-pressed={limitedMode ? chosen : active}
                    aria-label={`${hex}${r ? `, ${r.join(" and ")}` : ""}${e.locked ? ", locked" : ""}${e.custom ? ", added by you" : ""}${limitedMode ? (chosen ? ", chosen" : ", not chosen") : ""}`}
                    className={`bp-swatch relative block aspect-square w-full min-h-11 outline-offset-2 ${active || chosen ? "scale-[1.04] ring-2 ring-gold ring-offset-2 ring-offset-charcoal" : "hover:scale-[1.05]"} ${dim ? "opacity-35" : ""}`}
                    style={{ background: rgbCss(e.rgb) }}>
                    {e.locked && <span aria-hidden className="absolute left-1 top-1 text-[0.7rem] leading-none" style={{ color: readableOn(e.rgb) }}>●</span>}
                    {r && <span aria-hidden className="label-mono absolute bottom-1 left-1 text-[0.5rem] leading-none" style={{ color: readableOn(e.rgb) }}>{r[0].slice(0, 3).toUpperCase()}</span>}
                    {limitedMode && chosen && <span aria-hidden className="absolute right-1 top-1 text-xs" style={{ color: readableOn(e.rgb) }}>✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {p.status === "ready" && (
          <p className="label-mono mt-3 text-[0.65rem] leading-relaxed text-ivory/50">
            WARM {Math.round((warm / n) * 100)}% · COOL {Math.round((cool / n) * 100)}% · NEUTRAL {Math.round(((n - warm - cool) / n) * 100)}%
            {p.backgroundFound && <><br />PLAIN BACKGROUND {p.backgroundFound} {p.ignoreBg ? "SET ASIDE" : "KEPT"}</>}
          </p>
        )}
      </section>

      <section aria-labelledby="bp-size">
        <h3 id="bp-size" className="label-mono mb-3 text-ivory/60">PALETTE SIZE</h3>
        <div role="group" aria-label="Palette size" className="grid grid-cols-5 gap-1.5">
          {PALETTE_SIZES.map(({ size, label }) => (
            <button key={size} type="button" onClick={() => dispatch({ type: "size", size })} aria-pressed={model.size === size} title={label}
              className={`label-mono min-h-11 border px-0 transition-colors ${model.size === size ? "border-gold bg-gold/10 text-gold" : "border-ivory/20 text-ivory/70 hover:border-ivory/50"}`}>{size}</button>
          ))}
        </div>
        <p className="label-mono mt-2 text-[0.65rem] text-ivory/50">{PALETTE_SIZES.find((s) => s.size === model.size)?.label.toUpperCase()}{model.entries.length < model.size && p.status === "ready" ? ` · THIS WORK ONLY HAS ${model.pool.length} DISTINCT COLOURS` : ""}</p>
      </section>

      <SampleControls {...p} />

      {!restricted && mode !== "evolve" && (
        <section aria-labelledby="bp-var">
          <h3 id="bp-var" className="label-mono mb-3 text-ivory/60">VARIATIONS</h3>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Palette variations">
            {VARIATIONS.map((v) => (
              <button key={v.kind} type="button" title={v.hint} onClick={() => dispatch({ type: "variation", kind: v.kind })} aria-pressed={model.variation === v.kind}
                className={`label-mono min-h-11 border px-3 text-[0.7rem] transition-colors ${model.variation === v.kind ? "border-gold bg-gold/10 text-gold" : "border-ivory/20 text-ivory/70 hover:border-ivory/50"}`}>{v.label}</button>
            ))}
          </div>
          <p className="label-mono mt-2 text-[0.65rem] text-ivory/50">LOCKED COLOURS (●) STAY EXACTLY AS THEY ARE.</p>
        </section>
      )}

      {!restricted && (
        <section aria-labelledby="bp-mine">
          <h3 id="bp-mine" className="label-mono mb-3 text-ivory/60">MY PALETTES</h3>
          <button type="button" onClick={p.onSavePalette} disabled={model.entries.length === 0} className="label-mono min-h-11 w-full border border-ivory/30 px-4 hover:border-gold disabled:opacity-40">SAVE THIS PALETTE</button>
          {p.savedPalettes.length === 0 ? <p className="mt-2 text-xs text-ivory/50">Palettes you save stay on this device.</p> : (
            <ul className="mt-3 space-y-2">
              {p.savedPalettes.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => p.onApplySaved(s.colors)} aria-label={`Use saved palette ${s.name}`} className="flex min-h-11 flex-1 items-center gap-3 border border-ivory/15 px-2 text-left hover:border-gold">
                    <span className="flex">{s.colors.slice(0, 8).map((c, i) => <span key={i} className="h-5 w-3" style={{ background: c }} />)}</span>
                    <span className="truncate text-xs text-ivory/70">{s.name}</span>
                  </button>
                  <button type="button" onClick={() => p.onDeleteSaved(s.id)} aria-label={`Delete saved palette ${s.name}`} className="label-mono min-h-11 min-w-11 text-ivory/50 hover:text-kenya-red">✕</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function ArtworkHeader({ artist, work, crop, onCrop }: Props) {
  const [aspect, setAspect] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [live, setLive] = useState<Crop | null>(null);
  const frac = (e: React.PointerEvent) => { const r = box.current!.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; };
  const shown = live ?? crop;
  return (
    <section aria-labelledby="bp-art" className="flex gap-4 lg:block">
      <div className="w-28 flex-none lg:w-full">
        <h3 id="bp-art" className="label-mono mb-3 hidden text-ivory/60 lg:block">COLOURS BORROWED FROM</h3>
        <div ref={box} className="relative mx-auto touch-none select-none bg-black/30"
          style={{ width: `min(100%, ${9.5 * aspect}rem)`, aspectRatio: String(aspect), cursor: "crosshair" }}
          title="Drag to choose which part of the artwork to read colours from"
          onPointerDown={(e) => { box.current?.setPointerCapture(e.pointerId); drag.current = frac(e); setLive(null); }}
          onPointerMove={(e) => { if (!drag.current) return; const a = drag.current, b = frac(e); setLive({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) }); }}
          onPointerUp={() => { drag.current = null; if (live && live.w > 0.08 && live.h > 0.08) onCrop(live); else if (live === null) onCrop(null); setLive(null); }}
          onPointerCancel={() => { drag.current = null; setLive(null); }}>
          <Image src={work.image} alt={`${work.title}, by ${artist.name}`} fill sizes="200px" draggable={false} className="pointer-events-none object-contain"
            onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth) setAspect(i.naturalWidth / i.naturalHeight); }} />
          {shown && <div aria-hidden className="pointer-events-none absolute border-2 border-gold" style={{ left: `${shown.x * 100}%`, top: `${shown.y * 100}%`, width: `${shown.w * 100}%`, height: `${shown.h * 100}%`, boxShadow: "0 0 0 999px rgba(0,0,0,0.6)" }} />}
        </div>
      </div>
      <div className="min-w-0 flex-1 lg:mt-3">
        <p className="label-mono text-[0.65rem] text-ivory/50 lg:hidden">COLOURS BORROWED FROM</p>
        <p className="font-editorial text-xl leading-tight">{work.title}</p>
        <p className="label-mono mt-1 text-[0.7rem] text-ivory/60">BY {artist.name.toUpperCase()}</p>
        {artist.status === "pending" && <p className="mt-1 text-xs text-ivory/50">EARTGALLA is still confirming this artist’s profile and attribution.</p>}
        <p className="mt-2 text-xs leading-relaxed text-ivory/50">Borrowing colours isn’t permission to copy or sell the artwork. It stays {artist.name.split(" ")[0]}’s.</p>
      </div>
    </section>
  );
}

function SampleControls({ artist, work, onWork, crop, onCrop, ignoreBg, onIgnoreBg }: Props) {
  return (
    <section aria-labelledby="bp-sample">
      <h3 id="bp-sample" className="label-mono mb-2 text-ivory/60">WHAT TO SAMPLE</h3>
      <div className="flex flex-wrap items-center gap-x-3">
        <span className="label-mono text-[0.65rem] text-ivory/50">{crop ? "SAMPLING THE SELECTED AREA" : "DRAG ON THE ARTWORK TO CHOOSE AN AREA"}</span>
        {crop ? <button type="button" onClick={() => onCrop(null)} className="label-mono min-h-11 text-[0.65rem] text-gold hover:underline">WHOLE IMAGE</button>
          : <button type="button" onClick={() => onCrop({ x: 0.15, y: 0.15, w: 0.7, h: 0.7 })} className="label-mono min-h-11 text-[0.65rem] text-gold hover:underline">CENTRE 70%</button>}
      </div>
      <p className="text-xs leading-relaxed text-ivory/45">Photos of paintings often include a wall, a rug or a hand. Choose just the painting to borrow its colours, not its surroundings.</p>
      <label className="mt-1 flex min-h-11 items-center gap-3 text-sm text-ivory/75">
        <input type="checkbox" checked={ignoreBg} onChange={(e) => onIgnoreBg(e.target.checked)} className="h-5 w-5 accent-[var(--color-gold)]" />
        Ignore a plain background
      </label>
      {artist.works.length > 1 && (
        <div className="mt-2">
          <p className="label-mono mb-2 text-[0.65rem] text-ivory/50">OTHER WORKS BY {artist.name.split(" ")[0].toUpperCase()}</p>
          <ul className="flex gap-2 overflow-x-auto pb-2" aria-label={`Works by ${artist.name}`}>
            {artist.works.map((w) => (
              <li key={w.slug} className="flex-none">
                <button type="button" onClick={() => onWork(w.slug)} aria-label={`Borrow from ${w.title}`} aria-pressed={w.slug === work.slug}
                  className={`relative block h-16 w-16 overflow-hidden border-2 ${w.slug === work.slug ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  <Image src={w.image} alt="" fill sizes="64px" className="object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export { swatchFromHex };
