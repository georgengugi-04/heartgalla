import type { Metadata } from "next";
import Link from "next/link";
import Finder from "@/components/journeys/Finder";
import { destinations } from "@/lib/journeys/destinations";
import { TIER_COPY } from "@/lib/journeys/routes";

export const metadata: Metadata = {
  title: "EARTGALLA Journeys — Discover Kenya through culture",
  description: "Discover Kenyan towns, plan a multi-stop journey and request a personalised itinerary with EartGalla Journeys.",
  openGraph: { title: "EARTGALLA Journeys", description: "Discover Kenya. Experience Culture. Create Memories." },
};

const cta = "label-mono inline-flex min-h-12 items-center rounded-full px-8 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

export default function JourneysHome() {
  return (
    <>
      <section className="relative flex min-h-[80svh] items-end bg-gallery-dark px-6 pb-20 pt-40 md:px-10">
        <div className="mx-auto w-full max-w-6xl">
          <p className="label-mono text-gold">EARTGALLA · Journeys</p>
          <h1 className="font-editorial mt-5 max-w-4xl text-5xl leading-[1.05] md:text-7xl">Your next great story begins in Kenya.</h1>
          <p className="mt-6 max-w-2xl text-lg text-ivory/75">Discover remarkable places, experience living cultures and create a journey that stays with you.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/journeys/planner" className={`${cta} bg-gold text-charcoal hover:bg-ivory`}>Plan Your Journey</Link>
            <Link href="/journeys/destinations" className={`${cta} border border-ivory/30 hover:border-gold`}>Explore Destinations</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10" aria-labelledby="discover">
        <p className="label-mono text-gold">Discover Kenya</p>
        <h2 id="discover" className="font-editorial mt-4 max-w-3xl text-4xl md:text-5xl">Kenya is more than a destination. It’s a collection of stories waiting to be discovered.</h2>
        <p className="mt-5 max-w-2xl text-ivory/70">From the vibrant streets of Nairobi to the Swahili heritage of the coast, discover the places, people and experiences that make Kenya unforgettable.</p>
        <ul className="mt-12 grid gap-px bg-ivory/10 sm:grid-cols-2 lg:grid-cols-5">
          {destinations.map((d) => (
            <li key={d.slug} className="bg-charcoal">
              <Link href={`/journeys/destinations/${d.slug}`} className="block min-h-28 p-5 transition-colors hover:bg-ivory/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
                <span className="font-editorial text-2xl">{d.name}</span>
                <span className="label-mono mt-2 block text-ivory/50">{d.county}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gallery-dark px-6 py-24 md:px-10" aria-labelledby="notsure">
        <div className="mx-auto max-w-6xl">
          <p className="label-mono text-gold">Not sure where to go?</p>
          <h2 id="notsure" className="font-editorial mt-4 text-4xl">Start with what you love.</h2>
          <div className="mt-10"><Finder /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10" aria-labelledby="packages">
        <p className="label-mono text-gold">Explore our packages</p>
        <h2 id="packages" className="font-editorial mt-4 text-4xl">Three ways to travel.</h2>
        <ul className="mt-10 grid gap-px bg-ivory/10 md:grid-cols-3">
          {Object.values(TIER_COPY).map((t) => (
            <li key={t.label} className="bg-charcoal p-6"><h3 className="font-editorial text-2xl">{t.label}</h3><p className="mt-3 text-sm text-ivory/70">{t.text}</p></li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/journeys/packages" className={`${cta} border border-ivory/30 hover:border-gold`}>See packages</Link>
          <Link href="/journeys/build-your-journey" className={`${cta} bg-gold text-charcoal hover:bg-ivory`}>Build your own Kenya journey</Link>
        </div>
      </section>
    </>
  );
}
