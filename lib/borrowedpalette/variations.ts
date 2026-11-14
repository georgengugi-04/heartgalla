import { labToLch, labToRgb, lchToLab, rgbToLab, type RGB } from "./color";

export type VariationKind = "original" | "muted" | "vibrant" | "warm" | "cool" | "contrast";
export const VARIATIONS: { kind: VariationKind; label: string; hint: string }[] = [
  { kind: "original", label: "Original", hint: "Exactly as extracted" },
  { kind: "muted", label: "Muted", hint: "Chroma × 0.55" },
  { kind: "vibrant", label: "Vibrant", hint: "Chroma × 1.45" },
  { kind: "warm", label: "Warm", hint: "Shifts every colour towards orange" },
  { kind: "cool", label: "Cool", hint: "Shifts every colour towards blue" },
  { kind: "contrast", label: "High contrast", hint: "Pushes lights lighter and darks darker" },
];

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Colour-balance shift in OKLab: positive = warmer (towards orange), negative = cooler (towards blue). `t` is −1…1. */
function shiftTemperature(rgb: RGB, t: number): RGB {
  const lab = rgbToLab(rgb);
  return labToRgb({ L: lab.L, a: lab.a + t * 0.035, b: lab.b + t * 0.055 });
}

function scaleChroma(rgb: RGB, k: number): RGB {
  const lch = labToLch(rgbToLab(rgb));
  return labToRgb(lchToLab({ ...lch, C: lch.C * k }));
}

function contrast(rgb: RGB, k: number): RGB {
  const lch = labToLch(rgbToLab(rgb));
  return labToRgb(lchToLab({ L: clamp(0.5 + (lch.L - 0.5) * k, 0.03, 0.97), C: lch.C * 1.08, h: lch.h }));
}

/**
 * A variation is always computed from the ORIGINAL colours with a fixed formula, never by substituting other colours.
 * Locked colours (by index) come back unchanged.
 */
export function deriveVariation(original: RGB[], kind: VariationKind, locked: boolean[] = []): RGB[] {
  return original.map((c, i) => {
    if (locked[i] || kind === "original") return { ...c };
    switch (kind) {
      case "muted": return scaleChroma(c, 0.55);
      case "vibrant": return scaleChroma(c, 1.45);
      case "warm": return shiftTemperature(c, 0.8);
      case "cool": return shiftTemperature(c, -0.8);
      case "contrast": return contrast(c, 1.6);
    }
  });
}

/** Palette Evolution: three sliders (−100…100) applied to the original. All zero returns the original exactly. */
export type Evolution = { saturation: number; temperature: number; brightness: number };
export const NO_EVOLUTION: Evolution = { saturation: 0, temperature: 0, brightness: 0 };

export function evolve(original: RGB[], e: Evolution, locked: boolean[] = []): RGB[] {
  return original.map((c, i) => {
    if (locked[i] || (e.saturation === 0 && e.temperature === 0 && e.brightness === 0)) return { ...c };
    const lab = rgbToLab(c);
    const lch = labToLch(lab);
    const k = e.saturation >= 0 ? 1 + e.saturation / 50 : 1 + e.saturation / 100; // −100 → grey, +100 → ×3
    const withChroma = lchToLab({ L: clamp(lch.L + (e.brightness / 100) * 0.3, 0, 1), C: lch.C * k, h: lch.h });
    const t = e.temperature / 100;
    return labToRgb({ L: withChroma.L, a: withChroma.a + t * 0.04, b: withChroma.b + t * 0.06 });
  });
}

/** Harmony suggestions for one colour: hue rotations in OKLCH, so lightness and chroma stay put. */
export type HarmonyKind = "complementary" | "analogous" | "triadic" | "split";
export const HARMONIES: { kind: HarmonyKind; label: string; angles: number[] }[] = [
  { kind: "complementary", label: "Complementary", angles: [180] },
  { kind: "analogous", label: "Analogous", angles: [-30, 30] },
  { kind: "triadic", label: "Triadic", angles: [120, 240] },
  { kind: "split", label: "Split-complementary", angles: [150, 210] },
];

export function harmonyFor(base: RGB, kind: HarmonyKind): RGB[] {
  const lch = labToLch(rgbToLab(base));
  const def = HARMONIES.find((h) => h.kind === kind)!;
  return def.angles.map((a) => labToRgb(lchToLab({ ...lch, h: (lch.h + a + 360) % 360 })));
}
