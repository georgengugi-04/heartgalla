import { rgbToHex, sameRgb, type RGB } from "./color";
import { selectPalette, type Swatch } from "./extract";
import { deriveVariation, evolve, NO_EVOLUTION, type Evolution, type VariationKind } from "./variations";

/** One colour in the working palette. `base` is the colour as extracted and never changes; `rgb` is what you see and paint with. */
export type Entry = { id: string; base: RGB; rgb: RGB; share: number; locked: boolean; custom: boolean };

export type PaletteModel = {
  pool: Swatch[];
  size: number;
  entries: Entry[];
  removed: Entry[];
  variation: VariationKind;
  evolution: Evolution;
  /** the up-to-3 colours chosen for the Limited Palette Challenge */
  limited: string[];
};

export type PaletteAction =
  | { type: "load"; pool: Swatch[]; size?: number }
  | { type: "size"; size: number }
  | { type: "variation"; kind: VariationKind }
  | { type: "evolution"; value: Partial<Evolution> }
  | { type: "resetEvolution" }
  | { type: "lock"; id: string }
  | { type: "move"; id: string; dir: -1 | 1 }
  | { type: "remove"; id: string }
  | { type: "restore" }
  | { type: "addCustom"; rgb: RGB }
  | { type: "limit"; id: string }
  | { type: "restoreOriginal" }
  | { type: "hydrate"; model: PaletteModel };

let n = 0;
const uid = () => `c${(n++).toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const LIMITED_COUNT = 3;

export const emptyModel = (): PaletteModel => ({ pool: [], size: 5, entries: [], removed: [], variation: "original", evolution: { ...NO_EVOLUTION }, limited: [] });

/** Recomputes the displayed colour of every colour that is neither locked nor custom, always starting from its extracted base. */
function recolor(m: PaletteModel, entries: Entry[]): Entry[] {
  return entries.map((e) => {
    if (e.locked || e.custom) return e;
    const v = deriveVariation([e.base], m.variation)[0];
    return { ...e, rgb: evolve([v], m.evolution)[0] };
  });
}

function build(pool: Swatch[], size: number, previous: Entry[] = []): Entry[] {
  const picked = selectPalette(pool, size);
  const byBase = new Map(previous.filter((e) => !e.custom).map((e) => [rgbToHex(e.base), e]));
  const fresh: Entry[] = picked.map((s) => {
    const old = byBase.get(s.hex);
    return old ? { ...old, share: s.share } : { id: uid(), base: s.rgb, rgb: s.rgb, share: s.share, locked: false, custom: false };
  });
  // colours the user added or locked stay, even when the palette size changes
  const keep = previous.filter((e) => e.custom || (e.locked && !fresh.some((f) => f.id === e.id)));
  return [...fresh, ...keep.filter((k) => !fresh.includes(k))];
}

export function paletteReducer(m: PaletteModel, a: PaletteAction): PaletteModel {
  switch (a.type) {
    case "hydrate": return a.model;
    case "load": {
      const size = a.size ?? m.size;
      const next = { ...emptyModel(), pool: a.pool, size };
      return { ...next, entries: build(a.pool, size) };
    }
    case "size": {
      const next = { ...m, size: a.size };
      return { ...next, entries: recolor(next, build(m.pool, a.size, m.entries)), limited: m.limited.filter((id) => build(m.pool, a.size, m.entries).some((e) => e.id === id)) };
    }
    case "variation": { const next = { ...m, variation: a.kind }; return { ...next, entries: recolor(next, m.entries) }; }
    case "evolution": { const next = { ...m, evolution: { ...m.evolution, ...a.value } }; return { ...next, entries: recolor(next, m.entries) }; }
    case "resetEvolution": { const next = { ...m, evolution: { ...NO_EVOLUTION }, variation: "original" as const }; return { ...next, entries: recolor(next, m.entries) }; }
    case "restoreOriginal": return { ...m, entries: m.entries.map((e) => ({ ...e, rgb: e.custom ? e.rgb : e.base, locked: false })), variation: "original", evolution: { ...NO_EVOLUTION } };
    case "lock": return { ...m, entries: m.entries.map((e) => (e.id === a.id ? { ...e, locked: !e.locked } : e)) };
    case "move": {
      const i = m.entries.findIndex((e) => e.id === a.id), j = i + a.dir;
      if (i < 0 || j < 0 || j >= m.entries.length) return m;
      const entries = [...m.entries]; [entries[i], entries[j]] = [entries[j], entries[i]];
      return { ...m, entries };
    }
    case "remove": {
      const e = m.entries.find((x) => x.id === a.id);
      if (!e || m.entries.length <= 1) return m;
      return { ...m, entries: m.entries.filter((x) => x.id !== a.id), removed: [...m.removed, e], limited: m.limited.filter((id) => id !== a.id) };
    }
    case "restore": return { ...m, entries: [...m.entries, ...m.removed], removed: [] };
    case "addCustom": {
      if (m.entries.some((e) => sameRgb(e.rgb, a.rgb))) return m;
      return { ...m, entries: [...m.entries, { id: uid(), base: a.rgb, rgb: a.rgb, share: 0, locked: true, custom: true }] };
    }
    case "limit": {
      if (m.limited.includes(a.id)) return { ...m, limited: m.limited.filter((id) => id !== a.id) };
      if (m.limited.length >= LIMITED_COUNT) return m;
      return { ...m, limited: [...m.limited, a.id] };
    }
  }
}
