import type { HistoryEntry } from "./history";
import { clampRect, ctxOf, img, unionRect, type CanvasLike, type Ctx, type Layer, type Rect, type StudioDoc } from "./doc";
import type { RGB } from "./color";

export type PaintTool = "brush" | "soft" | "pencil" | "marker" | "liner" | "eraser";
export type ToolId = PaintTool | "fill" | "picker" | "hand";
export type Pt = { x: number; y: number; pressure: number };
export type BrushSettings = { size: number; opacity: number; smoothing: number; pressure: boolean };

export const TOOLS: { id: ToolId; label: string; hint: string }[] = [
  { id: "brush", label: "Brush", hint: "A solid, round brush" },
  { id: "soft", label: "Soft", hint: "Airbrush: soft edges that build up" },
  { id: "pencil", label: "Pencil", hint: "Grainy, like graphite on paper" },
  { id: "marker", label: "Marker", hint: "Flat chisel tip, slightly see-through" },
  { id: "liner", label: "Fine liner", hint: "Thin, steady line" },
  { id: "eraser", label: "Eraser", hint: "Removes paint from the current layer" },
  { id: "fill", label: "Fill", hint: "Fills an enclosed area" },
  { id: "picker", label: "Picker", hint: "Takes a colour from your drawing" },
  { id: "hand", label: "Move", hint: "Drag to move the canvas" },
];

export const BRUSH_DEFAULTS: Record<PaintTool, BrushSettings & { min: number; max: number }> = {
  brush: { size: 18, opacity: 1, smoothing: 0.35, pressure: true, min: 1, max: 120 },
  soft: { size: 40, opacity: 0.8, smoothing: 0.35, pressure: true, min: 4, max: 200 },
  pencil: { size: 6, opacity: 0.9, smoothing: 0.15, pressure: true, min: 1, max: 40 },
  marker: { size: 24, opacity: 0.75, smoothing: 0.3, pressure: false, min: 4, max: 100 },
  liner: { size: 3, opacity: 1, smoothing: 0.7, pressure: false, min: 1, max: 16 },
  eraser: { size: 30, opacity: 1, smoothing: 0.2, pressure: false, min: 2, max: 200 },
};
export const isPaintTool = (t: ToolId): t is PaintTool => t in BRUSH_DEFAULTS;

const rgba = (c: RGB, a: number) => `rgba(${c.r},${c.g},${c.b},${a})`;

/** Small seeded generator so a pencil's grain is the same on every machine. */
function prng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

const SPACING: Record<PaintTool, number> = { brush: 0.1, soft: 0.07, pencil: 0.14, marker: 0.08, liner: 0.08, eraser: 0.1 };

/** One stroke, from pointer-down to pointer-up. Paints into a buffer and recomposites only the changed rectangle. */
export class StrokeSession {
  private buf: Ctx;
  private layerCtx: Ctx;
  private scratchCtx: Ctx;
  private dirty: Rect | null = null; // bounding box of everything this stroke touched
  private lastRaw: Pt | null = null;
  private filt: Pt | null = null;
  private prevMid: Pt | null = null;
  private prevPt: Pt | null = null;
  private carry = 0;
  private sprite: CanvasLike | null = null;
  private rand: () => number;
  private count = 0;

  constructor(private doc: StudioDoc, private layer: Layer, private tool: PaintTool, private s: BrushSettings, private color: RGB, seed = 1) {
    this.buf = ctxOf(doc.buffer);
    this.layerCtx = ctxOf(layer.canvas);
    this.scratchCtx = ctxOf(doc.scratch);
    this.rand = prng(seed);
  }

  begin(p: Pt) {
    const { doc } = this;
    // clear whatever the previous stroke left in the buffer
    if (doc.bufferDirty) { this.buf.clearRect(doc.bufferDirty.x, doc.bufferDirty.y, doc.bufferDirty.w, doc.bufferDirty.h); doc.bufferDirty = null; }
    this.scratchCtx.clearRect(0, 0, doc.width, doc.height); this.scratchCtx.drawImage(img(this.layer.canvas), 0, 0);
    this.sprite = this.makeSprite();
    this.lastRaw = p; this.filt = p; this.prevPt = p; this.prevMid = p;
    this.dab(p);
    this.flush(this.rectFor(p, p));
  }

