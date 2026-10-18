import type { Metadata } from "next";
import ExploreClient from "@/components/atlas/ExploreClient";
import { buildExploreIndex } from "@/lib/atlas";
import type { ExploreType } from "@/lib/atlas/types";

export const metadata: Metadata = {
  title: "Explore the Atlas | EARTGALLA",
  description: "Search Kenyan art, practices, places, artists and stories documented on EARTGALLA, each with its sources and permissions.",
};

const TYPES = ["practice", "community", "place", "artist", "work", "story"];

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; place?: string }> }) {
  const sp = await searchParams;
  const type = (TYPES.includes(sp.type ?? "") ? sp.type : "all") as ExploreType | "all";
  return (
    <div className="px-6 pb-24 pt-32 md:px-10">
      <header className="mb-12 max-w-3xl">
        <h1 className="font-editorial text-4xl leading-tight md:text-6xl">Explore the Atlas</h1>
        <p className="mt-5 max-w-prose text-lg leading-relaxed text-ivory/75">
          Search everything EARTGALLA has documented: practices, places, artists, artworks and stories. Each record names its sources, who is credited, and what permission we hold.
          Where we haven&rsquo;t documented something with the people concerned, it isn&rsquo;t here.
        </p>
      </header>
      <ExploreClient items={buildExploreIndex()} initial={{ q: sp.q ?? "", type, place: sp.place ?? "" }} />
    </div>
  );
}
