// THE ART DIALOGUE — content rules (read before editing)
// - Never fabricate: artists, titles, years, mediums, prices, stories, locations,
//   exhibition history, or artist intentions. No "the artist intended/wanted/symbolises…".
// - Annotations describe only what can be seen. Where a material is only probably
//   visible, hedge it. Don't name a medium the data doesn't state.
// - Never annotate an image that hasn't actually been opened and looked at.
// - x/y are fractions (0–1) of the displayed image, verified against the real file.
// - Only artworks whose title actually matches their image are included here. Several
//   pre-existing catalog pieces were excluded after review — see the Art Lab build
//   notes for the list and why.

export type AnnotationKind = "Colour" | "Texture" | "Form" | "Composition" | "Detail";
export type Annotation = { id: string; kind: AnnotationKind; x: number; y: number; text: string };

export const annotationsBySlug: Record<string, Annotation[]> = {
  happiness: [
    {
      id: "fruit-bowl",
      kind: "Detail",
      x: 0.62,
      y: 0.11,
      text: "A round orange sits at the top of the bowl, ringed by green grapes and smaller citrus, each built from a few thick, separate strokes rather than fine detail.",
    },
    {
      id: "background-burst",
      kind: "Colour",
      x: 0.82,
      y: 0.1,
      text: "A warm field of yellow and orange fills the background, broken by streaks of cobalt blue that radiate outward like spray.",
    },
    {
      id: "shoulder-texture",
      kind: "Texture",
      x: 0.44,
      y: 0.68,
      text: "The paint sits in thick, visible ridges across the woman's shoulder and arm — each stroke laid separately rather than blended smooth.",
    },
    {
      id: "child-face",
      kind: "Composition",
      x: 0.7,
      y: 0.6,
      text: "The child's face, tucked against her back, is placed low and to the side — the quieter of the two figures, held rather than framed.",
    },
  ],
  "guardians-of-the-plain": [
    {
      id: "tusks",
      kind: "Detail",
      x: 0.38,
      y: 0.52,
      text: "Two pale tusks curve out from beneath the trunk — the only sharply lit passage in an otherwise shadowed face.",
    },
    {
      id: "ears",
      kind: "Form",
      x: 0.22,
      y: 0.34,
      text: "The elephant's ears fan out to fill most of the canvas width, giving the animal a towering, immovable presence.",
    },
    {
      id: "oryx",
      kind: "Composition",
      x: 0.7,
      y: 0.68,
      text: "An oryx with long, straight horns crosses low in front of the elephant's legs, keeping the elephant read as the larger shape behind it.",
    },
    {
      id: "sky",
      kind: "Colour",
      x: 0.35,
      y: 0.2,
      text: "A pale, cloud-streaked blue fills the upper third of the canvas — the only cool passage in a painting otherwise built from browns and tans.",
    },
  ],
  "hyena-study": [
    {
      id: "face",
      kind: "Detail",
      x: 0.72,
      y: 0.25,
      text: "Dark, alert eyes and a black muzzle anchor the hyena's face, with faint pink streaks marking the fur above it.",
    },
    {
      id: "fur",
      kind: "Texture",
      x: 0.5,
      y: 0.48,
      text: "Black spots are layered over a tan and cream coat in short, repeated strokes — no two spots quite the same size or shape.",
    },
    {
      id: "carcass",
      kind: "Composition",
      x: 0.2,
      y: 0.15,
      text: "Behind the hyena, the ribbed underside of a carcass fills the upper left, its pale pink tones echoing the red at lower right and framing the animal between them.",
    },
    {
      id: "blood-red",
      kind: "Colour",
      x: 0.85,
      y: 0.72,
      text: "A streak of bright red runs down a pale bone at the lower right — the only saturated red in an otherwise earth-toned painting.",
    },
  ],
  "horseman-under-the-red-moon": [
    {
      id: "moon",
      kind: "Detail",
      x: 0.48,
      y: 0.26,
      text: "Inside the orange disc of the moon, two faces lean together in a kiss, sketched in fine dark lines against the warm wash of colour.",
    },
    {
      id: "wolves",
      kind: "Form",
      x: 0.2,
      y: 0.4,
      text: "Two pale, almost transparent wolf-head silhouettes rise faintly in the upper left, visible only as a slightly darker tint against the sky.",
    },
    {
      id: "rider",
      kind: "Composition",
      x: 0.55,
      y: 0.58,
      text: "A single fine-branched tree splits the canvas near its centre, a mounted, spear-carrying rider silhouetted to its right and open water to its left.",
    },
    {
      id: "reflection",
      kind: "Texture",
      x: 0.42,
      y: 0.83,
      text: "Below the island, rippled dark strokes break the pale blue water into a loose, mirrored reflection of the tree above.",
    },
  ],
  "night-and-day": [
    {
      id: "seam",
      kind: "Composition",
      x: 0.5,
      y: 0.6,
      text: "A single trunk sits exactly on the line where the cool night half meets the warm day half, holding the two skies together as one canvas.",
    },
    {
      id: "moon",
      kind: "Detail",
      x: 0.15,
      y: 0.13,
      text: "A thin white crescent moon, its points sharp, hangs alone in the star-flecked upper left corner.",
    },
    {
      id: "canopy",
      kind: "Form",
      x: 0.62,
      y: 0.32,
      text: "The branches on the night side are left bare, while the same canopy on the day side is filled with dense, leafy growth — as though the tree is caught between two seasons.",
    },
    {
      id: "sunset",
      kind: "Colour",
      x: 0.8,
      y: 0.22,
      text: "The right half of the sky moves through orange, red and deep black in a smooth gradient, broken only by a small pale sun near the top.",
    },
  ],
};

export const getAnnotations = (slug: string) => annotationsBySlug[slug] ?? [];
