export type RGB = { r: number; g: number; b: number };

/**
 * Samples an already-loaded <img> onto a tiny offscreen canvas and buckets
 * pixels into a handful of dominant colors. Cheap, client-side, no backend.
 */
export function extractPalette(img: HTMLImageElement, count = 5): RGB[] {
  const canvas = document.createElement("canvas");
  const size = 48; // small sample, plenty for a palette
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return fallbackPalette();
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    // CORS-tainted canvas (cross-origin image without proper headers) — bail gracefully
    return fallbackPalette();
  }

  // bucket into a coarse color cube, tally frequency + track a representative sample
  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  const step = 32;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const key = `${Math.round(r / step)}-${Math.round(g / step)}-${Math.round(b / step)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r; bucket.g += g; bucket.b += b; bucket.n += 1;
    } else {
      buckets.set(key, { r, g, b, n: 1 });
    }
  }

  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const palette = sorted.slice(0, count).map((b) => ({
    r: Math.round(b.r / b.n),
    g: Math.round(b.g / b.n),
    b: Math.round(b.b / b.n),
  }));

  while (palette.length < count && palette.length > 0) palette.push(palette[palette.length - 1]);
  return palette.length ? palette : fallbackPalette();
}

function fallbackPalette(): RGB[] {
  // EARTGALLA brand tones, used if extraction fails (e.g. CORS)
  return [
    { r: 184, g: 151, b: 79 },   // gold
    { r: 177, g: 88, b: 58 },    // terracotta
    { r: 23, g: 53, b: 44 },     // deep green
    { r: 163, g: 39, b: 31 },    // kenya red
    { r: 19, g: 18, b: 17 },     // charcoal
  ];
}

export function rgbToCss({ r, g, b }: RGB, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function luminance({ r, g, b }: RGB) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
function saturation({ r, g, b }: RGB) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

/**
 * Artistic, explicitly-not-scientific read on a palette — variance in
 * lightness/saturation across the sampled colors maps to a few descriptive
 * labels. This is presented in the UI as interpretation, not measurement.
 */
export function artDNA(palette: RGB[]) {
  const lums = palette.map(luminance);
  const sats = palette.map(saturation);
  const avgLum = lums.reduce((a, b) => a + b, 0) / lums.length;
  const lumSpread = Math.max(...lums) - Math.min(...lums);
  const avgSat = sats.reduce((a, b) => a + b, 0) / sats.length;

  const form = lumSpread > 0.45 ? "Layered" : avgSat > 0.5 ? "Organic" : "Geometric";
  const texture = avgSat > 0.55 ? "Pigment" : lumSpread > 0.4 ? "Grain" : "Canvas";
  const energy = avgLum > 0.55 && avgSat > 0.45 ? "Dynamic" : avgLum < 0.35 ? "Earthbound" : "Calm";

  return { form, texture, energy };
}
