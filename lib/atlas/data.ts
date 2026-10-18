import type { Community, Place, Practice } from "./types";

/**
 * Atlas seed data. This contains ONLY what the existing E-ArtGalla catalogue supports.
 *
 * - `communities` is empty on purpose. No community, tradition or cultural meaning is listed until it has been
 *   documented with the people concerned, with their permission. The Explore page shows an honest empty state.
 * - The two practices below describe contemporary work already in the catalogue (the `medium` field of each
 *   artwork). They make no claims about cultural origin or meaning.
 *
 * To add a record: fill every governance field (sources, permission, attribution, reviewer). See docs/ATLAS-CONTENT.md.
 */

export const communities: Community[] = [];

const catalogue = {
  id: "src-catalogue",
  kind: "catalogue" as const,
  title: "E-ArtGalla catalogue (lib/data.ts)",
  holder: "E-ArtGalla",
};

export const practices: Practice[] = [
  {
    id: "practice-painted-wearables",
    type: "practice",
    slug: "hand-painted-wearables",
    names: { primary: "Hand-painted wearables" },
    summary: "Painting applied directly to things people wear: denim and sneakers in the current catalogue.",
    claims: [
      {
        kind: "verified",
        text: "The catalogue lists hand-painted denim (Denim Tide) and hand-painted sneakers (Kitchen Brigade, Slice of Trouble), all credited to Lenny Kariuki.",
        sourceIds: ["src-catalogue"],
      },
    ],
    sources: [catalogue],
    attribution: [{ name: "Lenny Kariuki", role: "maker" }],
    permission: { level: "attribution-required", grantedBy: "E-ArtGalla roster agreement with the artist", commercial: false },
    status: "published",
    reviewedBy: "E-ArtGalla editorial",
    updatedAt: "2026-10-17",
    coverImage: "/art/lenny/denim-tide.jpg",
    classifications: [{ scheme: "E-ArtGalla catalogue", label: "Wearable art" }],
    materials: ["Denim", "Canvas sneakers", "Paint"],
    techniques: ["Hand painting"],
    communityIds: [],
    placeIds: ["place-nairobi"],
    artistIds: ["lenny"],
    artworkIds: ["a15", "a17", "a18"],
    storySlugs: [],
    era: ["contemporary"],
  },
  {
    id: "practice-painted-cards",
    type: "practice",
    slug: "hand-painted-playing-cards",
    names: { primary: "Hand-painted playing cards" },
    summary: "A set of playing cards, each painted by hand as its own small artwork.",
    claims: [
      {
        kind: "verified",
        text: "The catalogue lists a set of hand-painted cards (for example The Royals) in the Contemporary Kenya collection.",
        sourceIds: ["src-catalogue"],
      },
      {
        kind: "interpretation",
        text: "The Gazette reads John Njoroge's card collection as the clearest window into a materials-first, nature-led practice.",
        sourceIds: ["src-catalogue"],
        speaker: "E-ArtGalla Gazette",
      },
    ],
    sources: [catalogue],
    attribution: [{ name: "John Njoroge", role: "maker" }],
    permission: {
      level: "attribution-required",
      grantedBy: "E-ArtGalla roster agreement with the artist",
      commercial: false,
      note: "Maker attribution for some works is still being confirmed with the artists. See docs/CONTENT-ISSUES.md.",
    },
    status: "in-review",
    reviewedBy: null,
    updatedAt: "2026-10-17",
    coverImage: "/art/john-cards/card-5-clubs-guitar.jpg",
    classifications: [{ scheme: "E-ArtGalla catalogue", label: "Hand-painted cards" }],
    materials: ["Card", "Paint"],
    techniques: ["Hand painting"],
    communityIds: [],
    placeIds: ["place-nairobi"],
    artistIds: ["john"],
    artworkIds: ["b1", "b2"],
    storySlugs: [],
    era: ["contemporary"],
  },
];

export const places: Place[] = [
  {
    id: "place-nairobi",
    type: "place",
    slug: "nairobi",
    name: "Nairobi",
    scale: "city",
    artistIds: ["lenny", "john", "alvin"],
    practiceIds: ["practice-painted-wearables", "practice-painted-cards"],
    communityIds: [],
  },
];

export const getPractice = (slug: string) => practices.find((p) => p.slug === slug);
export const getCommunity = (slug: string) => communities.find((c) => c.slug === slug);
