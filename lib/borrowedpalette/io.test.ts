import { describe, expect, it, vi } from "vitest";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { IDBFactory } from "fake-indexeddb";
import { StudioDoc, ctxOf, type CanvasFactory, type CanvasLike } from "./doc";
import { BRUSH_DEFAULTS, StrokeSession } from "./engine";
import { renderExport, exportFilename, slugify } from "./export";
import { ArtworkStore, StorageError, debounce, restoreDoc, serializeDoc, AUTOSAVE_ID, type Codec, type SavedRecord } from "./persist";

const factory: CanvasFactory = (w, h) => createCanvas(w, h) as never;
const RED = { r: 200, g: 30, b: 30 };
const codec: Codec = {
  toBlob: async (c: CanvasLike) => new Blob([new Uint8Array((c as never as { toBuffer(t: string): Buffer }).toBuffer("image/png") as Buffer)], { type: "image/png" }),
  decode: async (b) => (await loadImage(Buffer.from(await b.arrayBuffer()))) as never,
};
function drawn() {
  const doc = new StudioDoc(factory, 240, 160);
  const st = new StrokeSession(doc, doc.active, "brush", { ...BRUSH_DEFAULTS.brush, size: 20, smoothing: 0, pressure: false }, RED);
  st.begin({ x: 30, y: 80, pressure: 1 }); for (let i = 1; i <= 20; i++) st.move({ x: 30 + i * 9, y: 80, pressure: 1 }); st.end();
  doc.addLayer("Sketch");
  return doc;
}
const px = (c: CanvasLike, x: number, y: number) => Array.from(ctxOf(c).getImageData(x, y, 1, 1).data);

describe("export", () => {
  it("exports at 1× and 2× with the right pixel size", () => {
    const doc = drawn();
    const a = renderExport(doc, { scale: 1, background: "current" }), b = renderExport(doc, { scale: 2, background: "current" });
    expect([a.width, a.height, b.width, b.height]).toEqual([240, 160, 480, 320]);
    expect(px(b, 100, 160)[0]).toBeGreaterThan(190); // the stroke is still there, scaled up
  });
  it("transparent export has no background; white has; current uses the canvas background", () => {
    const doc = drawn();
    expect(px(renderExport(doc, { scale: 1, background: "transparent" }), 5, 5)[3]).toBe(0);
    expect(px(renderExport(doc, { scale: 1, background: "transparent" }), 120, 80)[3]).toBe(255);
    expect(px(renderExport(doc, { scale: 1, background: "white" }), 5, 5)).toEqual([255, 255, 255, 255]);
    expect(px(renderExport(doc, { scale: 1, background: "current" }), 5, 5)).toEqual([244, 240, 230, 255]);
    doc.setBackground(null);
    expect(px(renderExport(doc, { scale: 1, background: "current" }), 5, 5)[3]).toBe(0);
  });
  it("hidden layers are left out and layer opacity is respected", () => {
    const doc = drawn();
    doc.layers[0].opacity = 0.5;
    const half = px(renderExport(doc, { scale: 1, background: "transparent" }), 120, 80)[3];
    expect(half).toBeGreaterThan(124); expect(half).toBeLessThan(132);
    doc.layers[0].visible = false;
    expect(px(renderExport(doc, { scale: 1, background: "transparent" }), 120, 80)[3]).toBe(0);
  });
  it("adds an information card below the picture without touching it", () => {
    const doc = drawn();
    const plain = renderExport(doc, { scale: 1, background: "white" });
    const card = renderExport(doc, { scale: 1, background: "white", card: { title: "Evening Light", creator: "Amina", artistName: "Lenny Kariuki", artworkTitle: "Happiness", palette: ["#E7B037", "#143F71", "#A5391B"], date: new Date("2026-11-14") } });
    expect(card.width).toBe(240); expect(card.height).toBeGreaterThan(plain.height + 20);
    expect(px(card, 120, 80)).toEqual(px(plain, 120, 80));
    expect(px(card, 5, plain.height + 20)).toEqual([14, 14, 14, 255]); // dark strip
  });
  it("names files sensibly", () => {
    expect(slugify("Evening Light — Nairobi!")).toBe("evening-light-nairobi");
    expect(slugify("   ")).toBe("untitled");
    expect(exportFilename("My Art", { scale: 2, background: "transparent" })).toBe("eartgalla-my-art-transparent@2x.png");
  });
});

