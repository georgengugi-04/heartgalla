import { deltaE, labToRgb, parseHex, rgbToHex, rgbToHsl, rgbToLab, labToLch, type HSL, type Lab, type RGB } from "./color";

export type Role = "dominant" | "accent" | "highlight" | "shadow";
export type Temperature = "warm" | "cool" | "neutral";

export type Swatch = {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  /** share of the (counted) image this colour stands for, 0–1 */
  share: number;
  temperature: Temperature;
};

export type Analysis = {
  /** up to 16 distinct colours, most prominent first */
  pool: Swatch[];
  /** a large, plain, edge-to-edge colour (a mat, a wall, a sheet of paper) that was set aside, if one was found */
  background: Swatch | null;
  stats: { saturation: number; lightness: number; warmShare: number; coolShare: number };
  sampled: number;
};

export const PALETTE_SIZES = [
  { size: 3, label: "Minimal" },
  { size: 5, label: "Essential" },
  { size: 8, label: "Standard" },
  { size: 12, label: "Extended" },
  { size: 16, label: "Experimental" },
] as const;

export function temperatureOf(hsl: HSL): Temperature {
  if (hsl.s < 12 || hsl.l < 8 || hsl.l > 94) return "neutral";
  if (hsl.h <= 65 || hsl.h >= 330) return "warm";
  if (hsl.h >= 160 && hsl.h <= 270) return "cool";
  return "neutral";
}

const makeSwatch = (rgb: RGB, share: number): Swatch => {
  const hsl = rgbToHsl(rgb);
  return { hex: rgbToHex(rgb), rgb, hsl, share, temperature: temperatureOf(hsl) };
};

type Cluster = { lab: Lab; w: number };

/** Deterministic weighted k-means (k-means++-style seeding without randomness) in OKLab. */
function kmeans(points: Cluster[], k: number, iterations = 14): Cluster[] {
  if (points.length <= k) return points.map((p) => ({ ...p }));
  const centres: Lab[] = [];
  const heaviest = points.reduce((a, b) => (b.w > a.w ? b : a));
  centres.push(heaviest.lab);
  const minD = points.map((p) => deltaE(p.lab, centres[0]) ** 2);
  while (centres.length < k) {
    let best = -1, bestScore = -1;
    for (let i = 0; i < points.length; i++) {
      const score = minD[i] * Math.sqrt(points[i].w);
      if (score > bestScore) { bestScore = score; best = i; }
    }
    if (best < 0 || bestScore <= 0) break;
    centres.push(points[best].lab);
    for (let i = 0; i < points.length; i++) minD[i] = Math.min(minD[i], deltaE(points[i].lab, points[best].lab) ** 2);
  }
  const assign = new Int32Array(points.length);
  for (let it = 0; it < iterations; it++) {
    let moved = false;
    for (let i = 0; i < points.length; i++) {
      let bi = 0, bd = Infinity;
      for (let c = 0; c < centres.length; c++) {
        const d = deltaE(points[i].lab, centres[c]);
        if (d < bd) { bd = d; bi = c; }
      }
      if (assign[i] !== bi) { assign[i] = bi; moved = true; }
    }
    const sum = centres.map(() => ({ L: 0, a: 0, b: 0, w: 0 }));
    for (let i = 0; i < points.length; i++) {
      const s = sum[assign[i]], p = points[i];
      s.L += p.lab.L * p.w; s.a += p.lab.a * p.w; s.b += p.lab.b * p.w; s.w += p.w;
    }
    sum.forEach((s, c) => { if (s.w > 0) centres[c] = { L: s.L / s.w, a: s.a / s.w, b: s.b / s.w }; });
    if (!moved) break;
  }
  const out = centres.map((lab) => ({ lab, w: 0 }));
  for (let i = 0; i < points.length; i++) out[assign[i]].w += points[i].w;
  return out.filter((c) => c.w > 0);
}

/** Merge clusters closer than `threshold` (weighted average), heaviest first so big colours absorb small neighbours. */
function mergeNear(clusters: Cluster[], threshold: number): Cluster[] {
  const sorted = [...clusters].sort((a, b) => b.w - a.w);
  const out: Cluster[] = [];
  for (const c of sorted) {
    const hit = out.find((o) => deltaE(o.lab, c.lab) < threshold);
    if (hit) {
      const w = hit.w + c.w;
      hit.lab = { L: (hit.lab.L * hit.w + c.lab.L * c.w) / w, a: (hit.lab.a * hit.w + c.lab.a * c.w) / w, b: (hit.lab.b * hit.w + c.lab.b * c.w) / w };
      hit.w = w;
    } else out.push({ lab: { ...c.lab }, w: c.w });
  }
  return out.sort((a, b) => b.w - a.w);
}

/**
 * Reads RGBA pixels and returns a pool of up to 16 distinct, meaningful colours.
 * Steps: sample → 4096-bin histogram → k-means in OKLab → merge near-duplicates → drop noise → set aside a plain edge-to-edge background.
 */
