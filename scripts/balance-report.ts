/**
 * Prints how each part of the site is shared between the artists, against the split in lib/balance.ts.
 * Run it after adding or moving works:   npx tsx scripts/balance-report.ts
 * "Target" is the artists' 40 / 30 / 20 among themselves (44 / 33 / 22) — lists are whole works, so small lists round.
 */
import { readFileSync } from "node:fs";
import { artworks, artists } from "../lib/data";
import { SHARES, ARTIST_ORDER, balancedMix, balancedOrder, quotas, type ArtistId } from "../lib/balance";
import { getCollection, getDialogueWorks } from "../lib/collection";
import { getCollectorPairs, getSoundWorks } from "../lib/lab";
import { getVideoStories } from "../lib/videoStories";

type Row = { surface: string; counts: Record<ArtistId, number> };
const rows: Row[] = [];
const count = (list: { artistId: string }[]): Record<ArtistId, number> => {
  const c = { lenny: 0, alvin: 0, john: 0 } as Record<ArtistId, number>;
  for (const it of list) if (it.artistId in c) c[it.artistId as ArtistId] += 1;
  return c;
};
const bySlug = (slug: string) => artworks.find((a) => a.slug === slug);
const add = (surface: string, list: { artistId: string }[]) => rows.push({ surface, counts: count(list) });

add("Whole catalogue (every work)", artworks);
add("Homepage hero (9 slides)", balancedMix(artworks, 9));
add("Homepage featured row (5)", balancedMix(artworks.filter((a) => a.featured), 5));
add("Homepage Collection (7)", getCollection().map((x) => ({ artistId: artworks.find((a) => a.slug === x.slug)!.artistId })));
add("Gallery 'All' — first 12 shown", balancedOrder(artworks).slice(0, 12));
add("Art Lab marquee (10)", balancedMix(artworks, 10));
add("Wear the Art choices (8)", balancedMix(artworks, 8));
const alchemy = readFileSync(new URL("../components/alchemy/ArtAlchemy.tsx", import.meta.url), "utf8").match(/\[("[a-z-]+"(?:, )?)+\]\.includes/)?.[0] ?? "";
add("Art Alchemy (5)", (alchemy.match(/"([a-z-]+)"/g) ?? []).map((q) => bySlug(q.replace(/"/g, ""))).filter(Boolean) as { artistId: string }[]);
add("Collector's Eye (16 appearances)", getCollectorPairs().flat().map((x) => ({ artistId: bySlug(x.slug)!.artistId })));
add("Sound of Colour (4)", getSoundWorks().map((x) => ({ artistId: bySlug(x.slug)!.artistId })));
add("Art Dialogue (7)", getDialogueWorks().map((x) => ({ artistId: bySlug(x.slug)!.artistId })));
const artistOf = (name: string) => artists.find((a) => a.name === name)!.id;
add("Stories (items)", getVideoStories().flatMap((st) => st.items.map(() => ({ artistId: artistOf(st.title) }))));
add("Gazette teaser (1 profile each)", ARTIST_ORDER.map((id) => ({ artistId: id })));

const pct = (n: number, t: number) => `${String(Math.round((n / t) * 100)).padStart(3)}%`;
const target = ARTIST_ORDER.map((a) => `${a} ${Math.round((SHARES[a] / (SHARES.lenny + SHARES.alvin + SHARES.john)) * 100)}%`).join(" · ");
console.log(`\nThe split (lib/balance.ts): Lenny ${SHARES.lenny * 100}% · Alvin ${SHARES.alvin * 100}% · John ${SHARES.john * 100}% · developer ${SHARES.developer * 100}%`);
console.log(`Among works, the artists' target is: ${target}\n`);
console.log("Surface".padEnd(36), "Lenny".padEnd(11), "Alvin".padEnd(11), "John".padEnd(11), "works");
for (const r of rows) {
  const t = ARTIST_ORDER.reduce((s, a) => s + r.counts[a], 0);
  console.log(r.surface.padEnd(36), ...ARTIST_ORDER.map((a) => `${r.counts[a]} (${pct(r.counts[a], t)})`.padEnd(11)), t);
}
console.log(`\nWhat an ideal list of 7 / 9 / 10 looks like: ${[7, 9, 10].map((n) => { const q = quotas(n); return `${n} → ${q.lenny}/${q.alvin}/${q.john}`; }).join("   ")}`);
