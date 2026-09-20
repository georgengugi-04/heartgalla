import type { MetadataRoute } from "next";
import { artworks, artists, stories } from "@/lib/data";

const BASE = "https://eartgalla.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/gallery", "/artists", "/gazette", "/stories", "/wear", "/art-lab", "/art-lab/art-alchemy", "/art-lab/living-canvas", "/art-lab/curate-your-wall", "/about", "/for-partners", "/contact",
  ].map((path) => ({ url: `${BASE}${path}`, lastModified: new Date() }));

  const artworkRoutes = artworks.map((a) => ({ url: `${BASE}/gallery/${a.slug}`, lastModified: new Date() }));
  const artistRoutes = artists.map((a) => ({ url: `${BASE}/artists/${a.slug}`, lastModified: new Date() }));
  const storyRoutes = stories.map((s) => ({ url: `${BASE}/gazette/${s.slug}`, lastModified: new Date() }));

  return [...staticRoutes, ...artworkRoutes, ...artistRoutes, ...storyRoutes];
}
