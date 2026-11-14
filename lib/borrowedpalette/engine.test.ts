import { describe, expect, it } from "vitest";
import { createCanvas } from "@napi-rs/canvas";
import { StudioDoc, MAX_LAYERS, ctxOf, type CanvasFactory } from "./doc";
import { BRUSH_DEFAULTS, StrokeSession, floodFill, pickColor, type BrushSettings, type PaintTool, type Pt } from "./engine";
import { History } from "./history";

const factory: CanvasFactory = (w, h) => createCanvas(w, h) as never;
const W = 300, H = 200;
const RED = { r: 200, g: 30, b: 30 }, BLUE = { r: 30, g: 40, b: 200 };
const newDoc = () => new StudioDoc(factory, W, H);
const px = (doc: StudioDoc, layerIdx: number, x: number, y: number) => Array.from(ctxOf(doc.layers[layerIdx].canvas).getImageData(x, y, 1, 1).data);
const snapshot = (doc: StudioDoc) => doc.layers.map((l) => Buffer.from(ctxOf(l.canvas).getImageData(0, 0, W, H).data));
const settings = (tool: PaintTool, over: Partial<BrushSettings> = {}): BrushSettings => ({ ...BRUSH_DEFAULTS[tool], smoothing: 0, pressure: false, ...over });
const pt = (x: number, y: number, pressure = 1): Pt => ({ x, y, pressure });

function stroke(doc: StudioDoc, tool: PaintTool, s: BrushSettings, color: typeof RED, pts: [number, number][], seed = 1) {
  const st = new StrokeSession(doc, doc.active, tool, s, color, seed);
  st.begin(pt(...pts[0]));
  for (const p of pts.slice(1)) st.move(pt(...p));
  return { st, entry: st.end() };
}
const line = (x0: number, y0: number, x1: number, y1: number, n = 30): [number, number][] => Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);

describe("brush", () => {
  it("paints a solid line of the right colour and width", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush", { size: 20 }), RED, line(40, 100, 260, 100));
    const c = px(doc, 0, 150, 100);
    expect(c[3]).toBe(255);
    [200, 30, 30].forEach((v, i) => expect(Math.abs(c[i] - v)).toBeLessThanOrEqual(2)); // tiny rounding from antialiasing is fine
    expect(px(doc, 0, 150, 92)[3]).toBe(255); // inside the 20px width
    expect(px(doc, 0, 150, 80)[3]).toBe(0);   // well outside it
    expect(px(doc, 0, 20, 100)[3]).toBe(0);   // before the start
    expect(px(doc, 0, 275, 100)[3]).toBe(0);  // beyond the end
  });
  it("a single tap leaves a dot", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush", { size: 20 }), RED, [[100, 100]]);
    expect(px(doc, 0, 100, 100)[3]).toBe(255);
  });
  it("applies opacity once per stroke, even where the stroke crosses itself", () => {
    const doc = newDoc();
    const path: [number, number][] = [...line(40, 100, 260, 100), ...line(260, 100, 40, 100), ...line(40, 100, 260, 100)];
    stroke(doc, "brush", settings("brush", { size: 24, opacity: 0.5 }), RED, path);
    const a = px(doc, 0, 150, 100)[3];
    expect(a).toBeGreaterThanOrEqual(126); expect(a).toBeLessThanOrEqual(130);
  });
  it("two separate strokes at 50% do build up", () => {
    const doc = newDoc();
    const s = settings("brush", { size: 24, opacity: 0.5 });
    stroke(doc, "brush", s, RED, line(40, 100, 260, 100));
    stroke(doc, "brush", s, RED, line(40, 100, 260, 100));
    expect(px(doc, 0, 150, 100)[3]).toBeGreaterThan(185);
  });
  it("size control changes the stroke width", () => {
    const thin = newDoc(), thick = newDoc();
    stroke(thin, "brush", settings("brush", { size: 6 }), RED, line(40, 100, 260, 100));
    stroke(thick, "brush", settings("brush", { size: 60 }), RED, line(40, 100, 260, 100));
    expect(px(thin, 0, 150, 90)[3]).toBe(0);
    expect(px(thick, 0, 150, 90)[3]).toBe(255);
  });
  it("pen pressure changes width when enabled and is ignored when off", () => {
    const light = newDoc(), firm = newDoc(), off = newDoc();
    const run = (doc: StudioDoc, pressure: number, on: boolean) => {
      const st = new StrokeSession(doc, doc.active, "brush", settings("brush", { size: 40, pressure: on }), RED);
      st.begin(pt(40, 100, pressure)); for (let i = 1; i <= 30; i++) st.move(pt(40 + i * 7, 100, pressure)); st.end();
    };
    run(light, 0.1, true); run(firm, 1, true); run(off, 0.1, false);
    expect(px(light, 0, 150, 108)[3]).toBe(0);
    expect(px(firm, 0, 150, 108)[3]).toBe(255);
    expect(px(off, 0, 150, 108)[3]).toBe(255);
  });
  it("smoothing rounds off a jittery path but still reaches where the pointer ended", () => {
    const jitter: [number, number][] = Array.from({ length: 40 }, (_, i) => [30 + i * 6, 100 + (i % 2 ? 7 : -7)]);
    const rough = newDoc(), smooth = newDoc();
    stroke(rough, "liner", settings("liner", { size: 2, smoothing: 0 }), RED, jitter);
    stroke(smooth, "liner", settings("liner", { size: 2, smoothing: 0.9 }), RED, jitter);
    const spread = (doc: StudioDoc) => { const d = ctxOf(doc.layers[0].canvas).getImageData(0, 0, W, H).data; let lo = H, hi = 0; for (let y = 0; y < H; y++) for (let x = 60; x < 200; x++) if (d[(y * W + x) * 4 + 3] > 30) { lo = Math.min(lo, y); hi = Math.max(hi, y); } return hi - lo; };
    expect(spread(smooth)).toBeLessThan(spread(rough) - 4);
    const end = jitter[jitter.length - 1];
    let reached = false; const d = ctxOf(smooth.layers[0].canvas).getImageData(0, 0, W, H).data;
    for (let y = end[1] - 10; y <= end[1] + 10; y++) for (let x = end[0] - 4; x <= end[0] + 4; x++) if (d[(y * W + x) * 4 + 3] > 30) reached = true;
    expect(reached).toBe(true);
  });
});

