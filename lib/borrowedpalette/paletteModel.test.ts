import { describe, expect, it } from "vitest";
import { analyse } from "./extract";
import { labToLch, rgbToHex, rgbToLab } from "./color";
import { emptyModel, LIMITED_COUNT, paletteReducer as r, type PaletteModel } from "./paletteModel";

function pool() {
  // a synthetic 16-colour picture so the pool is realistic
  const w = 64, h = 64, d = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) { const k = i % 16; d.set([k * 15 + 10, 255 - k * 12, (k * 53) % 256, 255], i * 4); }
  return analyse(d, w, h).pool;
}
const loaded = (size = 5): PaletteModel => r(emptyModel(), { type: "load", pool: pool(), size });
const chroma = (rgb: { r: number; g: number; b: number }) => labToLch(rgbToLab(rgb)).C;

describe("palette model", () => {
  it("loads the requested size and switching sizes keeps the pool (no re-extraction)", () => {
    let m = loaded(5); expect(m.entries).toHaveLength(5);
    for (const s of [3, 8, 12, 16]) { m = r(m, { type: "size", size: s }); expect(m.entries.length).toBe(Math.min(s, m.pool.length)); }
    expect(new Set(m.entries.map((e) => rgbToHex(e.base))).size).toBe(m.entries.length);
  });
  it("variations come from each colour's own base, and switching back to Original is exact", () => {
    let m = loaded(5); const orig = m.entries.map((e) => e.rgb);
    m = r(m, { type: "variation", kind: "muted" });
    m.entries.forEach((e, i) => expect(chroma(e.rgb)).toBeLessThanOrEqual(chroma(orig[i]) + 1e-6));
    m = r(m, { type: "variation", kind: "vibrant" }); m = r(m, { type: "variation", kind: "original" });
    expect(m.entries.map((e) => e.rgb)).toEqual(orig);
  });
  it("a locked colour is untouched by variations, evolution and size changes", () => {
    let m = loaded(5); const id = m.entries[1].id, before = m.entries[1].rgb;
    m = r(m, { type: "lock", id });
    m = r(m, { type: "variation", kind: "vibrant" }); m = r(m, { type: "evolution", value: { saturation: -80, temperature: 50 } });
    expect(m.entries.find((e) => e.id === id)!.rgb).toEqual(before);
    m = r(m, { type: "size", size: 3 });
    expect(m.entries.find((e) => e.id === id)?.rgb).toEqual(before);
    expect(m.entries.find((e) => !e.locked)!.rgb).not.toEqual(m.entries.find((e) => !e.locked)!.base);
  });
  it("evolution always keeps the original so you can go back", () => {
    let m = loaded(5); const orig = m.entries.map((e) => e.base);
    m = r(m, { type: "evolution", value: { saturation: 70, brightness: -40, temperature: 30 } });
    expect(m.entries.map((e) => e.base)).toEqual(orig);
    m = r(m, { type: "resetEvolution" });
    expect(m.entries.map((e) => e.rgb)).toEqual(orig);
  });
  it("reorders, removes (keeping at least one) and restores", () => {
    let m = loaded(5); const ids = m.entries.map((e) => e.id);
    m = r(m, { type: "move", id: ids[0], dir: 1 }); expect(m.entries[1].id).toBe(ids[0]);
    expect(r(m, { type: "move", id: m.entries[0].id, dir: -1 })).toBe(m); // already first
    m = r(m, { type: "remove", id: ids[2] }); expect(m.entries).toHaveLength(4); expect(m.removed).toHaveLength(1);
    m = r(m, { type: "restore" }); expect(m.entries).toHaveLength(5); expect(m.removed).toHaveLength(0);
    let one = loaded(3); for (const e of [...one.entries]) one = r(one, { type: "remove", id: e.id }); expect(one.entries).toHaveLength(1);
  });
  it("adds custom colours (no duplicates) that variations never change", () => {
    let m = loaded(3);
    m = r(m, { type: "addCustom", rgb: { r: 1, g: 2, b: 3 } }); m = r(m, { type: "addCustom", rgb: { r: 1, g: 2, b: 3 } });
    expect(m.entries.filter((e) => e.custom)).toHaveLength(1);
    m = r(m, { type: "variation", kind: "contrast" });
    expect(m.entries.find((e) => e.custom)!.rgb).toEqual({ r: 1, g: 2, b: 3 });
    m = r(m, { type: "size", size: 5 }); expect(m.entries.filter((e) => e.custom)).toHaveLength(1);
  });
  it("limited mode accepts exactly three colours and lets you swap them", () => {
    let m = loaded(5); const ids = m.entries.map((e) => e.id);
    for (let i = 0; i < 5; i++) m = r(m, { type: "limit", id: ids[i] });
    expect(m.limited).toEqual(ids.slice(0, LIMITED_COUNT));
    m = r(m, { type: "limit", id: ids[0] }); m = r(m, { type: "limit", id: ids[4] });
    expect(m.limited).toEqual([ids[1], ids[2], ids[4]]);
    m = r(m, { type: "remove", id: ids[1] }); expect(m.limited).not.toContain(ids[1]);
  });
  it("restore-original resets colours, locks and sliders", () => {
    let m = loaded(5); m = r(m, { type: "variation", kind: "warm" }); m = r(m, { type: "lock", id: m.entries[0].id });
    m = r(m, { type: "restoreOriginal" });
    expect(m.entries.every((e) => !e.locked && e.rgb === e.base)).toBe(true); expect(m.variation).toBe("original");
  });
});
