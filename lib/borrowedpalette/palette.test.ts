import { describe, expect, it } from "vitest";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import path from "node:path";
import { deltaE, hslToRgb, labToRgb, parseHex, rgbToHex, rgbToHsl, rgbToLab, labToLch } from "./color";
import { analyse, PALETTE_SIZES, rolesOf, selectPalette } from "./extract";
import { deriveVariation, evolve, harmonyFor, NO_EVOLUTION, VARIATIONS } from "./variations";

const pub = (p: string) => path.join(process.cwd(), "public", p);
async function analyseFile(rel: string, ignoreBackground = true) {
  const img = await loadImage(pub(rel));
  const scale = Math.min(1, 240 / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale)), h = Math.max(1, Math.round(img.height * scale));
  const c = createCanvas(w, h);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return analyse(ctx.getImageData(0, 0, w, h).data, w, h, { ignoreBackground });
}

describe("colour maths", () => {
  it("round-trips hex, HSL and OKLab", () => {
    for (const hex of ["#B8974F", "#080808", "#F5F2EA", "#FF0000", "#12AB9C"]) {
      const rgb = parseHex(hex)!;
      expect(rgbToHex(rgb)).toBe(hex);
      const back = hslToRgb(rgbToHsl(rgb));
      expect(Math.abs(back.r - rgb.r) + Math.abs(back.g - rgb.g) + Math.abs(back.b - rgb.b)).toBeLessThanOrEqual(6);
      expect(labToRgb(rgbToLab(rgb))).toEqual(rgb);
    }
    expect(parseHex("#abc")).toEqual({ r: 170, g: 187, b: 204 });
    expect(parseHex("nope")).toBeNull();
  });
  it("measures distance sensibly", () => {
    const red = rgbToLab({ r: 200, g: 30, b: 30 }), nearRed = rgbToLab({ r: 202, g: 31, b: 30 }), blue = rgbToLab({ r: 30, g: 30, b: 200 });
    expect(deltaE(red, nearRed)).toBeLessThan(2);
    expect(deltaE(red, blue)).toBeGreaterThan(20);
  });
});

describe("extraction on synthetic images", () => {
  it("finds the known colours with the right proportions", () => {
    const w = 100, h = 100, data = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      const c = i < 5000 ? [200, 30, 30] : i < 8000 ? [30, 60, 200] : [240, 200, 40]; // 50% red, 30% blue, 20% yellow
      data.set([...c, 255], i * 4);
    }
    const a = analyse(data, w, h);
    expect(a.pool.length).toBe(3);
    expect(a.pool[0].hex).toBe("#C81E1E");
    expect(a.pool[0].share).toBeCloseTo(0.5, 1);
    expect(a.pool[1].share).toBeCloseTo(0.3, 1);
  });
  it("sets aside a plain edge-to-edge background and can keep it when asked", () => {
    const w = 100, h = 100, data = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const inside = x >= 25 && x < 75 && y >= 25 && y < 75;
      data.set(inside ? [180, 40, 40, 255] : [245, 245, 240, 255], (y * w + x) * 4);
    }
    const ignored = analyse(data, w, h, { ignoreBackground: true });
    expect(ignored.background?.hex).toBe("#F5F5F0");
    expect(ignored.pool.map((s) => s.hex)).not.toContain("#F5F5F0");
    const kept = analyse(data, w, h, { ignoreBackground: false });
    expect(kept.pool.map((s) => s.hex)).toContain("#F5F5F0");
  });
  it("ignores transparent pixels and handles an empty image", () => {
    const data = new Uint8ClampedArray(40 * 4);
    expect(analyse(data, 10, 4).pool).toEqual([]);
  });
});

