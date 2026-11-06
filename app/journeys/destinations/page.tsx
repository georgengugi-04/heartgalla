import type { Metadata } from "next";
import DestinationBrowser from "@/components/journeys/DestinationBrowser";

export const metadata: Metadata = { title: "Discover Kenya — Destinations | EARTGALLA Journeys", description: "Explore Kenyan towns and regions: culture, nature, heritage and coast." };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono text-gold">Discover Kenya</p>
      <h1 className="font-editorial mt-4 max-w-3xl text-5xl md:text-6xl">Kenya is more than a destination.</h1>
      <p className="mt-5 max-w-2xl text-ivory/70">Search by town, attraction or interest. More destinations are added as local partners and verified content come in.</p>
      <div className="mt-12"><DestinationBrowser /></div>
    </div>
  );
}
