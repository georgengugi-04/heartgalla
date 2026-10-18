import type { MetadataRoute } from "next";
import { artworks, artists, stories } from "@/lib/data";
import { practices, communities } from "@/lib/atlas/data";

const BASE = "https://eartgalla.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "", "/explore", "/gallery", "/artists", "/gazette", "/stories", "/wear", "/art-lab", "/art-lab/art-alchemy", "/art-lab/living-canvas", "/art-lab/curate-your-wall", "/art-lab/borrowed-palette", "/about", "/for-partners", "/contact",
  ].map((path) => ({ url: `${BASE}${path}`, lastModified: new Date() }));

  const artworkRoutes = artworks.map((a) => ({ url: `${BASE}/gallery/${a.slug}`, lastModified: new Date() }));
  const artistRoutes = artists.map((a) => ({ url: `${BASE}/artists/${a.slug}`, lastModified: new Date() }));
  const storyRoutes = stories.map((s) => ({ url: `${BASE}/gazette/${s.slug}`, lastModified: new Date() }));

  const atlasRoutes = [
    ...practices.filter((p) => p.status !== "draft" && p.status !== "withdrawn").map((p) => ({ url: `${BASE}/explore/practices/${p.slug}`, lastModified: new Date() })),
    ...communities.filter((c) => c.status === "published").map((c) => ({ url: `${BASE}/explore/communities/${c.slug}`, lastModified: new Date() })),
  ];

  return [...staticRoutes, ...atlasRoutes, ...artworkRoutes, ...artistRoutes, ...storyRoutes];
}