  move(p: Pt) {
    if (!this.filt || !this.lastRaw) return;
    this.lastRaw = p;
    const k = 1 - this.s.smoothing * 0.88; // 1 = follow the pointer exactly, lower = more lag and smoother curves
    const next: Pt = { x: this.filt.x + (p.x - this.filt.x) * k, y: this.filt.y + (p.y - this.filt.y) * k, pressure: this.filt.pressure + (p.pressure - this.filt.pressure) * Math.max(k, 0.35) };
    this.advance(next);
  }

  private advance(next: Pt) {
    const prev = this.prevPt!, from = this.prevMid!;
    const mid: Pt = { x: (prev.x + next.x) / 2, y: (prev.y + next.y) / 2, pressure: (prev.pressure + next.pressure) / 2 };
    const r = this.walk(from, prev, mid);
    this.prevMid = mid; this.prevPt = next; this.filt = next;
    if (r) this.flush(r);
  }

  /** Lays dabs along the curve from `a` to `b` bent towards `c`, one dab every `spacing` pixels. */
  private walk(a: Pt, c: Pt, b: Pt): Rect | null {
    const spacing = Math.max(0.6, this.s.size * SPACING[this.tool]);
    const steps = Math.max(2, Math.ceil((Math.hypot(c.x - a.x, c.y - a.y) + Math.hypot(b.x - c.x, b.y - c.y)) / Math.max(1, spacing * 1.5)));
    let rect: Rect | null = null;
    let px = a.x, py = a.y;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      const x = u * u * a.x + 2 * u * t * c.x + t * t * b.x, y = u * u * a.y + 2 * u * t * c.y + t * t * b.y;
      const pr = u * u * a.pressure + 2 * u * t * c.pressure + t * t * b.pressure;
      let seg = Math.hypot(x - px, y - py), sx = px, sy = py;
      while (this.carry + seg >= spacing) {
        const need = spacing - this.carry, f = seg > 0 ? need / seg : 0;
        sx += (x - sx) * f; sy += (y - sy) * f; seg -= need; this.carry = 0;
        const d: Pt = { x: sx, y: sy, pressure: pr };
        this.dab(d);
        rect = unionRect(rect, this.rectFor(d, d));
      }
      this.carry += seg;
      px = x; py = y;
    }
    return rect;
  }

  private radius(p: Pt) {
    const k = this.s.pressure ? 0.25 + 0.75 * p.pressure : 1;
    return Math.max(0.5, (this.s.size * k) / 2);
  }
  private rectFor(a: Pt, _b: Pt): Rect { const r = this.radius(a) * (this.tool === "marker" ? 1.5 : 1) + 2; return { x: a.x - r, y: a.y - r, w: r * 2, h: r * 2 }; }

  private makeSprite(): CanvasLike | null {
    const f = this.doc.factory;
    if (this.tool === "soft") {
      const n = 128, c = f(n, n), x = ctxOf(c);
      const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      g.addColorStop(0, rgba(this.color, 0.34)); g.addColorStop(0.45, rgba(this.color, 0.22)); g.addColorStop(1, rgba(this.color, 0));
      x.fillStyle = g; x.fillRect(0, 0, n, n);
      return c;
    }
    if (this.tool === "pencil") {
      const n = 64, c = f(n, n), x = ctxOf(c), r = prng(7);
      x.fillStyle = rgba(this.color, 1);
      for (let i = 0; i < 900; i++) { // grain: many tiny specks inside a disc, denser in the middle
        const a = r() * Math.PI * 2, d = Math.sqrt(r()) * (n / 2 - 2);
        x.globalAlpha = 0.18 + r() * 0.45;
        x.fillRect(n / 2 + Math.cos(a) * d, n / 2 + Math.sin(a) * d, 1.4, 1.4);
      }
      return c;
    }
    return null;
  }

  private dab(p: Pt) {
    const b = this.buf, r = this.radius(p);
    this.count++;
    b.save();
    switch (this.tool) {
      case "soft":
        b.globalAlpha = this.s.pressure ? 0.35 + 0.65 * p.pressure : 1;
        b.drawImage(img(this.sprite!), p.x - r, p.y - r, r * 2, r * 2);
        break;
      case "pencil": {
        b.globalAlpha = this.s.pressure ? 0.4 + 0.6 * p.pressure : 1;
        b.translate(p.x, p.y); b.rotate(this.rand() * Math.PI * 2);
        b.drawImage(img(this.sprite!), -r, -r, r * 2, r * 2);
        break;
      }
      case "marker": {
        b.fillStyle = rgba(this.color, 1);
        b.translate(p.x, p.y); b.rotate(-Math.PI / 4);
        b.fillRect(-r, -r * 0.2, r * 2, r * 0.4);
        break;
      }
      default: // brush, liner, eraser: a solid round dab
        b.fillStyle = this.tool === "eraser" ? "#000" : rgba(this.color, 1);
        b.beginPath(); b.arc(p.x, p.y, r, 0, Math.PI * 2); b.fill();
    }
    b.restore();
  }

  /** Redraws one rectangle of the layer: original pixels, then the stroke buffer at the chosen opacity. */
  private flush(rect: Rect) {
    const r = clampRect(rect, this.doc.width, this.doc.height);
    if (!r) return;
    this.dirty = unionRect(this.dirty, r);
    this.doc.bufferDirty = unionRect(this.doc.bufferDirty, r);
    const c = this.layerCtx;
    c.save();
    c.clearRect(r.x, r.y, r.w, r.h);
    c.drawImage(img(this.doc.scratch), r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
    c.globalCompositeOperation = this.tool === "eraser" ? "destination-out" : "source-over";
    c.globalAlpha = this.s.opacity;
    c.drawImage(img(this.doc.buffer), r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
    c.restore();
  }

  /** Finishes the stroke at the last pointer position and returns its undo entry. */
  end(): HistoryEntry | null {
    if (this.lastRaw && this.prevPt) {
      // catch up to where the pointer really ended (the smoothing lags behind it)
      for (let i = 0; i < 6 && this.filt && Math.hypot(this.filt.x - this.lastRaw.x, this.filt.y - this.lastRaw.y) > 0.5; i++) {
        const f = this.filt;
        this.advance({ x: f.x + (this.lastRaw.x - f.x) * 0.6, y: f.y + (this.lastRaw.y - f.y) * 0.6, pressure: this.lastRaw.pressure });
      }
    }
    if (!this.dirty) return null;
    const r = clampRect(this.dirty, this.doc.width, this.doc.height)!;
    const entry = this.doc.pixelEntry(this.tool === "eraser" ? "Erase" : "Stroke", this.layer, r, this.scratchCtx.getImageData(r.x, r.y, r.w, r.h), this.layerCtx.getImageData(r.x, r.y, r.w, r.h));
    this.doc.history.push(entry);
    return entry;
  }

  /** Abandons the stroke (e.g. a second finger touched down to pinch) and puts the layer back as it was. */
  cancel() {
    if (this.dirty) {
      const r = clampRect(this.dirty, this.doc.width, this.doc.height);
      if (r) { this.layerCtx.clearRect(r.x, r.y, r.w, r.h); this.layerCtx.drawImage(img(this.doc.scratch), r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h); }
    }
    this.dirty = null;
  }
}

/** Reads the colour you see at a point (all visible layers over the background). Null if that spot is empty/transparent. */
export function pickColor(doc: StudioDoc, x: number, y: number): RGB | null {
  const px = Math.floor(x), py = Math.floor(y);
  if (px < 0 || py < 0 || px >= doc.width || py >= doc.height) return null;
  const one = doc.factory(1, 1), c = ctxOf(one);
  c.translate(-px, -py);
  doc.renderTo(c, 1);
  const d = c.getImageData(0, 0, 1, 1).data;
  return d[3] < 20 ? null : { r: d[0], g: d[1], b: d[2] };
}

/**
 * Bucket fill. The area is decided by what you SEE (all visible layers + background) so an outline on one layer can be
 * filled on another. The result is written to the active layer, grown by one pixel so there is no pale halo along edges.
 */
export function floodFill(doc: StudioDoc, layer: Layer, x: number, y: number, color: RGB, opacity: number, tolerance = 40): HistoryEntry | null {
  const W = doc.width, H = doc.height;
  const sx = Math.floor(x), sy = Math.floor(y);
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return null;
  const sctx = ctxOf(doc.scratch);
  sctx.clearRect(0, 0, W, H);
  doc.renderTo(sctx, 1);
  const data = sctx.getImageData(0, 0, W, H).data;
  const o = (sy * W + sx) * 4;
  const tr = data[o], tg = data[o + 1], tb = data[o + 2], ta = data[o + 3];
  const match = (i: number) => Math.abs(data[i] - tr) <= tolerance && Math.abs(data[i + 1] - tg) <= tolerance && Math.abs(data[i + 2] - tb) <= tolerance && Math.abs(data[i + 3] - ta) <= tolerance;

  const mask = new Uint8Array(W * H);
  const stack: number[] = [sx, sy];
  let x0 = sx, x1 = sx, y0 = sy, y1 = sy;
  while (stack.length) {
    const cy = stack.pop()!, cx0 = stack.pop()!;
    let xl = cx0;
    while (xl >= 0 && !mask[cy * W + xl] && match((cy * W + xl) * 4)) xl--;
    xl++;
    let up = false, down = false;
    for (let cx = xl; cx < W && !mask[cy * W + cx] && match((cy * W + cx) * 4); cx++) {
      mask[cy * W + cx] = 1;
      if (cx < x0) x0 = cx; if (cx > x1) x1 = cx; if (cy < y0) y0 = cy; if (cy > y1) y1 = cy;
      if (cy > 0) { const ok = !mask[(cy - 1) * W + cx] && match(((cy - 1) * W + cx) * 4); if (ok && !up) { stack.push(cx, cy - 1); up = true; } else if (!ok) up = false; }
      if (cy < H - 1) { const ok = !mask[(cy + 1) * W + cx] && match(((cy + 1) * W + cx) * 4); if (ok && !down) { stack.push(cx, cy + 1); down = true; } else if (!ok) down = false; }
    }
  }
  const rect = clampRect({ x: x0 - 2, y: y0 - 2, w: x1 - x0 + 5, h: y1 - y0 + 5 }, W, H);
  if (!rect) return null;

  // grow the mask by one pixel (inside the rect) so antialiased outlines are covered
  const out = new Uint8ClampedArray(rect.w * rect.h * 4);
  for (let yy = rect.y; yy < rect.y + rect.h; yy++) for (let xx = rect.x; xx < rect.x + rect.w; xx++) {
    const i = yy * W + xx;
    const on = mask[i] || (xx > 0 && mask[i - 1]) || (xx < W - 1 && mask[i + 1]) || (yy > 0 && mask[i - W]) || (yy < H - 1 && mask[i + W]);
    if (!on) continue;
    const j = ((yy - rect.y) * rect.w + (xx - rect.x)) * 4;
    out[j] = color.r; out[j + 1] = color.g; out[j + 2] = color.b; out[j + 3] = 255;
  }
  const bctx = ctxOf(doc.buffer);
  if (doc.bufferDirty) { bctx.clearRect(doc.bufferDirty.x, doc.bufferDirty.y, doc.bufferDirty.w, doc.bufferDirty.h); }
  const piece = doc.factory(rect.w, rect.h);
  const pctx = ctxOf(piece), pdata = pctx.createImageData(rect.w, rect.h);
  pdata.data.set(out);
  pctx.putImageData(pdata, 0, 0);
  bctx.drawImage(img(piece), rect.x, rect.y);
  doc.bufferDirty = rect;

  // scratch becomes the untouched layer (for undo), then the fill is composited in
  sctx.clearRect(0, 0, W, H); sctx.drawImage(img(layer.canvas), 0, 0);
  const lctx = ctxOf(layer.canvas);
  lctx.save(); lctx.globalAlpha = opacity; lctx.drawImage(img(doc.buffer), rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h); lctx.restore();
  const entry = doc.pixelEntry("Fill", layer, rect, sctx.getImageData(rect.x, rect.y, rect.w, rect.h), lctx.getImageData(rect.x, rect.y, rect.w, rect.h));
  doc.history.push(entry);
  return entry;
}
