import type { Metadata } from "next";
import Link from "next/link";
import { packages, suggestedRoutes, TIER_COPY } from "@/lib/journeys/routes";

export const metadata: Metadata = { title: "Explore our packages | EARTGALLA Journeys", description: "Budget, comfort and premium ways to travel Kenya." };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono text-gold">Explore our packages</p>
      <h1 className="font-editorial mt-4 text-5xl md:text-6xl">Three ways to travel Kenya.</h1>
      <p className="mt-5 max-w-2xl text-ivory/70">Priced packages appear here once operators and accommodation partners confirm them. Until then, every journey is built and quoted for you.</p>
      <section className="mt-12 border border-gold/40 p-6" aria-labelledby="featured">
        <p className="label-mono text-gold">Draft itinerary</p>
        <h2 id="featured" className="font-editorial mt-2 text-3xl">{suggestedRoutes[0].name}</h2>
        <p className="mt-2 max-w-prose text-ivory/70">{suggestedRoutes[0].blurb} Price and accommodation to be quoted.</p>
        <Link href={`/journeys/routes/${suggestedRoutes[0].slug}`} className="label-mono mt-4 inline-flex min-h-11 items-center rounded-full border border-ivory/30 px-6 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">View day by day</Link>
      </section>
      <ul className="mt-12 grid gap-px bg-ivory/10 md:grid-cols-3">
        {packages.map((p) => (
          <li key={p.slug} className="flex flex-col bg-charcoal p-6">
            <h2 className="font-editorial text-3xl">{TIER_COPY[p.tier].label}</h2>
            <p className="mt-3 flex-1 text-sm text-ivory/70">{TIER_COPY[p.tier].text}</p>
            <dl className="mt-6 space-y-2 text-sm"><div><dt className="label-mono text-ivory/50">Stays</dt><dd>{p.accommodationCategory}</dd></div><div><dt className="label-mono text-ivory/50">Price</dt><dd>{p.price ? `${p.price.currency} ${p.price.amount}` : "Quotation on request"}</dd></div></dl>
            <Link href="/journeys/build-your-journey" className="label-mono mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-6 text-charcoal hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Request a quotation</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