describe("other brushes", () => {
  it("soft brush is denser in the middle than at its edge", () => {
    const doc = newDoc();
    stroke(doc, "soft", settings("soft", { size: 60, opacity: 1 }), RED, line(40, 100, 260, 100));
    const mid = px(doc, 0, 150, 100)[3], edge = px(doc, 0, 150, 100 - 27)[3];
    expect(mid).toBeGreaterThan(edge + 40); expect(edge).toBeGreaterThan(0);
  });
  it("pencil is grainy (uneven) and repeatable for the same seed", () => {
    const a = newDoc(), b = newDoc();
    stroke(a, "pencil", settings("pencil", { size: 16, opacity: 1 }), RED, line(40, 100, 260, 100), 5);
    stroke(b, "pencil", settings("pencil", { size: 16, opacity: 1 }), RED, line(40, 100, 260, 100), 5);
    const alphas = (doc: StudioDoc) => { const o: number[] = []; const d = ctxOf(doc.layers[0].canvas).getImageData(80, 94, 100, 12).data; for (let i = 3; i < d.length; i += 4) o.push(d[i]); return o; };
    const A = alphas(a);
    expect(Math.max(...A) - Math.min(...A)).toBeGreaterThan(80);
    expect(Buffer.from(A)).toEqual(Buffer.from(alphas(b)));
  });
  it("marker is translucent with a flat, angled tip; fine liner is thin", () => {
    const m = newDoc(), l = newDoc();
    stroke(m, "marker", settings("marker", { size: 30, opacity: 0.75 }), BLUE, line(40, 100, 260, 100));
    const a = px(m, 0, 150, 100)[3]; expect(a).toBeGreaterThan(180); expect(a).toBeLessThan(200);
    stroke(l, "liner", settings("liner", { size: 2 }), BLUE, line(40, 100, 260, 100));
    expect(px(l, 0, 150, 100)[3]).toBeGreaterThan(150); expect(px(l, 0, 150, 106)[3]).toBe(0);
  });
});

