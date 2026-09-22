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
    portrait: "/art/lenny/portrait.jpg",
    coverImage: "/art/lenny/happiness.jpg",
    bio: "Lenny Kariuki is a Nairobi-based visual artist working primarily in paint and pencil. He trained as an architect at the Technical University of Kenya, and that background shows in how he builds a composition — structure and proportion worked out before color is ever allowed to soften it. The body of work on EARTGALLA is a concentrated one: everything currently on view was made within the past year.",
    statement: "Where an architect's drawing has to resolve into something buildable, Lenny's paintings and pencil studies are allowed to stay unresolved a little longer — the same discipline, aimed instead at a feeling rather than a floor plan.",
    location: "Nairobi, Kenya",
    socialLinks: {},
    featured: true,
    status: "confirmed",
  },
  {
    id: "alvin",
    name: "Alvin Mwangi",
    slug: "alvin-mwangi",
    portrait: null,
    coverImage: "/art/alvin/bloom-beneath-the-surface.jpg",
    bio: "Alvin Mwangi is a painter. His fuller profile — process, influences, the rest of his story — is still being written with him and will be published here as it's confirmed.",
    statement: null,
    location: "Nairobi, Kenya",
    socialLinks: {},
    featured: true,
    status: "pending", // artwork attribution below is a curatorial placeholder — confirm with founder
  },
  {
    id: "john",
    name: "John Njoroge",
    slug: "john-njoroge",
    portrait: null,
    coverImage: "/art/john-cards/card-king-queen-royals.jpg",
    bio: "John Njoroge takes a more technical route into his work, drawing heavily on nature and working across a range of materials rather than settling on one. His hand-painted playing card collection on EARTGALLA is a good entry point into that instinct — each face treated as its own small, deliberate construction.",
    statement: null, // no direct statement on file yet
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

  // Lenny Kariuki — recent additions. Titles and descriptions were written for EARTGALLA
  // (editorial voice, not the artist's words) and describe only what is visible in each piece.
  // Medium is filled only where the surface is plain to see; year/dimensions stay null until confirmed.
  { id: "a12", title: "Between Hours", slug: "between-hours", artistId: "lenny", image: "/art/lenny/between-hours.jpg", year: null, medium: null, dimensions: null, description: "One canvas, two skies. On the left, a night of scattered stars and a white crescent moon; on the right, a sunset that runs from deep red to gold beneath a glowing orange sun. A single tree stands across the divide, bare-branched in the dark and full-crowned in the light, rooted on one black horizon line.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["landscape"] },
  { id: "a13", title: "Lovers' Moon", slug: "lovers-moon", artistId: "lenny", image: "/art/lenny/lovers-moon.jpg", year: null, medium: null, dimensions: null, description: "A copper moon hangs over a still lake, holding a small drawn embrace at its centre. Below it a flat-crowned tree and a rider on a rearing horse are cut out in solid black, while the pale outlines of a howling wolf and a faint face drift in the sky, almost dissolved into the blue.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["landscape"] },
  { id: "a14", title: "The Scavenger", slug: "the-scavenger", artistId: "lenny", image: "/art/lenny/the-scavenger.jpg", year: null, medium: null, dimensions: null, description: "A spotted hyena stands before the vast grey bulk of an elephant and turns to face the viewer, its muzzle and chest streaked with red. More crimson runs through the elephant's flank and along the pale form at lower right, all set against a cool mint ground and a strip of ochre earth.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["wildlife"] },
  { id: "a15", title: "Denim Tide", slug: "denim-tide", artistId: "lenny", image: "/art/lenny/denim-tide.jpg", year: null, medium: "Hand-painted denim", dimensions: null, description: "A breaking wave, painted in creamy white foam over deep and turquoise blues, curls across the back pocket of a pair of faded jeans. The stitched edge of the pocket frames the sea, and the dark weave of the denim shows through inside the curl of the wave.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["wearable"] },
  { id: "a16", title: "Still Becoming", slug: "still-becoming", artistId: "lenny", image: "/art/lenny/still-becoming.jpg", year: null, medium: null, dimensions: null, description: "A woman with long, centre-parted hair looks straight out of the canvas. Her face is fully worked in warm browns, with bold winged eyeliner, while her hair, her top and the leaves behind her are still in outline. Shown mid-process, the portrait keeps its dark contour lines and loose grey shading visible on the bare canvas.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["portrait", "study"] },
  { id: "a17", title: "Kitchen Brigade", slug: "kitchen-brigade", artistId: "lenny", image: "/art/lenny/kitchen-brigade.jpg", year: null, medium: "Hand-painted sneakers", dimensions: null, description: "A pair of white sneakers, boxed in tissue paper, carries one painted scene across both shoes. On the upper shoe two figures in white chef's jackets lean out of the side stripe; on the lower one a blue rat and a brown rat in yellow pass a wooden spoon between them.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["wearable"] },
  { id: "a18", title: "Slice of Trouble", slug: "slice-of-trouble", artistId: "lenny", image: "/art/lenny/slice-of-trouble.jpg", year: null, medium: "Hand-painted sneaker", dimensions: null, description: "On the side of a white sneaker, a scowling grey cat hooks its claws over the edge of the sole, eyeing a small brown mouse who has curled up beside a wedge of yellow cheese. The cheese follows the curve of the shoe's own side panel, with a scooped bite already missing.", price: null, currency: "KES", availability: "unlisted", collection: null, featured: false, tags: ["wearable"] },

  // John Njoroge — hand-painted playing cards (placeholder attribution)
  { id: "b1", title: "The Royals", slug: "the-royals", artistId: "john", image: "/art/john-cards/card-5-clubs-guitar.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["card"] },
  { id: "b2", title: "Seven of Clubs", slug: "queen-of-hearts", artistId: "john", image: "/art/john-cards/card-queen-of-hearts.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: true, tags: ["card"] },
  { id: "b3", title: "Five of Clubs", slug: "five-of-clubs", artistId: "john", image: "/art/john-cards/card-king-queen-royals.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },
  { id: "b4", title: "Seven of Diamonds", slug: "seven-of-diamonds", artistId: "john", image: "/art/john-cards/card-3-hummingbird.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },
  { id: "b5", title: "Eight of Spades", slug: "eight-of-spades", artistId: "john", image: "/art/john-cards/card-7-clubs.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },
  { id: "b6", title: "Three of Clubs", slug: "three-of-clubs-hummingbird", artistId: "john", image: "/art/john-cards/card-queen-of-hearts-alt.jpg", year: null, medium: "Hand-painted card", dimensions: null, description: null, price: null, currency: "KES", availability: "unlisted", collection: "Contemporary Kenya", featured: false, tags: ["card"] },

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
  {
    id: "s3",
    title: "What 'Provenance' Actually Means Here",
    coverImage: "/art/lenny/village-under-the-mountain.jpg",
    excerpt: "A certificate is only as good as the story behind it.",
    slug: "what-provenance-means-here",
    category: "Collecting",
    artists: [],
  },
  {
    id: "s4",
    title: "Lenny Kariuki: From Blueprint to Canvas",
    slug: "lenny-kariuki-from-blueprint-to-canvas",
    coverImage: "/art/lenny/the-spearman.jpg",
    excerpt: "A Nairobi architect trained at the Technical University of Kenya spent the past year putting that same discipline into paint and pencil instead.",
    category: "People",
    artists: ["lenny"],
    content: [
      "Lenny Kariuki did not start out planning to be painted into the story of a Nairobi art platform. He started out at the Technical University of Kenya, training as an architect — learning to think in load, proportion, and the quiet logic that holds a structure together before it's ever beautiful.",
      "That training didn't disappear when he picked up a brush. It shows in how a Lenny Kariuki piece is built: the same instinct for structure that goes into a floor plan goes into a face, a figure, a landscape — worked out in pencil first, the way a building is worked out in section and elevation, before paint is allowed to do the softer, less predictable work.",
      "What's on EARTGALLA right now is not a career retrospective. It's a single, concentrated stretch — every painting and pencil study in his current collection was made within the past year. Seen together, they read less like a greatest-hits and more like a sketchbook that got serious: an architect's eye, pointed at something that doesn't need planning permission.",
      "It's why we're leading the Gazette with him. Of the three artists building this platform with us, Lenny's is the body of work we can speak to most completely right now — and it's a good place to start understanding what EARTGALLA is trying to do: take a real person's real practice, and give it room to be seen properly.",
    ],
  },
  {
    id: "s6",
    title: "Alvin Mwangi: A Profile Still Being Written",
    slug: "alvin-mwangi-a-profile-still-being-written",
    coverImage: "/art/alvin/bloom-beneath-the-surface.jpg",
    excerpt: "Alvin Mwangi is a painter on the EARTGALLA roster. His fuller story is still being put together.",
    category: "People",
    artists: ["alvin"],
    content: [
      "Alvin Mwangi is a painter, and one of the three artists this platform is built around. Beyond that, we're being deliberately careful here — we'd rather publish less about him than publish something we made up.",
      "His full biography, process, and story will be added to this page as soon as it's confirmed directly with him. Until then, his selected works speak for themselves.",
    ],
  },
  {
    id: "s5",
    title: "John Njoroge: Building With What the Land Gives",
    slug: "john-njoroge-building-with-what-the-land-gives",
    coverImage: "/art/john-cards/card-3-hummingbird.jpg",
    excerpt: "A more technical, materials-first practice — John Njoroge works from nature outward, and his hand-painted card collection is the clearest window into it so far.",
    category: "Process",
    artists: ["john"],
    content: [
      "John Njoroge's approach is a more technical one — less about a single signature style, more about a working method. Nature runs through most of it: motifs, textures, and a general instinct to look outward at the land before looking inward at himself.",
      "He also doesn't stay loyal to one material. Where a lot of painters settle into a single surface and medium, John moves across several, using whatever a particular piece seems to call for. The clearest example of that on EARTGALLA right now is his hand-painted playing card collection — fifty-two small, deliberate constructions, each one its own tiny decision about material and motif.",
      "We're still building out his full profile and story. What's here is accurate as far as it goes; there's more to tell, and it'll be added as it's confirmed.",
    ],
  },
  {
    id: "s1",
    title: "Inside the Hand-Painted Deck",
    slug: "inside-the-hand-painted-deck",
    coverImage: "/art/john-cards/card-king-queen-royals.jpg",
    excerpt: "Fifty-two canvases the size of a palm — why a deck of cards can take longer than a full-sized painting.",
    category: "Process",
    artists: ["john"],
    content: [
      "A standard deck fixes almost everything before the first brushstroke. The rank and the suit are already decided — what's left is the small rectangle of card stock around them, and what goes there is the only real decision to make, fifty-two separate times.",
      "That constraint is what makes the collection interesting to look at as a set rather than one at a time. A club becomes the body of a koi fish. Another becomes a hummingbird, wings worked into the shape the symbol already had. A handful of strawberries, dotted with pink flowers, cover a card that would otherwise just be seven plain diamonds. None of it erases the card underneath — the rank still reads clearly in the corner — it just refuses to leave the rest of the card blank.",
      "Working at that scale changes the kind of decision-making involved. There's no room to rework a passage the way you might on a larger canvas; the composition has to work at a size you could hold flat on your palm, on stock that doesn't forgive much correction. Fifty-two of those, each a self-contained decision about materials and motif, adds up to more total working time than a single large piece — even though no individual card takes very long to look at.",
      "We're still building out the fuller story behind this collection — how John selects a card to work on, how long each one takes, what decides a motif. What's here is what can already be seen across the cards themselves; the rest will be added as it's confirmed with him directly.",
    ],
  },
  {
    id: "s2",
    title: "A Studio Visit: Nothing Wasted",
    coverImage: "/art/lenny/cutlery-cross.jpg",
    excerpt: "Inside the practice of building sculpture from repurposed materials.",
    slug: "a-studio-visit-nothing-wasted",
    category: "Studio",
    artists: ["lenny"],
  },
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
