"use client";
import { useState, type Dispatch } from "react";
import { hslToRgb, parseHex, readableOn, rgbCss, rgbToHex, rgbToHsl, sameRgb, type RGB } from "@/lib/borrowedpalette/color";
import { rolesOf, temperatureOf } from "@/lib/borrowedpalette/extract";
import { BACKGROUNDS, MAX_LAYERS, type StudioDoc } from "@/lib/borrowedpalette/doc";
import { BRUSH_DEFAULTS, isPaintTool, TOOLS, type BrushSettings, type PaintTool, type ToolId } from "@/lib/borrowedpalette/engine";
import type { PaletteAction, PaletteModel } from "@/lib/borrowedpalette/paletteModel";
import { evolve, HARMONIES, harmonyFor, type Evolution } from "@/lib/borrowedpalette/variations";
import { copyText } from "./browser";
import type { Mode } from "./types";

const btn = "label-mono min-h-11 border border-ivory/25 px-3 text-[0.7rem] text-ivory/80 transition-colors hover:border-gold hover:text-ivory disabled:opacity-35 disabled:pointer-events-none";
const H = ({ id, children }: { id: string; children: React.ReactNode }) => <h3 id={id} className="label-mono mb-3 text-ivory/60">{children}</h3>;

/* ───────────── Colour inspector ───────────── */
export function ColourInspector({ model, dispatch, color, onColor, mode, notify }: { model: PaletteModel; dispatch: Dispatch<PaletteAction>; color: RGB; onColor: (c: RGB) => void; mode: Mode; notify: (m: string) => void }) {
  const entry = model.entries.find((e) => sameRgb(e.rgb, color));
  const hex = rgbToHex(color), hsl = rgbToHsl(color);
  const roles = entry ? rolesOf(model.entries.map((e) => ({ hex: rgbToHex(e.rgb), rgb: e.rgb, hsl: rgbToHsl(e.rgb), share: e.share, temperature: temperatureOf(rgbToHsl(e.rgb)) }))).get(hex) : undefined;
  const free = mode === "free" || mode === "evolve";
  const [custom, setCustom] = useState("");
  const [harmony, setHarmony] = useState(HARMONIES[0].kind);
  const copy = async (text: string, what: string) => notify((await copyText(text)) ? `${what} copied` : "Couldn’t copy. Select the value and copy it by hand.");
  const idx = entry ? model.entries.indexOf(entry) : -1;

  return (
    <section aria-labelledby="bp-ci">
      <H id="bp-ci">SELECTED COLOUR</H>
      <div className="bp-pop flex items-stretch gap-4" key={hex}>
        <div className="h-24 w-24 flex-none border border-ivory/20" style={{ background: rgbCss(color) }} aria-hidden>
          <span className="label-mono block p-2 text-[0.65rem]" style={{ color: readableOn(color) }}>{hex}</span>
        </div>
        <dl className="min-w-0 flex-1 space-y-1 text-sm">
          {([["HEX", hex], ["RGB", `${color.r}, ${color.g}, ${color.b}`], ["HSL", `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`]] as const).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-2">
              <dt className="label-mono text-[0.65rem] text-ivory/50">{k}</dt>
              <dd className="flex items-center gap-2"><span className="tabular-nums">{v}</span>
                <button type="button" onClick={() => copy(k === "HEX" ? v : k === "RGB" ? `rgb(${v})` : `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%)`, k)} aria-label={`Copy ${k} value`} className="label-mono min-h-11 min-w-11 text-[0.6rem] text-gold hover:underline">COPY</button></dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="label-mono mt-3 text-[0.65rem] leading-relaxed text-ivory/60">
        {entry ? <>
          {entry.custom ? "ADDED BY YOU" : `${Math.round(entry.share * 100)}% OF THE ARTWORK’S SAMPLED COLOUR`}
          {roles && ` · ${roles.join(" · ").toUpperCase()}`} · {temperatureOf(hsl).toUpperCase()}
          {entry.locked && " · LOCKED"}
        </> : "NOT IN THE PALETTE YET"}
      </p>

      {entry ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={btn} onClick={() => dispatch({ type: "lock", id: entry.id })} aria-pressed={entry.locked}>{entry.locked ? "UNLOCK" : "LOCK"}</button>
          <button type="button" className={btn} disabled={idx <= 0} onClick={() => dispatch({ type: "move", id: entry.id, dir: -1 })} aria-label="Move this colour earlier in the palette">← EARLIER</button>
          <button type="button" className={btn} disabled={idx >= model.entries.length - 1} onClick={() => dispatch({ type: "move", id: entry.id, dir: 1 })} aria-label="Move this colour later in the palette">LATER →</button>
          <button type="button" className={btn} disabled={model.entries.length <= 1} onClick={() => dispatch({ type: "remove", id: entry.id })}>REMOVE</button>
        </div>
      ) : free && (
        <button type="button" className={`${btn} mt-3`} onClick={() => dispatch({ type: "addCustom", rgb: color })}>ADD TO PALETTE</button>
      )}

      {free && (
        <div className="mt-5">
          <label htmlFor="bp-hex" className="label-mono text-[0.65rem] text-ivory/50">ADD YOUR OWN COLOUR</label>
          <div className="mt-1 flex gap-2">
            <input aria-label="Pick a colour" type="color" value={hex.toLowerCase()} onChange={(e) => { const c = parseHex(e.target.value); if (c) onColor(c); }} className="h-11 w-14 flex-none cursor-pointer border border-ivory/25 bg-transparent p-0.5" />
            <input id="bp-hex" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="#B8974F" maxLength={7} inputMode="text" autoCapitalize="characters"
              onKeyDown={(e) => { if (e.key === "Enter") { const c = parseHex(custom); if (c) { onColor(c); dispatch({ type: "addCustom", rgb: c }); setCustom(""); } else notify("Type a HEX colour like #B8974F"); } }}
              className="min-h-11 min-w-0 flex-1 border border-ivory/25 bg-transparent px-3 text-sm focus:border-gold focus:outline-none" />
            <button type="button" className={btn} onClick={() => { const c = parseHex(custom); if (c) { onColor(c); dispatch({ type: "addCustom", rgb: c }); setCustom(""); } else notify("Type a HEX colour like #B8974F"); }}>ADD</button>
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="label-mono mb-2 text-[0.65rem] text-ivory/50">HARMONY SUGGESTIONS FOR THIS COLOUR</p>
        <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Harmony type">
          {HARMONIES.map((h) => <button key={h.kind} type="button" onClick={() => setHarmony(h.kind)} aria-pressed={harmony === h.kind} className={`label-mono min-h-11 border px-2.5 text-[0.65rem] ${harmony === h.kind ? "border-gold text-gold" : "border-ivory/20 text-ivory/65"}`}>{h.label}</button>)}
        </div>
        <ul className="flex gap-2">
          {harmonyFor(color, harmony).map((c, i) => (
            <li key={i}><button type="button" onClick={() => { if (free) { onColor(c); } else notify("In this challenge you stay inside the palette."); }} aria-label={`Use harmony colour ${rgbToHex(c)}`} className="h-11 w-11 border border-ivory/25" style={{ background: rgbCss(c) }} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ───────────── Evolution sliders ───────────── */
export function EvolutionControls({ model, dispatch }: { model: PaletteModel; dispatch: Dispatch<PaletteAction> }) {
  const e = model.evolution;
  const row = (key: keyof Evolution, label: string, lo: string, hi: string) => (
    <div>
      <label htmlFor={`bp-ev-${key}`} className="label-mono flex justify-between text-[0.65rem] text-ivory/60"><span>{label}</span><span className="tabular-nums">{e[key] > 0 ? "+" : ""}{e[key]}</span></label>
      <input id={`bp-ev-${key}`} type="range" min={-100} max={100} step={1} value={e[key]} onChange={(ev) => dispatch({ type: "evolution", value: { [key]: Number(ev.target.value) } })} className="bp-range h-11 w-full" />
      <div className="label-mono flex justify-between text-[0.55rem] text-ivory/35"><span>{lo}</span><span>{hi}</span></div>
    </div>
  );
  const changed = e.saturation !== 0 || e.temperature !== 0 || e.brightness !== 0;
  return (
    <div className="space-y-2 border border-gold/30 p-4">
      {row("saturation", "SATURATION", "GREYER", "RICHER")}
      {row("temperature", "TEMPERATURE", "COOLER", "WARMER")}
      {row("brightness", "BRIGHTNESS", "DARKER", "LIGHTER")}
      <div className="flex items-center justify-between gap-3 pt-1">
        <span aria-hidden className="flex">{model.entries.map((x) => <span key={x.id} className="h-6 w-6" style={{ background: rgbCss(x.rgb) }} />)}</span>
        <button type="button" className={btn} disabled={!changed} onClick={() => dispatch({ type: "resetEvolution" })}>BACK TO ORIGINAL</button>
      </div>
      <p className="text-xs text-ivory/50">The colours the artist’s work gave you are never overwritten: all-zero is always the original.</p>
    </div>
  );
}
export { evolve, hslToRgb };

/* ───────────── Brush settings ───────────── */
export function BrushPanel({ tool, tools, onChange }: { tool: ToolId; tools: Record<PaintTool, BrushSettings>; onChange: (t: PaintTool, v: Partial<BrushSettings>) => void }) {
  const info = TOOLS.find((t) => t.id === tool)!;
  if (!isPaintTool(tool)) {
    return (
      <section aria-labelledby="bp-br"><H id="bp-br">{info.label.toUpperCase()}</H>
        <p className="text-sm text-ivory/65">{info.hint}.{tool === "fill" ? " Tap inside an enclosed area. It fills what you see, across all visible layers, onto the current layer." : tool === "hand" ? " You can also hold Space, or use two fingers." : ""}</p>
        {tool === "fill" && <FillOpacity tools={tools} onChange={onChange} />}
      </section>
    );
  }
  const s = tools[tool], d = BRUSH_DEFAULTS[tool];
  return (
    <section aria-labelledby="bp-br">
      <H id="bp-br">{info.label.toUpperCase()} · {info.hint.toUpperCase()}</H>
      <div className="space-y-3">
        <Slider id="bp-size-r" label="SIZE" value={s.size} min={d.min} max={d.max} unit="px" onChange={(v) => onChange(tool, { size: v })} extra={<span aria-hidden className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden border border-ivory/15"><span className="rounded-full bg-ivory" style={{ width: Math.min(52, Math.max(2, s.size)), height: Math.min(52, Math.max(2, s.size)), opacity: s.opacity }} /></span>} />
        <Slider id="bp-op-r" label="OPACITY" value={Math.round(s.opacity * 100)} min={5} max={100} unit="%" onChange={(v) => onChange(tool, { opacity: v / 100 })} />
        <Slider id="bp-sm-r" label="SMOOTHNESS" value={Math.round(s.smoothing * 100)} min={0} max={100} unit="%" onChange={(v) => onChange(tool, { smoothing: v / 100 })} />
        {tool !== "eraser" || true ? (
          <label className="flex min-h-11 items-center gap-3 text-sm text-ivory/75">
            <input type="checkbox" checked={s.pressure} onChange={(e) => onChange(tool, { pressure: e.target.checked })} className="h-5 w-5 accent-[var(--color-gold)]" />
            Pen pressure <span className="text-xs text-ivory/40">(needs a pressure-sensitive pen)</span>
          </label>
        ) : null}
      </div>
    </section>
  );
}
function FillOpacity({ tools, onChange }: { tools: Record<PaintTool, BrushSettings>; onChange: (t: PaintTool, v: Partial<BrushSettings>) => void }) {
  return <div className="mt-3"><Slider id="bp-fill-op" label="OPACITY" value={Math.round(tools.brush.opacity * 100)} min={5} max={100} unit="%" onChange={(v) => onChange("brush", { opacity: v / 100 })} /></div>;
}
function Slider({ id, label, value, min, max, unit, onChange, extra }: { id: string; label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="label-mono flex justify-between text-[0.65rem] text-ivory/60"><span>{label}</span><span className="tabular-nums">{value}{unit}</span></label>
        <input id={id} type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="bp-range h-11 w-full" />
      </div>
      {extra}
    </div>
  );
}

/* ───────────── Layers + canvas ───────────── */
export function LayerPanel({ doc, notify }: { doc: StudioDoc; notify: (m: string) => void }) {
  const active = doc.active;
  const idx = doc.layers.indexOf(active);
  const rows = [...doc.layers].reverse();
  return (
    <section aria-labelledby="bp-ly">
      <H id="bp-ly">LAYERS · {doc.layers.length}/{MAX_LAYERS}</H>
      <ul className="space-y-1" aria-label="Layers, top first">
        {rows.map((l) => (
          <li key={l.id} className={`flex items-center gap-1 border ${l.id === active.id ? "border-gold bg-gold/5" : "border-ivory/15"}`}>
            <button type="button" onClick={() => doc.updateLayer(l.id, { visible: !l.visible })} aria-pressed={l.visible} aria-label={`${l.visible ? "Hide" : "Show"} ${l.name}`} className="label-mono min-h-11 min-w-11 text-[0.65rem] text-ivory/70">{l.visible ? "SHOW" : "HIDE"}</button>
            <button type="button" onClick={() => doc.setActive(l.id)} aria-pressed={l.id === active.id} className="min-h-11 min-w-0 flex-1 truncate px-1 text-left text-sm">{l.name}</button>
            <button type="button" onClick={() => doc.updateLayer(l.id, { locked: !l.locked })} aria-pressed={l.locked} aria-label={`${l.locked ? "Unlock" : "Lock"} ${l.name}`} className="label-mono min-h-11 min-w-11 text-[0.65rem] text-ivory/70">{l.locked ? "LOCKED" : "LOCK"}</button>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <label htmlFor="bp-lname" className="label-mono text-[0.65rem] text-ivory/50">NAME</label>
        <input id="bp-lname" value={active.name} maxLength={24} onChange={(e) => doc.updateLayer(active.id, { name: e.target.value })} className="mb-2 min-h-11 w-full border border-ivory/25 bg-transparent px-3 text-sm focus:border-gold focus:outline-none" />
        <Slider id="bp-lop" label="LAYER OPACITY" value={Math.round(active.opacity * 100)} min={5} max={100} unit="%" onChange={(v) => doc.updateLayer(active.id, { opacity: v / 100 })} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={() => { if (!doc.addLayer()) notify(`Up to ${MAX_LAYERS} layers keeps the studio quick.`); }}>+ NEW</button>
        <button type="button" className={btn} onClick={() => { if (!doc.duplicateLayer(active.id)) notify(`Up to ${MAX_LAYERS} layers.`); }}>DUPLICATE</button>
        <button type="button" className={btn} disabled={idx >= doc.layers.length - 1} onClick={() => doc.moveLayer(active.id, 1)}>RAISE</button>
        <button type="button" className={btn} disabled={idx <= 0} onClick={() => doc.moveLayer(active.id, -1)}>LOWER</button>
        <button type="button" className={btn} disabled={idx <= 0} onClick={() => doc.mergeDown(active.id)}>MERGE DOWN</button>
        <button type="button" className={btn} disabled={doc.layers.length <= 1} onClick={() => doc.removeLayer(active.id)}>DELETE</button>
      </div>
    </section>
  );
}

export function CanvasPanel({ doc, grid, onGrid, onClear, onDuplicate, onNew }: { doc: StudioDoc; grid: boolean; onGrid: (v: boolean) => void; onClear: () => void; onDuplicate: () => void; onNew: () => void }) {
  const bg = doc.background;
  return (
    <section aria-labelledby="bp-cv">
      <H id="bp-cv">CANVAS · {doc.width} × {doc.height}</H>
      <p className="label-mono mb-2 text-[0.65rem] text-ivory/50">BACKGROUND</p>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Canvas background">
        {BACKGROUNDS.map((b) => (
          <button key={b.id} type="button" onClick={() => doc.setBackground(b.value)} aria-pressed={bg === b.value} aria-label={`${b.label} background`} title={b.label}
            className={`h-11 w-11 border-2 ${bg === b.value ? "border-gold" : "border-ivory/25"}`} style={b.value ? { background: b.value } : { backgroundImage: "conic-gradient(#d9d9d9 25%, #fff 0 50%, #d9d9d9 0 75%, #fff 0)", backgroundSize: "12px 12px" }} />
        ))}
        <input type="color" aria-label="Custom background colour" value={bg ?? "#ffffff"} onChange={(e) => doc.setBackground(e.target.value.toUpperCase())} className="h-11 w-11 cursor-pointer border border-ivory/25 bg-transparent p-0.5" />
      </div>
      <label className="mt-3 flex min-h-11 items-center gap-3 text-sm text-ivory/75">
        <input type="checkbox" checked={grid} onChange={(e) => onGrid(e.target.checked)} className="h-5 w-5 accent-[var(--color-gold)]" /> Show grid
      </label>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" className={btn} onClick={onDuplicate}>DUPLICATE ARTWORK</button>
        <button type="button" className={btn} onClick={onNew}>NEW CANVAS…</button>
        <button type="button" className={`${btn} hover:!border-kenya-red`} onClick={onClear}>CLEAR CANVAS</button>
      </div>
    </section>
  );
}