describe("eraser", () => {
  it("removes paint along its path only", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush", { size: 60 }), RED, line(40, 100, 260, 100));
    stroke(doc, "eraser", settings("eraser", { size: 20 }), RED, line(100, 100, 200, 100));
    expect(px(doc, 0, 150, 100)[3]).toBe(0);
    expect(px(doc, 0, 150, 120)[3]).toBe(255); // paint beside the erased line is untouched
    expect(px(doc, 0, 60, 100)[3]).toBe(255);
  });
  it("opacity makes it erase only partly", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush", { size: 60 }), RED, line(40, 100, 260, 100));
    stroke(doc, "eraser", settings("eraser", { size: 20, opacity: 0.5 }), RED, line(100, 100, 200, 100));
    const a = px(doc, 0, 150, 100)[3]; expect(a).toBeGreaterThan(120); expect(a).toBeLessThan(135);
  });
});

describe("undo, redo and history", () => {
  it("undo restores the exact previous pixels and redo restores the stroke", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush"), RED, line(40, 60, 260, 60));
    const afterFirst = snapshot(doc);
    stroke(doc, "soft", settings("soft", { size: 50 }), BLUE, line(40, 120, 260, 150));
    const afterSecond = snapshot(doc);
    expect(doc.history.undo()).toBe("Stroke");
    expect(snapshot(doc)[0].equals(afterFirst[0])).toBe(true);
    expect(doc.history.undo()).toBe("Stroke");
    expect(doc.isBlank()).toBe(true);
    expect(doc.history.undo()).toBeNull();
    doc.history.redo(); doc.history.redo();
    expect(snapshot(doc)[0].equals(afterSecond[0])).toBe(true);
    expect(doc.history.canRedo).toBe(false);
  });
  it("a new stroke after an undo clears redo", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush"), RED, line(40, 60, 260, 60));
    doc.history.undo();
    expect(doc.history.canRedo).toBe(true);
    stroke(doc, "brush", settings("brush"), BLUE, line(40, 90, 260, 90));
    expect(doc.history.canRedo).toBe(false);
  });
  it("cancel puts the layer back exactly", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush"), RED, line(40, 60, 260, 60));
    const before = snapshot(doc);
    const st = new StrokeSession(doc, doc.active, "brush", settings("brush", { size: 50 }), BLUE);
    st.begin(pt(50, 120)); st.move(pt(200, 140)); st.cancel();
    expect(snapshot(doc)[0].equals(before[0])).toBe(true);
    expect(doc.history.size).toBe(1);
  });
  it("keeps memory under its budget on a long session, always leaving the latest undo", () => {
    const h = new History(1_000_000);
    for (let i = 0; i < 50; i++) h.push({ label: "x", bytes: 100_000, undo() {}, redo() {} });
    expect(h.memory).toBeLessThanOrEqual(1_000_000);
    expect(h.canUndo).toBe(true);
    expect(h.size).toBeLessThanOrEqual(10);
  });
  it.skipIf(!process.env.PERF)("stays quick over a long session of many strokes", () => {
    const big = new StudioDoc(factory, 1600, 1200);
    const t0 = performance.now(); let moves = 0;
    for (let s = 0; s < 120; s++) {
      const st = new StrokeSession(big, big.active, s % 2 ? "soft" : "brush", settings(s % 2 ? "soft" : "brush", { size: 30, smoothing: 0.4 }), RED, s);
      st.begin(pt(100 + s * 5, 100));
      for (let i = 1; i <= 60; i++) { st.move(pt(100 + s * 5 + i * 15, 100 + Math.sin(i / 5) * 200 + s * 4)); moves++; }
      st.end();
    }
    const perMove = (performance.now() - t0) / moves;
    expect(perMove).toBeLessThan(16);
    expect(big.history.memory).toBeLessThan(160 * 1024 * 1024);
  }, 60_000);
});

