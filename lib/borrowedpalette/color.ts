/** Colour maths for Borrowed Palette. Perceptual work (distance, variations, harmony) is done in OKLab/OKLCH. */
export type RGB = { r: number; g: number; b: number };
export type HSL = { h: number; s: number; l: number }; // h 0–360, s and l 0–100
export type Lab = { L: number; a: number; b: number }; // OKLab, L 0–1

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const to255 = (n: number) => Math.round(clamp(n, 0, 1) * 255);

export function rgbToHex({ r, g, b }: RGB): string {
  return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function parseHex(input: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === R) h = ((G - B) / d) % 6;
    else if (max === G) h = (B - R) / d + 2;
    else h = (R - G) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const S = s / 100, L = l / 100;
  const c = (1 - Math.abs(2 * L - 1)) * S;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = L - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: to255(r + m), g: to255(g + m), b: to255(b + m) };
}

const lin = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const unlin = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToLab({ r, g, b }: RGB): Lab {
  const R = lin(r), G = lin(g), B = lin(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** Linear-light RGB (not clamped) for an OKLab colour. */
function labToLinear({ L, a, b }: Lab): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (v: [number, number, number]) => v.every((c) => c >= -0.0005 && c <= 1.0005);

/** OKLab → sRGB. Colours outside the sRGB gamut are brought in by reducing chroma (hue and lightness are kept). */
export function labToRgb(lab: Lab): RGB {
  const L = clamp(lab.L, 0, 1);
  let v = labToLinear({ ...lab, L });
  if (!inGamut(v)) {
    let lo = 0, hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(labToLinear({ L, a: lab.a * mid, b: lab.b * mid }))) lo = mid; else hi = mid;
    }
    v = labToLinear({ L, a: lab.a * lo, b: lab.b * lo });
  }
  return { r: to255(unlin(clamp(v[0], 0, 1))), g: to255(unlin(clamp(v[1], 0, 1))), b: to255(unlin(clamp(v[2], 0, 1))) };
}

export type LCh = { L: number; C: number; h: number }; // h in degrees
export const labToLch = ({ L, a, b }: Lab): LCh => ({ L, C: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 });
export const lchToLab = ({ L, C, h }: LCh): Lab => ({ L, a: C * Math.cos((h * Math.PI) / 180), b: C * Math.sin((h * Math.PI) / 180) });

/** Perceptual distance (OKLab, scaled ×100): ~1 is barely visible, ~5 clearly different, 20+ very different. */
export function deltaE(a: Lab, b: Lab): number {
  return 100 * Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
}

export function contrastRatio(a: RGB, b: RGB): number {
  const y = (c: RGB) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const [hi, lo] = [y(a), y(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

/** Black or white, whichever reads better on top of this colour. */
export const readableOn = (c: RGB): string => (contrastRatio(c, { r: 0, g: 0, b: 0 }) >= contrastRatio(c, { r: 255, g: 255, b: 255 }) ? "#000000" : "#FFFFFF");

export const rgbCss = (c: RGB, alpha = 1) => (alpha === 1 ? `rgb(${c.r} ${c.g} ${c.b})` : `rgb(${c.r} ${c.g} ${c.b} / ${alpha})`);
export const sameRgb = (a: RGB, b: RGB) => a.r === b.r && a.g === b.g && a.b === b.b;
