import { Artist, Artwork, Story } from "./types";

// ─────────────────────────────────────────────────────────
// ARTISTS — canonical roster. Exactly three. Do not add more
// without explicit confirmation.
// ─────────────────────────────────────────────────────────
export const artists: Artist[] = [
  {
    id: "lenny",
    name: "Lenny Kariuki",
    slug: "lenny-kariuki",
    portrait: null, // no confirmed headshot on file — placeholder used in UI
    coverImage: "/art/lenny/happiness.jpg",
    bio: null,
    statement: null,
    location: "Nairobi, Kenya",
    socialLinks: {},
    featured: true,
    status: "confirmed",
  },
  {
    id: "john",
    name: "John Njoroge",
    slug: "john-njoroge",
    portrait: null,
    coverImage: "/art/john-cards/card-king-queen-royals.jpg",
    bio: null,
    statement: null,
    location: "Nairobi, Kenya",
    socialLinks: {},
    featured: true,
    status: "pending", // artwork attribution below is a curatorial placeholder — confirm with founder
  },
  {
    id: "alvin",
    name: "Alvin Mwangi",
    slug: "alvin-mwangi",
    portrait: null,
    coverImage: "/art/alvin/bloom-beneath-the-surface.jpg",
    bio: null,
    statement: null,
    location: "Nairobi, Kenya",
    socialLinks: {},
    featured: true,
    status: "pending", // artwork attribution below is a curatorial placeholder — confirm with founder
  },
];