describe("saving and loading", () => {
  it("round-trips layers, opacity, visibility, background and picture exactly", async () => {
    const doc = drawn(); doc.layers[0].opacity = 0.8; doc.layers[1].visible = false; doc.setBackground("#161616");
    const store = new ArtworkStore(new IDBFactory());
    const ser = await serializeDoc(doc, codec);
    const rec: SavedRecord = { id: "a1", kind: "manual", title: "T", artistId: "lenny", artworkSlug: "happiness", createdAt: 1, updatedAt: 2, studio: { palette: ["#E7B037"], size: 5 }, ...ser };
    await store.put(rec);
    const back = (await store.get("a1"))!;
    expect(back.studio).toEqual({ palette: ["#E7B037"], size: 5 });
    const doc2 = await restoreDoc(factory, back, codec);
    expect(doc2.layers.map((l) => [l.name, l.visible, l.opacity])).toEqual([["Layer 1", true, 0.8], ["Sketch", false, 1]]);
    expect(doc2.background).toBe("#161616");
    expect(px(doc2.layers[0].canvas, 120, 80)).toEqual(px(doc.layers[0].canvas, 120, 80));
    expect(doc2.history.canUndo).toBe(false);
  });
  it("lists newest first, overwrites by id, deletes, and keeps a thumbnail", async () => {
    const store = new ArtworkStore(new IDBFactory());
    const ser = await serializeDoc(drawn(), codec);
    const base = { kind: "manual" as const, title: "", artistId: "alvin", artworkSlug: null, createdAt: 1, studio: {}, ...ser };
    await store.put({ ...base, id: "a", updatedAt: 10, title: "old" });
    await store.put({ ...base, id: AUTOSAVE_ID, kind: "autosave", updatedAt: 30 });
    await store.put({ ...base, id: "b", updatedAt: 20, title: "mid" });
    await store.put({ ...base, id: "a", updatedAt: 40, title: "old, renamed" });
    const list = await store.list();
    expect(list.map((r) => r.id)).toEqual(["a", AUTOSAVE_ID, "b"]);
    expect(list[0].title).toBe("old, renamed");
    expect(list[0].thumb).not.toBeNull();
    await store.delete("b");
    expect((await store.list()).map((r) => r.id)).toEqual(["a", AUTOSAVE_ID]);
    expect(await store.get("nope")).toBeNull();
  });
  it("reports a clear error where browser storage is unavailable", async () => {
    const store = new ArtworkStore(undefined);
    await expect(store.list()).rejects.toMatchObject({ code: "unavailable" });
    await expect(store.get("x")).rejects.toBeInstanceOf(StorageError);
  });
  it("turns a full disk into a helpful message", async () => {
    const idb = new IDBFactory(); const store = new ArtworkStore(idb);
    const ser = await serializeDoc(drawn(), codec);
    await store.list(); // open the DB
    const err = Object.assign(new Error("full"), { name: "QuotaExceededError" });
    const db = await (store as never as { db: Promise<IDBDatabase> }).db;
    vi.spyOn(db, "transaction").mockImplementation(() => { throw err; });
    await expect(store.put({ id: "q", kind: "manual", title: "", artistId: "x", artworkSlug: null, createdAt: 1, updatedAt: 1, studio: {}, ...ser })).rejects.toMatchObject({ code: "quota" });
  });
  it("debounces autosave and can flush it immediately", () => {
    vi.useFakeTimers(); const fn = vi.fn(); const d = debounce(fn, 1000);
    d(); d(); d(); vi.advanceTimersByTime(999); expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2); expect(fn).toHaveBeenCalledTimes(1);
    d(); d.flush(); expect(fn).toHaveBeenCalledTimes(2); vi.advanceTimersByTime(5000); expect(fn).toHaveBeenCalledTimes(2);
    d(); d.cancel(); vi.advanceTimersByTime(5000); expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
