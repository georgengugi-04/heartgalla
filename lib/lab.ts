/**
 * Curated lists for the Art Lab experiments that work with artworks (Experiments 04 and 07; Curate Your Wall
 * picks its own tray). Everything comes from
 * lib/data.ts through getWorks() — no artwork data is duplicated here, only which works go where.
 *
 * Only works whose title has been checked against the image itself are listed. (Some entries in
 * lib/data.ts point at image files that show something else — e.g. the playing-card files — and
 * are kept out of anything that shows a title until the catalogue is corrected.)
 *
 * Server-side only (getWorks reads image headers). Pass the results to client components as props.
 */
import { getWorks, type CollectionItem } from "./collection";

/** Experiment 04 — The Collector's Eye: eight A/B rounds. Each pair is two different artists. */
const COLLECTOR_PAIRS: [string, string][] = [
  ["happiness", "unbound"], //                       Lenny · Alvin
  ["the-royals", "guardians-of-the-plain"], //       John · Lenny
  ["bloom-beneath-the-surface", "denim-tide"], //    Alvin · Lenny
  ["the-scavenger", "five-of-clubs"], //             Lenny · John
  ["currents", "seven-of-diamonds"], //              Alvin · John
  ["between-hours", "golden-gaze"], //               Lenny · Alvin
  ["eight-of-spades", "still-becoming"], //          John · Lenny
  ["the-orator", "lovers-moon"], //                  Alvin · Lenny
];

/** Experiment 07 — The Sound of Colour: the four works you can listen to. */
const SOUND_SLUGS = ["guardians-of-the-plain", "bloom-beneath-the-surface", "the-royals", "happiness"]; // Lenny · Alvin · John · Lenny

export type CollectorPair = [CollectionItem, CollectionItem];

export function getCollectorPairs(): CollectorPair[] {
  return COLLECTOR_PAIRS.flatMap(([a, b]) => {
    const w = getWorks([a, b]);
    return w.length === 2 ? [[w[0], w[1]] as CollectorPair] : []; // a round with a missing work is dropped
  });
}

export const getSoundWorks = (): CollectionItem[] => getWorks(SOUND_SLUGS);