describe("fill and picker", () => {
  function box(doc: StudioDoc) { stroke(doc, "liner", settings("liner", { size: 4 }), BLUE, [[80, 50], [220, 50], [220, 150], [80, 150], [80, 50]].flatMap((p, i, a) => i ? line(a[i - 1][0], a[i - 1][1], p[0], p[1], 20) : [])); }
  it("fills only inside a closed outline", () => {
    const doc = newDoc(); box(doc);
    const e = floodFill(doc, doc.active, 150, 100, RED, 1);
    expect(e).not.toBeNull();
    expect(px(doc, 0, 150, 100)).toEqual([200, 30, 30, 255]);
    expect(px(doc, 0, 30, 30)[3]).toBe(0);   // outside the box
    expect(px(doc, 0, 150, 50)[2]).toBeGreaterThan(150); // the outline itself is still blue
  });
  it("fill undoes cleanly and respects opacity", () => {
    const doc = newDoc(); box(doc);
    const before = snapshot(doc);
    floodFill(doc, doc.active, 150, 100, RED, 0.5);
    expect(px(doc, 0, 150, 100)[3]).toBeGreaterThanOrEqual(126);
    doc.history.undo();
    expect(snapshot(doc)[0].equals(before[0])).toBe(true);
  });
  it("can fill on a different layer from the outline", () => {
    const doc = newDoc(); box(doc);
    doc.addLayer();
    floodFill(doc, doc.active, 150, 100, RED, 1);
    expect(px(doc, 1, 150, 100)[3]).toBe(255);
    expect(px(doc, 0, 150, 100)[3]).toBe(0);
    expect(px(doc, 1, 30, 30)[3]).toBe(0);
  });
  it("on a blank canvas it fills everything", () => {
    const doc = newDoc(); floodFill(doc, doc.active, 10, 10, RED, 1);
    expect(px(doc, 0, 290, 190)).toEqual([200, 30, 30, 255]);
  });
  it("picker returns what you see, or null where it is transparent", () => {
    const doc = newDoc();
    expect(pickColor(doc, 10, 10)).toEqual({ r: 244, g: 240, b: 230 }); // paper
    stroke(doc, "brush", settings("brush", { size: 30 }), RED, line(40, 100, 260, 100));
    expect(pickColor(doc, 150, 100)).toEqual(RED);
    doc.setBackground(null);
    expect(pickColor(doc, 10, 10)).toBeNull();
    expect(pickColor(doc, -5, 10)).toBeNull();
  });
});

describe("layers", () => {
  it("adds, duplicates, reorders, merges and deletes, each undoable", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush"), RED, line(40, 60, 260, 60));
    const l2 = doc.addLayer()!; stroke(doc, "brush", settings("brush"), BLUE, line(40, 120, 260, 120));
    expect(doc.layers).toHaveLength(2);
    const dup = doc.duplicateLayer(l2.id)!; expect(doc.layers).toHaveLength(3);
    expect(px(doc, 2, 150, 120)).toEqual([30, 40, 200, 255]);
    doc.moveLayer(dup.id, -1); expect(doc.layers[1]).toBe(dup);
    doc.history.undo(); expect(doc.layers[2]).toBe(dup);
    doc.history.undo(); expect(doc.layers).toHaveLength(2);
    expect(doc.mergeDown(l2.id)).toBe(true);
    expect(px(doc, 0, 150, 120)).toEqual([30, 40, 200, 255]); expect(px(doc, 0, 150, 60)).toEqual([200, 30, 30, 255]);
    doc.history.undo();
    expect(doc.layers).toHaveLength(2); expect(px(doc, 0, 150, 120)[3]).toBe(0);
    expect(doc.removeLayer(l2.id)).toBe(true); expect(doc.layers).toHaveLength(1);
    doc.history.undo(); expect(doc.layers).toHaveLength(2); expect(px(doc, 1, 150, 120)[3]).toBe(255);
  });
  it("never deletes the last layer and stops at the maximum", () => {
    const doc = newDoc();
    expect(doc.removeLayer(doc.layers[0].id)).toBe(false);
    for (let i = 1; i < MAX_LAYERS; i++) expect(doc.addLayer()).not.toBeNull();
    expect(doc.addLayer()).toBeNull();
  });
  it("clear removes everything from every layer and can be undone", () => {
    const doc = newDoc();
    stroke(doc, "brush", settings("brush"), RED, line(40, 60, 260, 60));
    doc.addLayer(); stroke(doc, "brush", settings("brush"), BLUE, line(40, 120, 260, 120));
    const before = snapshot(doc);
    doc.clearAll(); expect(doc.isBlank()).toBe(true);
    doc.history.undo();
    expect(snapshot(doc).every((b, i) => b.equals(before[i]))).toBe(true);
  });
});