export function analyse(data: Uint8ClampedArray | Uint8Array, width: number, height: number, opts: { ignoreBackground?: boolean } = {}): Analysis {
  const total = width * height;
  const stride = Math.max(1, Math.floor(Math.sqrt(total / 40000)));
  type Bin = { r: number; g: number; b: number; n: number; edge: number };
  const bins = new Map<number, Bin>();
  const edge = Math.max(1, Math.round(Math.min(width, height) * 0.04));
  let counted = 0, edgeCounted = 0;
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 128) continue;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      let bin = bins.get(key);
      if (!bin) { bin = { r: 0, g: 0, b: 0, n: 0, edge: 0 }; bins.set(key, bin); }
      bin.r += r; bin.g += g; bin.b += b; bin.n++;
      counted++;
      if (x < edge || y < edge || x >= width - edge || y >= height - edge) { bin.edge++; edgeCounted++; }
    }
  }
  const empty: Analysis = { pool: [], background: null, stats: { saturation: 0, lightness: 0, warmShare: 0, coolShare: 0 }, sampled: counted };
  if (counted === 0) return empty;

  const points: (Cluster & { edge: number })[] = [...bins.values()].map((b) => ({ lab: rgbToLab({ r: b.r / b.n, g: b.g / b.n, b: b.b / b.n }), w: b.n, edge: b.edge }));
  let clusters = kmeans(points, 28);

  // Which cluster owns most of the picture's edge? If it is also large and plain, it's a background (mat, wall, paper).
  const edgeOwner = new Map<Cluster, number>();
  for (const p of points) {
    let best = clusters[0], bd = Infinity;
    for (const c of clusters) { const d = deltaE(p.lab, c.lab); if (d < bd) { bd = d; best = c; } }
    edgeOwner.set(best, (edgeOwner.get(best) ?? 0) + p.edge);
  }
  let bgCluster: Cluster | null = null;
  if (edgeCounted > 0) {
    for (const [c, e] of edgeOwner) {
      const chroma = labToLch(c.lab).C;
      if (e / edgeCounted > 0.55 && c.w / counted > 0.18 && chroma < 0.045) { bgCluster = c; break; }
    }
  }
  const bgShare = bgCluster ? bgCluster.w / counted : 0;
  const background = bgCluster ? makeSwatch(labToRgb(bgCluster.lab), bgShare) : null;
  if (bgCluster && opts.ignoreBackground !== false) clusters = clusters.filter((c) => c !== bgCluster);

  const kept = clusters.reduce((s, c) => s + c.w, 0) || 1;
  // merge near-duplicates; loosen the threshold only if we would otherwise have fewer than 16 colours
  let merged: Cluster[] = [];
  for (const threshold of [6, 4.5, 3, 2]) {
    merged = mergeNear(clusters, threshold);
    if (merged.filter((c) => c.w / kept >= 0.004).length >= 16) break;
  }
  // noise: drop slivers (<0.4%), unless that would leave fewer than 3
  let pool = merged.filter((c) => c.w / kept >= 0.004);
  if (pool.length < 3) pool = merged.slice(0, 3);
  pool = pool.slice(0, 16);
  const poolTotal = pool.reduce((s, c) => s + c.w, 0) || 1;
  const swatches = pool.map((c) => makeSwatch(labToRgb(c.lab), c.w / poolTotal));

  const stats = swatches.reduce(
    (a, s) => ({
      saturation: a.saturation + s.hsl.s * s.share,
      lightness: a.lightness + s.hsl.l * s.share,
      warmShare: a.warmShare + (s.temperature === "warm" ? s.share : 0),
      coolShare: a.coolShare + (s.temperature === "cool" ? s.share : 0),
    }),
    { saturation: 0, lightness: 0, warmShare: 0, coolShare: 0 },
  );
  return { pool: swatches, background, stats, sampled: counted };
}

/**
 * Picks `size` colours from the pool: starts with the most prominent, then repeatedly adds the colour that is both
 * reasonably present and furthest from what is already chosen — so the palette is balanced, not just "the biggest N".
 */
export function selectPalette(pool: Swatch[], size: number): Swatch[] {
  if (pool.length <= size) return [...pool];
  const labs = new Map(pool.map((s) => [s.hex, rgbToLab(s.rgb)]));
  const chosen: Swatch[] = [pool[0]];
  while (chosen.length < size) {
    let best: Swatch | null = null, bestScore = -1;
    for (const s of pool) {
      if (chosen.includes(s)) continue;
      const near = Math.min(...chosen.map((c) => deltaE(labs.get(s.hex)!, labs.get(c.hex)!)));
      const score = Math.sqrt(s.share) * Math.min(near, 40);
      if (score > bestScore) { bestScore = score; best = s; }
    }
    if (!best) break;
    chosen.push(best);
  }
  return chosen.sort((a, b) => b.share - a.share);
}

/** Which job each colour does in the palette. A colour can have more than one. */
export function rolesOf(palette: Swatch[]): Map<string, Role[]> {
  const roles = new Map<string, Role[]>();
  if (palette.length === 0) return roles;
  const add = (s: Swatch, r: Role) => roles.set(s.hex, [...(roles.get(s.hex) ?? []), r]);
  const dominant = palette.reduce((a, b) => (b.share > a.share ? b : a));
  add(dominant, "dominant");
  const chroma = (s: Swatch) => labToLch(rgbToLab(s.rgb)).C;
  const accentPool = palette.filter((s) => s !== dominant);
  if (accentPool.length) add(accentPool.reduce((a, b) => (chroma(b) > chroma(a) ? b : a)), "accent");
  add(palette.reduce((a, b) => (rgbToLab(b.rgb).L > rgbToLab(a.rgb).L ? b : a)), "highlight");
  add(palette.reduce((a, b) => (rgbToLab(b.rgb).L < rgbToLab(a.rgb).L ? b : a)), "shadow");
  return roles;
}

export const swatchFromHex = (hex: string, share = 0): Swatch | null => {
  const rgb = parseHex(hex);
  return rgb ? makeSwatch(rgb, share) : null;
};
