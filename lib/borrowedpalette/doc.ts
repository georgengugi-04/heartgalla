import { History, type HistoryEntry } from "./history";

export type Ctx = CanvasRenderingContext2D;
export type CanvasLike = { width: number; height: number; getContext(id: "2d", opts?: object): Ctx | null };
export type CanvasFactory = (w: number, h: number) => CanvasLike;
export const img = (c: CanvasLike) => c as unknown as CanvasImageSource;

export type Rect = { x: number; y: number; w: number; h: number };
export type Layer = { id: string; name: string; canvas: CanvasLike; visible: boolean; opacity: number; locked: boolean };

export const MAX_LAYERS = 6;
export const BACKGROUNDS = [
  { id: "paper", label: "Paper", value: "#F4F0E6" },
  { id: "white", label: "White", value: "#FFFFFF" },
  { id: "charcoal", label: "Charcoal", value: "#161616" },
  { id: "transparent", label: "Transparent", value: null },
] as const;

export const ctxOf = (c: CanvasLike): Ctx => {
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) throw new Error("This browser could not create a drawing surface.");
  return x;
};

export const clampRect = (r: Rect, w: number, h: number): Rect | null => {
  const x0 = Math.max(0, Math.floor(r.x)), y0 = Math.max(0, Math.floor(r.y));
  const x1 = Math.min(w, Math.ceil(r.x + r.w)), y1 = Math.min(h, Math.ceil(r.y + r.h));
  return x1 > x0 && y1 > y0 ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : null;
};
export const unionRect = (a: Rect | null, b: Rect): Rect => {
  if (!a) return b;
  const x0 = Math.min(a.x, b.x), y0 = Math.min(a.y, b.y), x1 = Math.max(a.x + a.w, b.x + b.w), y1 = Math.max(a.y + a.h, b.y + b.h);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

let counter = 0;
const newId = () => `l${Date.now().toString(36)}${(counter++).toString(36)}`;

/** The picture being made: a fixed-size stack of raster layers plus a background setting. Screen size never changes the picture. */
export class StudioDoc {
  layers: Layer[] = [];
  activeId = "";
  /** null = transparent */
  background: string | null = "#F4F0E6";
  readonly history: History;
  /** a copy of the active layer taken when a stroke starts */
  readonly scratch: CanvasLike;
  /** the stroke being drawn, kept apart so opacity applies to the whole stroke at once */
  readonly buffer: CanvasLike;
  bufferDirty: Rect | null = null;
  /** bumped on every change a UI should react to */
  version = 0;
  private listeners = new Set<() => void>();

  constructor(readonly factory: CanvasFactory, readonly width: number, readonly height: number, onHistory?: () => void) {
    this.history = new History(undefined, () => { this.touch(); onHistory?.(); });
    this.scratch = factory(width, height);
    this.buffer = factory(width, height);
    this.addLayer("Layer 1", false);
  }

  touch() { this.version++; this.listeners.forEach((f) => f()); }
  /** Calls `fn` whenever layers, settings or history change. Returns an unsubscribe function. */
  subscribe(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  get active(): Layer { return this.layers.find((l) => l.id === this.activeId) ?? this.layers[this.layers.length - 1]; }
  layer(id: string) { return this.layers.find((l) => l.id === id); }

  private makeLayer(name: string): Layer {
    return { id: newId(), name, canvas: this.factory(this.width, this.height), visible: true, opacity: 1, locked: false };
  }

  addLayer(name?: string, record = true): Layer | null {
    if (this.layers.length >= MAX_LAYERS) return null;
    const layer = this.makeLayer(name ?? `Layer ${this.layers.length + 1}`);
    const above = this.layers.findIndex((l) => l.id === this.activeId);
    const index = above >= 0 ? above + 1 : this.layers.length;
    const prevActive = this.activeId;
    this.layers.splice(index, 0, layer);
    this.activeId = layer.id;
    if (record) this.history.push({
      label: "Add layer", bytes: 0,
      undo: () => { this.layers = this.layers.filter((l) => l !== layer); this.activeId = this.layer(prevActive)?.id ?? this.layers[this.layers.length - 1].id; },
      redo: () => { this.layers.splice(Math.min(index, this.layers.length), 0, layer); this.activeId = layer.id; },
    });
    this.touch();
    return layer;
  }

  removeLayer(id: string): boolean {
    if (this.layers.length <= 1) return false;
    const index = this.layers.findIndex((l) => l.id === id);
    if (index < 0) return false;
    const [layer] = this.layers.splice(index, 1);
    const prevActive = this.activeId;
    this.activeId = this.layers[Math.min(index, this.layers.length - 1)].id;
    this.history.push({
      label: "Delete layer", bytes: this.width * this.height * 4,
      undo: () => { this.layers.splice(index, 0, layer); this.activeId = prevActive; },
      redo: () => { this.layers = this.layers.filter((l) => l !== layer); this.activeId = this.layers[Math.min(index, this.layers.length - 1)].id; },
    });
    this.touch();
    return true;
  }

  duplicateLayer(id: string): Layer | null {
    const src = this.layer(id);
    if (!src || this.layers.length >= MAX_LAYERS) return null;
    const copy = this.makeLayer(`${src.name} copy`);
    copy.opacity = src.opacity;
    ctxOf(copy.canvas).drawImage(img(src.canvas), 0, 0);
    const index = this.layers.indexOf(src) + 1;
    const prevActive = this.activeId;
    this.layers.splice(index, 0, copy);
    this.activeId = copy.id;
    this.history.push({
      label: "Duplicate layer", bytes: this.width * this.height * 4,
      undo: () => { this.layers = this.layers.filter((l) => l !== copy); this.activeId = this.layer(prevActive)?.id ?? this.layers[0].id; },
      redo: () => { this.layers.splice(index, 0, copy); this.activeId = copy.id; },
    });
    this.touch();
    return copy;
  }

  moveLayer(id: string, dir: 1 | -1): boolean {
    const i = this.layers.findIndex((l) => l.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= this.layers.length) return false;
    const swap = () => { [this.layers[i], this.layers[j]] = [this.layers[j], this.layers[i]]; };
    swap();
    this.history.push({ label: "Reorder layers", bytes: 0, undo: swap, redo: swap });
    this.touch();
    return true;
  }

  /** Merge a layer into the one beneath it. */
  mergeDown(id: string): boolean {
    const i = this.layers.findIndex((l) => l.id === id);
    if (i <= 0) return false;
    const top = this.layers[i], below = this.layers[i - 1];
    const backup = this.factory(this.width, this.height);
    ctxOf(backup).drawImage(img(below.canvas), 0, 0);
    const bctx = ctxOf(below.canvas);
    bctx.save(); bctx.globalAlpha = top.opacity; bctx.drawImage(img(top.canvas), 0, 0); bctx.restore();
    this.layers.splice(i, 1);
    const prevActive = this.activeId;
    this.activeId = below.id;
    this.history.push({
      label: "Merge layers", bytes: this.width * this.height * 8,
      undo: () => { const c = ctxOf(below.canvas); c.clearRect(0, 0, this.width, this.height); c.drawImage(img(backup), 0, 0); this.layers.splice(i, 0, top); this.activeId = prevActive; },
      redo: () => { const c = ctxOf(below.canvas); c.save(); c.globalAlpha = top.opacity; c.drawImage(img(top.canvas), 0, 0); c.restore(); this.layers = this.layers.filter((l) => l !== top); this.activeId = below.id; },
    });
    this.touch();
    return true;
  }

  /** Clears every layer. Undoable. */
  clearAll(): void {
    const backups = this.layers.map((l) => { const b = this.factory(this.width, this.height); ctxOf(b).drawImage(img(l.canvas), 0, 0); return { l, b }; });
    for (const { l } of backups) ctxOf(l.canvas).clearRect(0, 0, this.width, this.height);
    this.history.push({
      label: "Clear canvas", bytes: this.width * this.height * 4 * backups.length,
      undo: () => { for (const { l, b } of backups) { const c = ctxOf(l.canvas); c.clearRect(0, 0, this.width, this.height); c.drawImage(img(b), 0, 0); } },
      redo: () => { for (const { l } of backups) ctxOf(l.canvas).clearRect(0, 0, this.width, this.height); },
    });
    this.touch();
  }

  /** Changes a layer's visibility, lock, opacity or name. (Not part of undo, like in most paint apps.) */
  updateLayer(id: string, patch: Partial<Pick<Layer, "visible" | "locked" | "opacity" | "name">>) {
    const l = this.layer(id);
    if (!l) return;
    Object.assign(l, patch);
    this.touch();
  }
  setActive(id: string) { if (this.layer(id)) { this.activeId = id; this.touch(); } }

  setBackground(value: string | null) { this.background = value; this.touch(); }

  /** Paints the visible layers (and optionally the background) onto a context at `scale`. */
  renderTo(ctx: Ctx, scale = 1, background: string | null | "current" = "current"): void {
    const bg = background === "current" ? this.background : background;
    ctx.save();
    if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, this.width * scale, this.height * scale); }
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    for (const l of this.layers) {
      if (!l.visible) continue;
      ctx.globalAlpha = l.opacity;
      ctx.drawImage(img(l.canvas), 0, 0, this.width * scale, this.height * scale);
    }
    ctx.restore();
  }

  isBlank(): boolean {
    return this.layers.every((l) => { const d = ctxOf(l.canvas).getImageData(0, 0, this.width, this.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return false; return true; });
  }

  /** Records a changed rectangle of one layer so it can be undone and redone. */
  pixelEntry(label: string, layer: Layer, rect: Rect, before: ImageData, after: ImageData): HistoryEntry {
    const ctx = ctxOf(layer.canvas);
    return { label, bytes: before.data.length + after.data.length, undo: () => ctx.putImageData(before, rect.x, rect.y), redo: () => ctx.putImageData(after, rect.x, rect.y) };
  }
}
