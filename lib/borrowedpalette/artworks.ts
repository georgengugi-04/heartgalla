import { artists, worksByArtist } from "@/lib/data";
import { UNVERIFIED_TITLES } from "@/lib/catalogueChecks";

export type StudioWork = { slug: string; title: string; image: string };
export type StudioArtist = {
  id: string;
  name: string;
  slug: string;
  /** a short description taken from the artist's real profile text — nothing added */
  about: string;
  /** "pending" = the site still lists this artist's attribution as to be confirmed */
  status: "confirmed" | "pending";
  works: StudioWork[];
  defaultSlug: string;
};

// Which work each artist's palette starts from. All three are real works already on the site.
const DEFAULT_SLUG: Record<string, string> = { lenny: "happiness", alvin: "bloom-beneath-the-surface", john: "seven-of-diamonds" };

/** First couple of sentences, never more than ~230 characters. */
export function shortAbout(text: string | null, fallback: string): string {
  if (!text) return fallback;
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g)?.map((s) => s.trim()) ?? [text];
  let out = "";
  for (const s of sentences) { if ((out + " " + s).trim().length > 230 && out) break; out = (out + " " + s).trim(); if (out.length > 120) break; }
  return out.length > 240 ? out.slice(0, 237).trimEnd() + "…" : out;
}

/** The artists and the works whose titles are known to match their images (see docs/CONTENT-ISSUES.md). */
export function studioArtists(): StudioArtist[] {
  return artists.map((a) => {
    const works = worksByArtist(a.id).filter((w) => !UNVERIFIED_TITLES.has(w.slug)).map((w) => ({ slug: w.slug, title: w.title, image: w.image }));
    const wanted = DEFAULT_SLUG[a.id];
    const def = works.find((w) => w.slug === wanted) ?? works[0];
    const ordered = def ? [def, ...works.filter((w) => w !== def)] : works;
    return { id: a.id, name: a.name, slug: a.slug, about: shortAbout(a.statement ?? a.bio, `${a.name} is part of the EARTGALLA roster.`), status: a.status, works: ordered.slice(0, 8), defaultSlug: def?.slug ?? "" };
  });
}
