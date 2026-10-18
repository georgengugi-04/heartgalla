/**
 * One shared, serialisable view of the artworks used by the homepage collection
 * gallery and by Experiment 10 (The Art Dialogue). Both read lib/data.ts through
 * here, so there is a single source of artwork truth.
 *
 * Server-side only (reads image headers with fs). Pass the result to client
 * components as props.
 */
import { artworks, artists } from "./data";
import { getImageSize } from "./image-size";
import { getAnnotations } from "./annotations";

export type CollectionItem = {
  id: string;
  slug: string;
  href: string;
  title: string;
  artist: string;
  artistHref: string;
  /** Only confirmed artists' bios are exposed; a placeholder profile is never shown as "the story". */
  artistBio: string | null;
  image: string;
  width: number;
  height: number;
  medium: string | null;
  year: number | null;
  dimensions: string | null;
  collection: string | null;
  description: string | null;
  /** true when Experiment 10 has observations for this work */
  hasDialogue: boolean;
};

/**
 * Curated running order for the homepage "The Collection". Slugs that no longer
 * exist in lib/data.ts are skipped, so removing an artwork can never break the page.
 * The order alternates tall / wide / square works so the eye keeps changing pace.
 */
export const COLLECTION_SLUGS = [
  "bloom-beneath-the-surface", // Alvin
  "happiness", //                 Lenny
  "the-royals", //                John
  "between-hours", //             Lenny
  "unbound", //                   Alvin
  "five-of-clubs", //             John
  "denim-tide", //                Lenny
];

// used only if a metadata-less or unreadable image slips through
const FALLBACK_RATIO = { width: 4, height: 5 };

function toItem(slug: string): CollectionItem | null {
  const a = artworks.find((w) => w.slug === slug);
  if (!a) return null;
  const artist = artists.find((x) => x.id === a.artistId);
  if (!artist) return null;
  const size = getImageSize(a.image) ?? FALLBACK_RATIO;
  return {
    id: a.id,
    slug: a.slug,
    href: `/gallery/${a.slug}`,
    title: a.title,
    artist: artist.name,
    artistHref: `/artists/${artist.slug}`,
    artistBio: artist.status === "confirmed" ? artist.bio : null,
    image: a.image,
    width: size.width,
    height: size.height,
    medium: a.medium,
    year: a.year,
    dimensions: a.dimensions,
    collection: a.collection,
    description: a.description,
    hasDialogue: getAnnotations(a.slug).length > 0,
  };
}

/** Any list of slugs → serialisable works (unknown / unreadable slugs are skipped, never thrown). */
export function getWorks(slugs: string[]): CollectionItem[] {
  return slugs.map(toItem).filter((x): x is CollectionItem => x !== null);
}

export function getCollection(): CollectionItem[] {
  return COLLECTION_SLUGS.map(toItem).filter((x): x is CollectionItem => x !== null);
}

/** Works that have observations, in collection order — the Art Dialogue's shelf. */
/** The Art Dialogue's works — 3 Lenny · 2 Alvin · 2 John, interleaved. Each one needs observations in lib/annotations.ts. */
const DIALOGUE_SLUGS = [
  "bloom-beneath-the-surface", // Alvin
  "between-hours", //             Lenny
  "the-royals", //                John
  "denim-tide", //                Lenny
  "golden-gaze", //               Alvin
  "five-of-clubs", //             John
  "lovers-moon", //               Lenny
];

export function getDialogueWorks(): CollectionItem[] {
  return getWorks(DIALOGUE_SLUGS).filter((x) => x.hasDialogue);
}
