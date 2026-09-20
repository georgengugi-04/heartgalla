/**
 * EARTGALLA STORIES — short vertical stories (video or image). Not to be confused with the Gazette articles,
 * which are `stories` in lib/data.ts.
 *
 * TO ADD A STORY OR A VIDEO: see docs/STORIES.md. In short — put the files in public/stories/, then add an
 * entry to STORIES below. Titles, artists, media and years are read from lib/data.ts through the `work` /
 * `image` slug, so nothing about an artwork is typed twice and nothing can drift out of date.
 *
 * Server-side only (reads image headers). Pass getVideoStories() to client components as props.
 */
import { artworks, artists } from "./data";
import { getImageSize } from "./image-size";

// ── what an author writes ─────────────────────────────────────────────────────────────────────────────
type VideoDef = {
  /** base file name in public/stories/ — expects NAME.webm, NAME.mp4 and NAME-poster.jpg */
  video: string;
  /** the artwork this clip is about (slug in lib/data.ts) — gives it a caption and a "View artwork" link */
  work?: string;
  /** what a person who can't see the clip would want to know (required) */
  alt: string;
  /** extra words under the title (optional) */
  caption?: string;
  /** true only if the clip has a soundtrack or voice — shows the sound button */
  hasAudio?: boolean;
  /** optional WebVTT captions/subtitles file, e.g. "/stories/name.en.vtt" */
  captions?: string;
};
type ImageDef = { image: string; caption?: string; durationMs?: number };
type StoryDef = { slug: string; title: string; kicker: string; items: (VideoDef | ImageDef)[] };

export const STORIES: StoryDef[] = [
  {
    slug: "lenny-kariuki",
    title: "Lenny Kariuki",
    kicker: "Artwork in motion",
    items: [
      { video: "lenny-denim-tide", work: "denim-tide", alt: "A slow push-in on Denim Tide, a wave painted on a jeans pocket." },
      { video: "lenny-lovers-moon", work: "lovers-moon", alt: "A slow push-in on Lovers’ Moon, a painting of a moon over a tree, water and a horse rider." },
      { video: "lenny-between-hours", work: "between-hours", alt: "A slow push-in on Between Hours, a painting of one tree under a night sky and a sunset." },
      { image: "the-scavenger" },
      { image: "still-becoming" },
      { image: "guardians-of-the-plain" },
    ],
  },
  {
    slug: "alvin-mwangi",
    title: "Alvin Mwangi",
    kicker: "Artwork in motion",
    items: [
      { video: "alvin-bloom-beneath-the-surface", work: "bloom-beneath-the-surface", alt: "A slow push-in on Bloom Beneath the Surface, a painted face covered in red petals." },
      { video: "alvin-study-in-graphite", work: "study-in-graphite", alt: "A slow push-in on Study in Graphite, a pencil portrait of a woman in a hat." },
      { image: "unbound" },
      { image: "golden-gaze" },
    ],
  },
];

// ── what the pages receive ────────────────────────────────────────────────────────────────────────────
export type StoryWork = {
  slug: string;
  href: string;
  title: string;
  artist: string;
  medium: string | null;
  year: number | null;
};
export type StoryVideoItem = {
  id: string;
  type: "video";
  sources: { src: string; type: string }[];
  poster: string;
  captions: string | null;
  hasAudio: boolean;
  alt: string;
  caption: string | null;
  work: StoryWork | null;
};
export type StoryImageItem = {
  id: string;
  type: "image";
  src: string;
  width: number;
  height: number;
  durationMs: number;
  alt: string;
  caption: string | null;
  work: StoryWork;
};
export type StoryItem = StoryVideoItem | StoryImageItem;
export type Story = {
  slug: string;
  title: string;
  kicker: string;
  cover: string;
  items: StoryItem[];
  videos: number;
  images: number;
};

const IMAGE_SECONDS = 6;

function workInfo(slug: string): StoryWork | null {
  const a = artworks.find((w) => w.slug === slug);
  const artist = a && artists.find((x) => x.id === a.artistId);
  if (!a || !artist) return null;
  return { slug: a.slug, href: `/gallery/${a.slug}`, title: a.title, artist: artist.name, medium: a.medium, year: a.year };
}

/** Resolves the definitions. An item that points at a work or a file that doesn't exist is dropped, never thrown. */
export function getVideoStories(): Story[] {
  return STORIES.flatMap((def): Story[] => {
    const items: StoryItem[] = [];
    def.items.forEach((it, i) => {
      if ("video" in it) {
        const w = it.work ? workInfo(it.work) : null;
        if (it.work && !w) return; // the artwork was removed: skip this clip
        items.push({
          id: `${def.slug}-${i}`,
          type: "video",
          sources: [
            { src: `/stories/${it.video}.webm`, type: "video/webm" },
            { src: `/stories/${it.video}.mp4`, type: "video/mp4" },
          ],
          poster: `/stories/${it.video}-poster.jpg`,
          captions: it.captions ?? null,
          hasAudio: it.hasAudio ?? false,
          alt: it.alt,
          caption: it.caption ?? null,
          work: w,
        });
      } else {
        const a = artworks.find((x) => x.slug === it.image);
        const w = workInfo(it.image);
        if (!a || !w) return;
        const size = getImageSize(a.image) ?? { width: 4, height: 5 };
        items.push({
          id: `${def.slug}-${i}`,
          type: "image",
          src: a.image,
          width: size.width,
          height: size.height,
          durationMs: it.durationMs ?? IMAGE_SECONDS * 1000,
          alt: `${w.title} by ${w.artist}`,
          caption: it.caption ?? null,
          work: w,
        });
      }
    });
    if (items.length === 0) return [];
    const first = items[0];
    return [
      {
        slug: def.slug,
        title: def.title,
        kicker: def.kicker,
        cover: first.type === "video" ? first.poster : first.src,
        items,
        videos: items.filter((x) => x.type === "video").length,
        images: items.filter((x) => x.type === "image").length,
      },
    ];
  });
}