// ─────────────────────────────────────────────────────────
// ARTWORKS — every price is null (Price on request) unless
// explicitly confirmed by the founder. Do not invent prices.
// ─────────────────────────────────────────────────────────
export const artworks: Artwork[] = [
  // Lenny Kariuki
  { id: "a1", title: "Happiness", slug: "happiness", artistId: "lenny", image: "/art/lenny/happiness.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Kenyan Roots", featured: true, tags: ["portrait"] },
  { id: "a2", title: "Guardians of the Plain", slug: "guardians-of-the-plain", artistId: "lenny", image: "/art/lenny/elephant-and-oryx.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: true, tags: ["wildlife"] },
  { id: "a3", title: "Mountain Solitude", slug: "mountain-solitude", artistId: "lenny", image: "/art/lenny/mountain-solitude.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: true, tags: ["landscape"] },
  { id: "a4", title: "Crowned in Red", slug: "crowned-in-red", artistId: "lenny", image: "/art/lenny/crowned-in-red.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Kenyan Roots", featured: false, tags: ["portrait"] },
  { id: "a5", title: "Herd at Dawn", slug: "herd-at-dawn", artistId: "lenny", image: "/art/lenny/elephant-herd-savanna.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: false, tags: ["wildlife"] },
  { id: "a6", title: "Dusk Reflections", slug: "dusk-reflections", artistId: "lenny", image: "/art/lenny/dusk-reflections.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: false, tags: ["landscape"] },
  { id: "a7", title: "The Spearman", slug: "the-spearman", artistId: "lenny", image: "/art/lenny/the-spearman.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Kenyan Roots", featured: true, tags: ["portrait"] },
  { id: "a8", title: "Wolf and Rose (Study)", slug: "wolf-and-rose-study", artistId: "lenny", image: "/art/lenny/wolf-and-rose-sketch.jpg", year: null, medium: "Graphite study", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["study"] },
  { id: "a9", title: "Tiger in Frost", slug: "tiger-in-frost", artistId: "lenny", image: "/art/lenny/tiger-in-frost.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: false, tags: ["wildlife"] },
  { id: "a10", title: "Village Under the Mountain", slug: "village-under-the-mountain", artistId: "lenny", image: "/art/lenny/village-under-the-mountain.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: false, tags: ["landscape"] },
  { id: "a11", title: "Cutlery Cross", slug: "cutlery-cross", artistId: "lenny", image: "/art/lenny/cutlery-cross.jpg", year: null, medium: "Found-object sculpture", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["sculpture"] },

  // John Njoroge — hand-painted playing cards (placeholder attribution)
  { id: "b1", title: "The Royals", slug: "the-royals", artistId: "john", image: "/art/john-cards/card-king-queen-royals.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["card"] },
  { id: "b2", title: "Queen of Hearts", slug: "queen-of-hearts", artistId: "john", image: "/art/john-cards/card-queen-of-hearts.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["card"] },
  { id: "b3", title: "Five of Clubs", slug: "five-of-clubs", artistId: "john", image: "/art/john-cards/card-5-clubs-guitar.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },
  { id: "b4", title: "Seven of Diamonds", slug: "seven-of-diamonds", artistId: "john", image: "/art/john-cards/card-7-strawberries.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },
  { id: "b5", title: "Eight of Spades", slug: "eight-of-spades", artistId: "john", image: "/art/john-cards/card-8-spades-bench.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },
  { id: "b6", title: "Three of Clubs", slug: "three-of-clubs-hummingbird", artistId: "john", image: "/art/john-cards/card-3-hummingbird.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },

  // Alvin Mwangi — placeholder attribution
  { id: "c1", title: "Bloom Beneath the Surface", slug: "bloom-beneath-the-surface", artistId: "alvin", image: "/art/alvin/bloom-beneath-the-surface.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["portrait"] },
  { id: "c2", title: "Study in Graphite", slug: "study-in-graphite", artistId: "alvin", image: "/art/alvin/study-in-graphite.jpg", year: null, medium: "Graphite study", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["study"] },
  { id: "c3", title: "Unbound", slug: "unbound", artistId: "alvin", image: "/art/alvin/unbound.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["abstract"] },
  { id: "c4", title: "Faces of Africa", slug: "faces-of-africa", artistId: "alvin", image: "/art/alvin/faces-of-africa.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["mixed"] },
  { id: "c5", title: "Golden Gaze", slug: "golden-gaze", artistId: "alvin", image: "/art/alvin/golden-gaze.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Kenyan Roots", featured: false, tags: ["portrait"] },
  { id: "c6", title: "The Orator", slug: "the-orator", artistId: "alvin", image: "/art/alvin/the-orator.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Kenyan Roots", featured: false, tags: ["portrait"] },
  { id: "c7", title: "Currents", slug: "currents", artistId: "alvin", image: "/art/alvin/currents.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["abstract"] },
  { id: "c8", title: "Two Skies", slug: "two-skies", artistId: "alvin", image: "/art/alvin/two-skies.jpg", year: null, medium: null, dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Land & Light", featured: false, tags: ["landscape"] },
];

export const collections = ["Kenyan Roots", "Land & Light", "Contemporary Kenya"];

// ─────────────────────────────────────────────────────────
// STORIES — Gazette. Placeholder set; expand with real posts.
// ─────────────────────────────────────────────────────────
export const stories: Story[] = [
  { id: "s1", title: "Inside the Hand-Painted Deck", slug: "inside-the-hand-painted-deck", coverImage: "/art/john-cards/card-king-queen-royals.jpg", excerpt: "Fifty-two canvases the size of a palm — why a deck of cards can take longer than a full-sized painting.", category: "Process", artists: ["john"] },
  { id: "s2", title: "A Studio Visit: Nothing Wasted", coverImage: "/art/process/cutlery-cross.jpg", excerpt: "Inside the practice of building sculpture from repurposed materials.", slug: "a-studio-visit-nothing-wasted", category: "Studio", artists: ["lenny"] },
  { id: "s3", title: "What 'Provenance' Actually Means Here", coverImage: "/art/lenny/village-under-the-mountain.jpg", excerpt: "A certificate is only as good as the story behind it.", slug: "what-provenance-means-here", category: "Collecting", artists: [] },
];

export function getArtist(slug: string) {
  return artists.find((a) => a.slug === slug);
}
export function worksByArtist(artistId: string) {
  return artworks.filter((w) => w.artistId === artistId);
}
export function getArtwork(slug: string) {
  return artworks.find((w) => w.slug === slug);
}
