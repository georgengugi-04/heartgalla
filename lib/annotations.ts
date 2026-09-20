/**
 * Observation data for Experiment 07 — The Art Dialogue.
 *
 * RULES FOR THIS FILE
 *  - Every entry describes something that can be seen in the image. Nothing here
 *    states what an artist meant, felt or intended, and nothing invents facts
 *    (dates, materials, places, stories).
 *  - Where a material is only *probably* visible, the wording is hedged ("looks to be").
 *  - x / y are fractions (0–1) of the image as displayed — left→right, top→bottom —
 *    so markers stay in place at any size.
 *  - The artist's story is NOT stored here. It comes from the artwork's own
 *    `description` in lib/data.ts and is shown separately in the UI.
 *
 * Keyed by artwork slug so the Dialogue reads the same artwork source as the
 * homepage collection (lib/data.ts) instead of keeping a second copy.
 */

export type AnnotationKind = "Colour" | "Texture" | "Form" | "Composition" | "Detail";

export type Annotation = {
  id: string;
  kind: AnnotationKind;
  x: number;
  y: number;
  text: string;
};

export const annotationsBySlug: Record<string, Annotation[]> = {
  "between-hours": [
    { id: "moon-and-sun", kind: "Detail", x: 0.19, y: 0.17, text: "A thin white crescent moon sits in the upper left of the night half. Its counterpart, a round orange sun with visible brush texture, sits in the upper right." },
    { id: "the-seam", kind: "Composition", x: 0.5, y: 0.24, text: "A hard vertical line divides the canvas in two, and the trunk of the tree rises on that line, so it belongs to both skies at once." },
    { id: "two-trees", kind: "Form", x: 0.27, y: 0.62, text: "The same tree is drawn two ways: on the left, bare branches that fork into fine, open twigs; on the right, dense flat clusters of leaves stacked in layers." },
    { id: "right-sky", kind: "Colour", x: 0.75, y: 0.62, text: "The right sky moves from dark red at the top, through orange, to pale yellow at the horizon. The left moves from near-black blue to light blue, flecked with white for stars." },
  ],
  "denim-tide": [
    { id: "crest", kind: "Form", x: 0.44, y: 0.505, text: "The wave curls over into a hollow, its crest heaped with thick white foam." },
    { id: "blue-face", kind: "Colour", x: 0.27, y: 0.635, text: "Turquoise and cerulean blues are the only saturated colour in the frame. Everything around them is faded indigo." },
    { id: "hollow", kind: "Texture", x: 0.475, y: 0.58, text: "The dark hollow inside the curl looks to be bare denim, and even the white foam is brushed thinly enough that the diagonal twill of the fabric shows through." },
    { id: "pocket-edge", kind: "Composition", x: 0.74, y: 0.405, text: "The painting stays inside the outline of the back pocket, held by its stitched edge like a frame." },
  ],
  "the-scavenger": [
    { id: "elephant-eye", kind: "Detail", x: 0.43, y: 0.17, text: "The elephant's eye is outlined in dark lashes and red, set just behind the hyena's shoulder." },
    { id: "the-look", kind: "Composition", x: 0.77, y: 0.25, text: "The hyena stands in front of the much larger grey mass of the elephant and turns its head to look directly out of the picture." },
    { id: "fur", kind: "Texture", x: 0.5, y: 0.45, text: "Short, directional brush strokes in ochre, cream and black build the hyena's coat, with black spots laid over the top." },
    { id: "red", kind: "Colour", x: 0.86, y: 0.75, text: "Crimson streaks run along the pale form at lower right and down the hyena's chest. It is the strongest red in an otherwise grey, green and ochre palette." },
  ],
  "lovers-moon": [
    { id: "the-moon", kind: "Detail", x: 0.49, y: 0.27, text: "A small drawn couple, locked in a kiss, fills the centre of the moon. The moon itself is a warm copper disc against the pale blue sky." },
    { id: "ghost-wolf", kind: "Composition", x: 0.22, y: 0.4, text: "Pale outlines of a howling wolf and, at upper right, a face are painted so lightly that they almost vanish into the sky. The wolf is the easier to find." },
    { id: "silhouette-tree", kind: "Form", x: 0.5, y: 0.47, text: "The tree is a flat black silhouette: a slim, leaning trunk under a wide crown with feathered, uneven edges." },
    { id: "the-rider", kind: "Detail", x: 0.78, y: 0.63, text: "A rider on a rearing horse, also in solid black, holds a long thin blade or pole out to the right." },
  ],
  "still-becoming": [
    { id: "the-face", kind: "Detail", x: 0.5, y: 0.28, text: "The face is the most resolved part of the canvas: eyes, brows and lips are drawn in dark, precise lines over a warm brown tone." },
    { id: "outline-hair", kind: "Form", x: 0.08, y: 0.36, text: "On the left the hair is only an outline, a loose dark contour with nothing painted inside it yet." },
    { id: "leaf-sketch", kind: "Composition", x: 0.85, y: 0.2, text: "Faint grey lines describe large leaves behind the figure. They are drawn in but not yet filled with colour." },
    { id: "canvas-weave", kind: "Texture", x: 0.75, y: 0.36, text: "The weave of the canvas shows clearly through the pale, unpainted hair and background." },
  ],
  "kitchen-brigade": [
    { id: "leaning-chefs", kind: "Composition", x: 0.65, y: 0.29, text: "On the upper shoe, two figures in white chef's jackets lean out of the shoe's own side stripe, so the design of the shoe becomes part of the scene." },
    { id: "the-spoon", kind: "Detail", x: 0.3, y: 0.6, text: "A long wooden spoon passes between the two rats on the lower shoe." },
    { id: "blue-rat", kind: "Colour", x: 0.22, y: 0.69, text: "The blue rat is the only cool colour on either shoe, a strong accent against otherwise white surfaces." },
    { id: "leather", kind: "Texture", x: 0.72, y: 0.67, text: "Around the paint, the shoes keep their stitched seams and punched holes, so the artwork shares its surface with the shoe." },
  ],
  "slice-of-trouble": [
    { id: "the-scowl", kind: "Form", x: 0.42, y: 0.42, text: "Heavy black brows slant down over yellow-green eyes, giving the cat a fixed, scowling stare." },
    { id: "the-mouse", kind: "Detail", x: 0.68, y: 0.55, text: "The mouse has its eyes shut and sits curled beside the cheese. Scooped bites are missing from the wedge." },
    { id: "claws", kind: "Detail", x: 0.2, y: 0.72, text: "Pale grey paws with dark claws hook over the top edge of the sole." },
    { id: "cheese", kind: "Composition", x: 0.8, y: 0.7, text: "The yellow cheese follows the curve of the shoe's own side panel, and stitching still runs along its upper edge." },
  ],
};

export function getAnnotations(slug: string): Annotation[] {
  return annotationsBySlug[slug] ?? [];
}
