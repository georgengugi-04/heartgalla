/**
 * How the site is shared between the artists — in ONE place.
 *
 *   Lenny Kariuki 40%  ·  Alvin Mwangi 30%  ·  John Njoroge 20%  ·  the developer 10%
 *
 * The three artists' shares are applied to every list of works on the site (homepage, Collection, gallery order,
 * marquee, Wear, the Art Lab experiments, Stories…). Rounded to whole works: a list of 7 gets 3 / 2 / 2, a list of
 * 10 gets 5 / 3 / 2. The developer's 10% isn't an artwork — it shows as a "Built by" presence (see lib/developer.ts).
 *
 * Change a number here and everything that uses balancedMix() / balancedOrder() follows. Hand-picked lists
 * (Collection, Sound of Colour, the Art Dialogue…) are checked by `npx tsx scripts/balance-report.ts`.
 */
import { UNVERIFIED_TITLES } from "./catalogueChecks";

export const SHARES = { lenny: 0.4, alvin: 0.3, john: 0.2, developer: 0.1 } as const;
export type ArtistId = "lenny" | "alvin" | "john";
export const ARTIST_ORDER: ArtistId[] = ["lenny", "alvin", "john"]; // largest share first

const total = SHARES.lenny + SHARES.alvin + SHARES.john;
const weight = (a: ArtistId) => SHARES[a] / total; // the artists' shares among themselves: 44% / 33% / 22%

type WithArtist = { artistId: string; slug?: string };
const isArtist = (id: string): id is ArtistId => (ARTIST_ORDER as string[]).includes(id);

/** How many of `n` slots each artist gets (largest-remainder rounding, so the total is always exactly n). */
export function quotas(n: number): Record<ArtistId, number> {
  const raw = ARTIST_ORDER.map((a) => ({ a, q: weight(a) * n }));
  const out = { lenny: 0, alvin: 0, john: 0 } as Record<ArtistId, number>;
  raw.forEach(({ a, q }) => (out[a] = Math.floor(q)));
  let left = n - ARTIST_ORDER.reduce((sum, a) => sum + out[a], 0);
  [...raw].sort((x, y) => y.q - Math.floor(y.q) - (x.q - Math.floor(x.q))).forEach(({ a }) => {
    if (left > 0) {
      out[a] += 1;
      left -= 1;
    }
  });
  return out;
}

/** The running order for given counts — smooth weighted round-robin, so nobody clumps at the start. */
function interleave(counts: Record<ArtistId, number>): ArtistId[] {
  const left = { ...counts };
  const credit = { lenny: 0, alvin: 0, john: 0 } as Record<ArtistId, number>;
  const out: ArtistId[] = [];
  const n = ARTIST_ORDER.reduce((sum, a) => sum + counts[a], 0);
  for (let i = 0; i < n; i++) {
    const live = ARTIST_ORDER.filter((a) => left[a] > 0);
    live.forEach((a) => (credit[a] += weight(a)));
    const pick = live.reduce((best, a) => (credit[a] > credit[best] ? a : best), live[0]);
    credit[pick] -= live.reduce((sum, a) => sum + weight(a), 0);
    left[pick] -= 1;
    out.push(pick);
  }
  return out;
}

function pools<T extends WithArtist>(items: T[]) {
  const p = { lenny: [] as T[], alvin: [] as T[], john: [] as T[] };
  for (const it of items) if (isArtist(it.artistId)) p[it.artistId].push(it);
  return p;
}

/**
 * Choose `n` works so the artists' shares hold, interleaved. Within an artist the input order is kept, and works
 * whose title doesn't match their image yet (lib/catalogueChecks.ts) are left out. If an artist has too few works
 * for their share, the others fill the gap.
 */
export function balancedMix<T extends WithArtist>(items: T[], n: number): T[] {
  const p = pools(items.filter((it) => !(it.slug && UNVERIFIED_TITLES.has(it.slug))));
  const q = quotas(n);
  let short = 0;
  for (const a of ARTIST_ORDER) {
    if (q[a] > p[a].length) {
      short += q[a] - p[a].length;
      q[a] = p[a].length;
    }
  }
  while (short > 0) {
    let moved = false;
    for (const a of ARTIST_ORDER) {
      if (short > 0 && q[a] < p[a].length) {
        q[a] += 1;
        short -= 1;
        moved = true;
      }
    }
    if (!moved) break;
  }
  return interleave(q).map((a) => p[a].shift() as T);
}

/** Every work, but interleaved by share instead of grouped by artist. An artist who runs out simply drops out. */
export function balancedOrder<T extends WithArtist>(items: T[]): T[] {
  const p = pools(items);
  const rest = items.filter((it) => !isArtist(it.artistId));
  const counts = { lenny: p.lenny.length, alvin: p.alvin.length, john: p.john.length };
  return [...interleave(counts).map((a) => p[a].shift() as T), ...rest];
}

/** Each artist's share of a list of works (0–1). Used by the balance report. */
export function shareOf(items: { artistId: string }[]): Record<ArtistId, number> {
  const c = { lenny: 0, alvin: 0, john: 0 } as Record<ArtistId, number>;
  for (const it of items) if (isArtist(it.artistId)) c[it.artistId] += 1;
  const n = ARTIST_ORDER.reduce((sum, a) => sum + c[a], 0) || 1;
  return { lenny: c.lenny / n, alvin: c.alvin / n, john: c.john / n };
}
