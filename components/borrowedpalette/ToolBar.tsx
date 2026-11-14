"use client";
import { TOOLS, type ToolId } from "@/lib/borrowedpalette/engine";

export type Panel = "palette" | "brush" | "layers" | null;
type Props = {
  tool: ToolId; onTool: (t: ToolId) => void;
  canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void;
  zoom: number; onZoomIn: () => void; onZoomOut: () => void; onFit: () => void; onReset: () => void;
  onSave: () => void; onExport: () => void; onMyStudio: () => void;
  panel: Panel; onPanel: (p: Panel) => void;
  color: string;
  referenceButton?: { shown: boolean; onClick: () => void } | null;
  swatches: { hex: string; active: boolean; onPick: () => void }[];
  swatchHint: string | null;
};
const KEYS: Record<string, string> = { brush: "B", soft: "S", pencil: "P", marker: "M", liner: "L", eraser: "E", fill: "G", picker: "I", hand: "H" };
const base = "label-mono min-h-11 min-w-11 flex-none border px-3 text-[0.7rem] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-30";

/** Bottom toolbar. On phones it is a single scrolling strip so nothing is crammed. */
import { forwardRef } from "react";
const ToolBar = forwardRef<HTMLDivElement, Props>(function ToolBar(p, ref) {
  return (
    <div ref={ref} role="toolbar" aria-label="Drawing tools" className="sticky bottom-0 z-30 border-t border-ivory/15 bg-charcoal/95 backdrop-blur-sm" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center gap-2 overflow-x-auto border-b border-ivory/10 px-3 py-1.5 lg:hidden" role="group" aria-label="Quick palette">
        {p.swatches.length === 0 && <span className="label-mono text-[0.65rem] text-ivory/50">{p.swatchHint ?? "Palette loading…"}</span>}
        {p.swatches.map((s) => (
          <button key={s.hex} type="button" onClick={s.onPick} aria-pressed={s.active} aria-label={`Use ${s.hex}`} className={`h-10 w-10 flex-none border-2 ${s.active ? "border-gold scale-105" : "border-ivory/20"}`} style={{ background: s.hex }} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2 md:justify-center md:gap-2">
        <div role="group" aria-label="Tools" className="flex flex-none gap-1.5">
          {TOOLS.map((t) => (
            <button key={t.id} type="button" onClick={() => p.onTool(t.id)} aria-pressed={p.tool === t.id} title={`${t.label} (${KEYS[t.id]}) — ${t.hint}`}
              className={`${base} ${p.tool === t.id ? "border-gold bg-gold text-charcoal" : "border-ivory/25 text-ivory/80 hover:border-ivory/60"}`}>{t.label.toUpperCase()}</button>
          ))}
        </div>
        <span aria-hidden className="mx-1 h-6 w-px flex-none bg-ivory/15" />
        <button type="button" onClick={p.onUndo} disabled={!p.canUndo} title="Undo (Ctrl/Cmd+Z)" className={`${base} border-ivory/25 hover:border-ivory/60`}>UNDO</button>
        <button type="button" onClick={p.onRedo} disabled={!p.canRedo} title="Redo (Ctrl/Cmd+Shift+Z)" className={`${base} border-ivory/25 hover:border-ivory/60`}>REDO</button>
        <span aria-hidden className="mx-1 h-6 w-px flex-none bg-ivory/15" />
        <button type="button" onClick={p.onZoomOut} aria-label="Zoom out" className={`${base} border-ivory/25 hover:border-ivory/60`}>−</button>
        <button type="button" onClick={p.onReset} aria-label={`Zoom ${p.zoom} percent. Reset to 100 percent`} className={`${base} border-ivory/25 tabular-nums hover:border-ivory/60`}>{p.zoom}%</button>
        <button type="button" onClick={p.onZoomIn} aria-label="Zoom in" className={`${base} border-ivory/25 hover:border-ivory/60`}>+</button>
        <button type="button" onClick={p.onFit} title="Fit canvas to the screen (0)" className={`${base} border-ivory/25 hover:border-ivory/60`}>FIT</button>
        <span aria-hidden className="mx-1 h-6 w-px flex-none bg-ivory/15" />
        <button type="button" onClick={p.onMyStudio} className={`${base} border-ivory/25 hover:border-ivory/60`}>MY STUDIO</button>
        <button type="button" onClick={p.onSave} className={`${base} border-ivory/25 hover:border-gold`}>SAVE</button>
        <button type="button" onClick={p.onExport} className={`${base} border-gold text-gold hover:bg-gold hover:text-charcoal`}>EXPORT</button>
      </div>
      <div role="group" aria-label="Panels" className="flex items-center gap-1.5 border-t border-ivory/10 px-3 py-1.5 lg:hidden">
        {(["palette", "brush", "layers"] as const).map((k) => (
          <button key={k} type="button" onClick={() => p.onPanel(p.panel === k ? null : k)} aria-expanded={p.panel === k} className={`${base} flex-1 ${p.panel === k ? "border-gold text-gold" : "border-ivory/25 text-ivory/80"}`}>{k === "palette" ? "PALETTE" : k === "brush" ? "COLOUR & BRUSH" : "LAYERS"}</button>
        ))}
        {p.referenceButton && <button type="button" onClick={p.referenceButton.onClick} aria-pressed={p.referenceButton.shown} className={`${base} flex-1 ${p.referenceButton.shown ? "border-gold text-gold" : "border-ivory/25 text-ivory/80"}`}>ORIGINAL</button>}
        <span aria-hidden className="h-8 w-8 flex-none border border-ivory/30" style={{ background: p.color }} title="Current colour" />
      </div>
    </div>
  );
});
export default ToolBar;
