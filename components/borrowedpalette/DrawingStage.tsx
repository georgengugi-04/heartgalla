"use client";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { RGB } from "@/lib/borrowedpalette/color";
import type { StudioDoc } from "@/lib/borrowedpalette/doc";
import { floodFill, isPaintTool, pickColor, StrokeSession, type BrushSettings, type ToolId } from "@/lib/borrowedpalette/engine";

export type StageHandle = { zoomBy(factor: number): void; fit(): void; reset(): void };
type Props = {
  doc: StudioDoc;
  tool: ToolId;
  settings: BrushSettings;
  color: RGB;
  grid: boolean;
  /** when set, painting is refused and this is shown instead (e.g. "Choose your 3 colours first") */
  blockedReason: string | null;
  onStrokeEnd: () => void;
  onPicked: (c: RGB) => void;
  onNotice: (message: string) => void;
  onScale: (percent: number) => void;
};

const MIN = 0.08, MAX = 8;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

/**
 * The drawing surface. The picture is a fixed-size stack of canvases; zooming and panning only move and scale that stack
 * with CSS, so the artwork never changes when the window does. One finger draws, two fingers pan and pinch.
 */
const DrawingStage = forwardRef<StageHandle, Props>(function DrawingStage(props, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const gridEl = useRef<HTMLDivElement>(null);
  const view = useRef({ x: 0, y: 0, s: 1, fit: true });
  const live = useRef(props); // latest props, readable from long-lived event handlers
  useEffect(() => { live.current = props; });

  const applyView = useCallback(() => {
    const v = view.current;
    if (sheet.current) sheet.current.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.s})`;
    live.current.onScale(Math.round(v.s * 100));
  }, []);

  const fit = useCallback(() => {
    const el = wrap.current; if (!el) return;
    const r = el.getBoundingClientRect(), d = live.current.doc;
    if (r.width < 10 || r.height < 10) return;
    const pad = r.width < 500 ? 8 : 28;
    const s = clamp(Math.min((r.width - pad * 2) / d.width, (r.height - pad * 2) / d.height), MIN, MAX);
    view.current = { s, x: (r.width - d.width * s) / 2, y: (r.height - d.height * s) / 2, fit: true };
    applyView();
  }, [applyView]);

  const zoomAround = useCallback((factor: number, cx: number, cy: number) => {
    const v = view.current, s = clamp(v.s * factor, MIN, MAX), k = s / v.s;
    view.current = { s, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k, fit: false };
    applyView();
  }, [applyView]);

  useImperativeHandle(ref, () => ({
    zoomBy: (f) => { const r = wrap.current?.getBoundingClientRect(); if (r) zoomAround(f, r.width / 2, r.height / 2); },
    fit,
    reset: () => { const r = wrap.current?.getBoundingClientRect(), d = live.current.doc; if (!r) return; view.current = { s: 1, x: (r.width - d.width) / 2, y: (r.height - d.height) / 2, fit: false }; applyView(); },
  }), [zoomAround, fit, applyView]);

  const { doc } = props;

  // keep the DOM in step with the document: background, layer canvases (order, opacity, visibility)
  useEffect(() => {
    const el = sheet.current; if (!el) return;
    el.style.width = `${doc.width}px`; el.style.height = `${doc.height}px`;
    const sync = () => {
      el.style.backgroundColor = doc.background ?? "transparent";
      el.dataset.transparent = doc.background === null ? "true" : "false";
      const want = doc.layers.map((l) => l.canvas as unknown as HTMLCanvasElement);
      const have = Array.from(el.querySelectorAll<HTMLCanvasElement>(":scope > canvas"));
      have.filter((c) => !want.includes(c)).forEach((c) => c.remove());
      const anchor = gridEl.current;
      want.forEach((c, i) => {
        const l = doc.layers[i];
        c.style.cssText = `position:absolute;left:0;top:0;width:${doc.width}px;height:${doc.height}px;pointer-events:none;opacity:${l.opacity};display:${l.visible ? "block" : "none"}`;
        c.setAttribute("aria-hidden", "true");
        if (el.children[i + (0)] !== c) el.insertBefore(c, anchor);
      });
    };
    sync();
    const off = doc.subscribe(sync);
    fit();
    return off;
  }, [doc, fit]);

  useEffect(() => { if (gridEl.current) gridEl.current.style.display = props.grid ? "block" : "none"; }, [props.grid]);

  // refit when the window or the layout changes, but only while the person hasn't zoomed on purpose
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const ro = new ResizeObserver(() => { if (view.current.fit) fit(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  // pointers, gestures, wheel, space-to-pan
  useEffect(() => {
    const el = wrap.current; if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let stroke: StrokeSession | null = null;
    let strokeId = -1;
    let pan: { px: number; py: number; x: number; y: number } | null = null;
    let pinch: { d: number; cx: number; cy: number; v: { x: number; y: number; s: number } } | null = null;
    let tap: { x: number; y: number; moved: boolean; id: number } | null = null;
    let space = false;

    const local = (e: { clientX: number; clientY: number }) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const toDoc = (e: { clientX: number; clientY: number }) => { const l = local(e), v = view.current; return { x: (l.x - v.x) / v.s, y: (l.y - v.y) / v.s }; };
    const press = (e: PointerEvent) => (e.pointerType === "pen" ? (e.pressure || 0.5) : 1);
    const midDist = () => { const [a, b] = [...pointers.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; };

    const ringAt = (e: PointerEvent) => {
      const r = ring.current, p = live.current;
      if (!r) return;
      if (e.pointerType === "touch" || !isPaintTool(p.tool) || space) { r.style.display = "none"; return; }
      const l = local(e), size = Math.max(4, p.settings.size * view.current.s);
      r.style.display = "block"; r.style.width = r.style.height = `${size}px`; r.style.transform = `translate(${l.x - size / 2}px, ${l.y - size / 2}px)`;
    };

    const down = (e: PointerEvent) => {
      const p = live.current;
      pointers.set(e.pointerId, local(e));
      if (pointers.size === 2) { // a second finger: whatever was being drawn was the start of a pinch, so undo that mark
        if (stroke) { stroke.cancel(); stroke = null; }
        tap = null; pan = null;
        const m = midDist(); pinch = { ...m, v: { ...view.current } };
        return;
      }
      if (pointers.size > 2) return;
      el.setPointerCapture?.(e.pointerId);
      const l = local(e);
      if (p.tool === "hand" || space || e.button === 1) { pan = { px: l.x, py: l.y, x: view.current.x, y: view.current.y }; view.current.fit = false; return; }
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const at = toDoc(e);
      if (isPaintTool(p.tool)) {
        const layer = p.doc.active;
        if (p.blockedReason) { p.onNotice(p.blockedReason); return; }
        if (!layer.visible) { p.onNotice("This layer is hidden. Show it (the eye) to draw on it."); return; }
        if (layer.locked) { p.onNotice("This layer is locked. Unlock it to draw on it."); return; }
        stroke = new StrokeSession(p.doc, layer, p.tool, p.settings, p.color, Date.now() & 0xffff);
        strokeId = e.pointerId;
        stroke.begin({ x: at.x, y: at.y, pressure: press(e) });
      } else if (p.tool === "fill" || p.tool === "picker") {
        if (p.tool === "fill") {
          if (p.blockedReason) { p.onNotice(p.blockedReason); return; }
          const layer = p.doc.active;
          if (!layer.visible || layer.locked) { p.onNotice(layer.locked ? "This layer is locked. Unlock it to fill on it." : "This layer is hidden. Show it to fill on it."); return; }
        }
        tap = { x: l.x, y: l.y, moved: false, id: e.pointerId }; // acts on release, so a two-finger pinch never fills by accident
      }
    };

    const move = (e: PointerEvent) => {
      ringAt(e);
      if (!pointers.has(e.pointerId)) return;
      const l = local(e);
      pointers.set(e.pointerId, l);
      if (pinch && pointers.size >= 2) {
        const m = midDist(), k = clamp(pinch.v.s * (m.d / Math.max(1, pinch.d)), MIN, MAX) / pinch.v.s;
        view.current = { s: pinch.v.s * k, x: m.cx - (pinch.cx - pinch.v.x) * k, y: m.cy - (pinch.cy - pinch.v.y) * k, fit: false };
        applyView(); return;
      }
      if (pan) { view.current = { ...view.current, x: pan.x + (l.x - pan.px), y: pan.y + (l.y - pan.py), fit: false }; applyView(); return; }
      if (tap && e.pointerId === tap.id && Math.hypot(l.x - tap.x, l.y - tap.y) > 8) tap.moved = true;
      if (stroke && e.pointerId === strokeId) {
        const events = e.getCoalescedEvents?.() ?? [];
        for (const ev of events.length ? events : [e]) { const at = toDoc(ev); stroke.move({ x: at.x, y: at.y, pressure: press(ev) }); }
      }
    };

    const up = (e: PointerEvent) => {
      const had = pointers.delete(e.pointerId);
      if (!had) return;
      if (pointers.size < 2) pinch = null;
      if (stroke && e.pointerId === strokeId) { stroke.end(); stroke = null; live.current.onStrokeEnd(); }
      if (pan && pointers.size === 0) pan = null;
      if (tap && e.pointerId === tap.id && e.type === "pointerup" && !tap.moved && pointers.size === 0) {
        const p = live.current, at = toDoc(e);
        if (p.tool === "picker") { const c = pickColor(p.doc, at.x, at.y); if (c) p.onPicked(c); else p.onNotice("Nothing to pick there. Try a spot with paint on it."); }
        else if (p.tool === "fill") { const entry = floodFill(p.doc, p.doc.active, at.x, at.y, p.color, p.settings.opacity); if (entry) p.onStrokeEnd(); }
      }
      if (e.pointerId === tap?.id) tap = null;
    };
    const cancel = (e: PointerEvent) => { if (stroke && e.pointerId === strokeId) { stroke.cancel(); stroke = null; } pointers.delete(e.pointerId); pinch = null; pan = null; tap = null; };

    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const l = local(e);
      zoomAround(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), l.x, l.y);
    };
    const keydown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || (e.target as HTMLElement)?.closest?.("input, textarea, select, button, [contenteditable]")) return;
      if (!el.contains(document.activeElement) && document.activeElement !== document.body) return;
      e.preventDefault(); space = true; el.style.cursor = "grab";
    };
    const keyup = (e: KeyboardEvent) => { if (e.code === "Space") { space = false; el.style.cursor = ""; } };
    const leave = () => { if (ring.current) ring.current.style.display = "none"; };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", cancel);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", cancel); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", keydown); window.removeEventListener("keyup", keyup);
    };
  }, [applyView, zoomAround]);

  const cursor = props.tool === "hand" ? "grab" : props.tool === "picker" ? "copy" : "crosshair";
  return (
    <div
      ref={wrap}
      role="application"
      aria-label="Drawing canvas. Use a pointer or finger to draw. Two fingers move and zoom the canvas."
      className="bp-stage relative h-full w-full select-none overflow-hidden"
      style={{ touchAction: "none", overscrollBehavior: "contain", cursor }}
    >
      <div ref={sheet} className="bp-sheet absolute left-0 top-0 origin-top-left shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]" style={{ willChange: "transform" }}>
        <div ref={gridEl} aria-hidden className="pointer-events-none absolute inset-0" style={{ display: "none", backgroundImage: "linear-gradient(to right, rgba(120,120,120,0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,120,0.35) 1px, transparent 1px)", backgroundSize: "100px 100px" }} />
      </div>
      <div ref={ring} aria-hidden className="pointer-events-none absolute left-0 top-0 rounded-full border border-ivory/80 mix-blend-difference" style={{ display: "none" }} />
    </div>
  );
});
export default DrawingStage;
