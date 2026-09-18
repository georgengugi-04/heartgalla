import { artists, artworks, stories } from "./data";

export type GeoLevel = "kenya" | "east-africa" | "africa" | "world";

export type GeoLocation = {
  id: string;
  name: string;
  level: GeoLevel;
  /** position on the radial map, as a fraction of radius (0 = center) and angle in degrees */
  radius: number;
  angle: number;
  /** ids of artists based here, used to derive real counts — never hardcoded */
  artistIds: string[];
};

/**
 * Only locations actually represented in the project's real data go here.
 * Every current artist is Nairobi-based, so Nairobi is the only populated
 * point. The three wider rings (East Africa / Africa / World) render as
 * inactive tiers in the UI — present so the piece reads as "local becoming
 * global," but with nothing fabricated on them. Add a location here, with
 * real artistIds, to light up a new ring point later.
 */
export const locations: GeoLocation[] = [
  { id: "nairobi", name: "Nairobi, Kenya", level: "kenya", radius: 0, angle: 0, artistIds: ["lenny", "john", "alvin"] },
];

export function countsForLocation(loc: GeoLocation) {
  const localArtists = artists.filter((a) => loc.artistIds.includes(a.id));
  const localArtworks = artworks.filter((a) => loc.artistIds.includes(a.artistId));
  const localStories = stories.filter((s) => s.artists.some((id) => loc.artistIds.includes(id)) || s.artists.length === 0);
  return {
    artists: localArtists.length,
    works: localArtworks.length,
    stories: localStories.length,
  };
}

export function archiveForLocation(loc: GeoLocation) {
  const byArtist = loc.artistIds.map((id) => artworks.filter((a) => a.artistId === id));
  // interleave so the reveal shows a mix of all artists rather than one after another
  const interleaved: typeof artworks = [];
  const maxLen = Math.max(0, ...byArtist.map((arr) => arr.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of byArtist) {
      if (arr[i]) interleaved.push(arr[i]);
    }
  }
  return interleaved.map((art) => {
    const artist = artists.find((a) => a.id === art.artistId)!;
    return {
      id: art.id,
      slug: art.slug,
      image: art.image,
      title: art.title,
      artist: artist.name,
      location: artist.location,
      story: art.description ?? null,
    };
  });
}

export const RING_LABELS: { level: GeoLevel; label: string }[] = [
  { level: "kenya", label: "KENYA" },
  { level: "east-africa", label: "EAST AFRICA" },
  { level: "africa", label: "AFRICA" },
  { level: "world", label: "WORLD" },
];