describe("extraction on the real artwork", () => {
  const files = [
    "art/lenny/happiness.jpg",
    "art/lenny/elephant-and-oryx.jpg",
    "art/alvin/golden-gaze.jpg",
    "art/john-cards/card-queen-of-hearts.jpg",
  ];
  for (const f of files) {
    it(`${f}: every size gives distinct, ordered, sensible colours`, async () => {
      const a = await analyseFile(f);
      expect(a.pool.length).toBeGreaterThanOrEqual(8);
      expect(a.pool.reduce((s, c) => s + c.share, 0)).toBeCloseTo(1, 5);
      for (const { size } of PALETTE_SIZES) {
        const p = selectPalette(a.pool, size);
        expect(p.length).toBe(Math.min(size, a.pool.length));
        expect(new Set(p.map((s) => s.hex)).size).toBe(p.length); // no duplicates
        for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++)
          expect(deltaE(rgbToLab(p[i].rgb), rgbToLab(p[j].rgb))).toBeGreaterThan(1.5); // no near-identical pair
        expect([...p].sort((x, y) => y.share - x.share)).toEqual(p);
      }
      const roles = rolesOf(selectPalette(a.pool, 8));
      const flat = [...roles.values()].flat();
      for (const r of ["dominant", "accent", "highlight", "shadow"]) expect(flat).toContain(r);
    });
  }
  it("a smaller palette is a subset of the pool and keeps the most prominent colour", async () => {
    const a = await analyseFile("art/lenny/happiness.jpg");
    const five = selectPalette(a.pool, 5), three = selectPalette(a.pool, 3);
    expect(five.every((s) => a.pool.includes(s))).toBe(true);
    expect(five).toContain(a.pool[0]);
    expect(three).toContain(a.pool[0]);
  });
});

describe("variations", () => {
  const base = [{ r: 184, g: 151, b: 79 }, { r: 40, g: 90, b: 140 }, { r: 200, g: 60, b: 50 }, { r: 120, g: 120, b: 120 }];
  const chroma = (c: typeof base[number]) => labToLch(rgbToLab(c)).C;
  const light = (c: typeof base[number]) => rgbToLab(c).L;
  it("original returns the colours unchanged", () => expect(deriveVariation(base, "original")).toEqual(base));
  it("muted lowers chroma and vibrant raises it, derived from the same colours", () => {
    const muted = deriveVariation(base, "muted"), vivid = deriveVariation(base, "vibrant");
    base.forEach((c, i) => { expect(chroma(muted[i])).toBeLessThanOrEqual(chroma(c)); if (chroma(c) > 0.02) expect(chroma(muted[i])).toBeLessThan(chroma(c) * 0.7); expect(chroma(vivid[i])).toBeGreaterThanOrEqual(chroma(c) - 0.002); });
  });
  it("warm moves every colour towards orange; cool towards blue", () => {
    const warm = deriveVariation(base, "warm"), cool = deriveVariation(base, "cool");
    base.forEach((c, i) => { expect(warm[i].r - warm[i].b).toBeGreaterThan(c.r - c.b); expect(cool[i].r - cool[i].b).toBeLessThan(c.r - c.b); });
  });
  it("high contrast widens the lightness range", () => {
    const hc = deriveVariation(base, "contrast");
    const range = (cs: typeof base) => Math.max(...cs.map(light)) - Math.min(...cs.map(light));
    expect(range(hc)).toBeGreaterThan(range(base));
  });
  it("locked colours never change, in every variation and in evolution", () => {
    const locked = [true, false, false, true];
    for (const { kind } of VARIATIONS) { const v = deriveVariation(base, kind, locked); expect(v[0]).toEqual(base[0]); expect(v[3]).toEqual(base[3]); }
    const e = evolve(base, { saturation: 80, temperature: 60, brightness: 40 }, locked);
    expect(e[0]).toEqual(base[0]); expect(e[3]).toEqual(base[3]); expect(e[1]).not.toEqual(base[1]);
  });
  it("evolution at zero is the original; sliders move things the right way", () => {
    expect(evolve(base, NO_EVOLUTION)).toEqual(base);
    expect(chroma(evolve(base, { ...NO_EVOLUTION, saturation: -100 })[2])).toBeLessThan(0.01);
    expect(light(evolve(base, { ...NO_EVOLUTION, brightness: 50 })[1])).toBeGreaterThan(light(base[1]));
    expect(light(evolve(base, { ...NO_EVOLUTION, brightness: -50 })[1])).toBeLessThan(light(base[1]));
  });
  it("harmony keeps lightness and chroma, rotates hue", () => {
    const [comp] = harmonyFor(base[1], "complementary");
    const a = labToLch(rgbToLab(base[1])), b = labToLch(rgbToLab(comp));
    expect(Math.abs(a.L - b.L)).toBeLessThan(0.03);
    const diff = Math.abs(((b.h - a.h + 360) % 360) - 180);
    expect(diff).toBeLessThan(6);
    expect(harmonyFor(base[0], "triadic")).toHaveLength(2);
  });
});
