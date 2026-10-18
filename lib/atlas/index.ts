import { artists, artworks, stories } from "@/lib/data";
import { communities, places, practices } from "./data";
import type { ExploreItem } from "./types";

const lc = (...parts: (string | null | undefined | string[])[]) =>
  parts.flat().filter(Boolean).join(" ").toLowerCase();

/** Builds the one searchable index behind /explore from the catalogue and the Atlas records. Published or in-review only. */
export function buildExploreIndex(): ExploreItem[] {
  const items: ExploreItem[] = [];

  for (const c of communities.filter((r) => r.status === "published")) {
    items.push({
      id: c.id, type: "community", title: c.names.primary, blurb: c.summary, href: `/explore/communities/${c.slug}`,
      image: c.coverImage, facets: { place: c.placeIds, practice: c.practiceIds },
      haystack: lc(c.names.primary, c.names.alternates, c.summary, c.languages),
    });
  }

  for (const p of practices.filter((r) => r.status !== "draft" && r.status !== "withdrawn")) {
    items.push({
      id: p.id, type: "practice", title: p.names.primary, blurb: p.summary, href: `/explore/practices/${p.slug}`,
      image: p.coverImage,
      facets: { era: p.era, material: p.materials, place: p.placeIds },
      haystack: lc(p.names.primary, p.names.alternates, p.summary, p.materials, p.techniques, p.classifications.map((c) => c.label)),
    });
  }

  for (const pl of places) {
    items.push({
      id: pl.id, type: "place", title: pl.name, blurb: `${pl.artistIds.length} artists on the roster are based here.`,
      href: "/art-lab", image: null, facets: { place: [pl.id] },
      haystack: lc(pl.name, pl.scale),
    });
  }

  for (const a of artists) {
    items.push({
      id: `artist-${a.id}`, type: "artist", title: a.name, blurb: a.bio, href: `/artists/${a.slug}`, image: a.portrait ?? a.coverImage,
      facets: { place: a.location.toLowerCase().includes("nairobi") ? ["place-nairobi"] : [] },
      haystack: lc(a.name, a.location, a.bio),
    });
  }

  for (const w of artworks) {
    const practice = practices.filter((p) => p.artworkIds.includes(w.id)).map((p) => p.id);
    items.push({
      id: `work-${w.id}`, type: "work", title: w.title, blurb: w.description, href: `/gallery/${w.slug}`, image: w.image,
      facets: { material: w.medium ? [w.medium] : [], topic: w.tags, practice },
      haystack: lc(w.title, w.medium, w.description, w.tags, w.collection),
    });
  }

  for (const s of stories) {
    items.push({
      id: `story-${s.id}`, type: "story", title: s.title, blurb: s.excerpt, href: `/gazette/${s.slug}`, image: s.coverImage,
      facets: { topic: [s.category] }, haystack: lc(s.title, s.excerpt, s.category),
    });
  }

  return items;
}

export const TYPE_LABEL: Record<ExploreItem["type"], string> = {
  community: "Communities", practice: "Practices", place: "Places", artist: "Artists", work: "Artworks", story: "Stories",
};
