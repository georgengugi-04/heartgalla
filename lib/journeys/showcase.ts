import { destinations } from "./destinations";
import type { Photo } from "./types";
import type { Frame } from "@/components/journeys/FrameStrip";

/** A photo may be shown on the public landing pages only once its licence is known. */
export const isPublishable = (p: Photo) => p.licence !== "unconfirmed";

/** Publishable photos across all destinations, labelled with the place, mixed so neighbours come from different places. */
export function showcaseFrames(max = 10): Frame[] {
  const lanes = destinations.map((d) => {
    const seen = new Set<string>();
    const all = [d.hero, ...(d.gallery ?? []), ...d.attractions.flatMap((a) => a.photos ?? [])].filter((p): p is Photo => !!p);
    return all.filter((p) => isPublishable(p) && !seen.has(p.src) && !!seen.add(p.src)).map((p) => ({ ...p, place: d.name }));
  });
  const out: Frame[] = [];
  const used = new Set<string>();
  for (let i = 0; out.length < max && i < Math.max(0, ...lanes.map((l) => l.length)); i++) {
    for (const l of lanes) { const p = l[i]; if (p && !used.has(p.src) && out.length < max) { used.add(p.src); out.push(p); } }
  }
  return out;
}
