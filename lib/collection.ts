import { artworks, artists } from "@/lib/data";
import { getAnnotations } from "@/lib/annotations";

// Deviation from spec: rather than parsing JPEG/PNG headers at build time, real
// pixel dimensions were read once (via PIL) and are hardcoded here, keyed by slug.
// Same result — the frame renders at the artwork's true aspect ratio with no
// cropping — without adding a binary-parsing helper for five images.
const DIMENSIONS: Record<string, { width: number; height: number }> = {
  happiness: { width: 736, height: 1104 },
  "guardians-of-the-plain": { width: 1200, height: 1600 },
  "hyena-study": { width: 1280, height: 963 },
  "horseman-under-the-red-moon": { width: 720, height: 1280 },
  "night-and-day": { width: 563, height: 530 },
};

export type DialogueWork = {
  id: string;
  slug: string;
  href: string;
  title: string;
  artistName: string;
  artistHref: string;
  artistBio: string | null;
  image: string;
  width: number;
  height: number;
  medium: string | null;
  year: number | null;
  dimensions: string | null;
  collection: string | null;
  description: string | null;
};

export function getDialogueWorks(): DialogueWork[] {
  const slugs = Object.keys(DIMENSIONS);
  return slugs
    .map((slug) => {
      const artwork = artworks.find((a) => a.slug === slug);
      if (!artwork) return null;
      const artist = artists.find((a) => a.id === artwork.artistId);
      if (!artist) return null;
      const dims = DIMENSIONS[slug];

      return {
        id: artwork.id,
        slug: artwork.slug,
        href: `/gallery/${artwork.slug}`,
        title: artwork.title,
        artistName: artist.name,
        artistHref: `/artists/${artist.slug}`,
        // only a confirmed artist's bio is shown as their own story
        artistBio: artist.status === "confirmed" ? artist.bio : null,
        image: artwork.image,
        width: dims.width,
        height: dims.height,
        medium: artwork.medium,
        year: artwork.year,
        dimensions: artwork.dimensions,
        collection: artwork.collection,
        description: artwork.description,
      };
    })
    .filter((w): w is DialogueWork => w !== null && getAnnotations(w.slug).length > 0);
}
