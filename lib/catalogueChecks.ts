/**
 * Works whose TITLE doesn't match what is in the image (see docs/CONTENT-ISSUES.md). Until the catalogue is
 * corrected they are kept out of the automatically chosen, title-showing surfaces (homepage featured row, marquee,
 * Wear…) — they still appear in the full gallery. When a work's title/file has been fixed, delete its slug here.
 */
export const UNVERIFIED_TITLES = new Set<string>([
  // Lenny Kariuki
  "mountain-solitude", // shows a painted portrait of a man in a headdress
  "the-spearman", // shows a mountain campsite
  "village-under-the-mountain", // a photograph of a person
  "herd-at-dawn", // a photograph of many paintings laid out
  "cutlery-cross", // shows two elephants
  // Alvin Mwangi
  "two-skies", // a blue-and-yellow abstract face
  "faces-of-africa", // a mountain campsite scene
  "the-orator", // a lion with a cub
  // Held back for a different reason — attribution to confirm:
  "study-in-graphite", // the drawing carries a handwritten signature and date that doesn't read as "Alvin Mwangi"
]);
