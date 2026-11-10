import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AnimalMarquee from "@/components/journeys/AnimalMarquee";
import FrameStrip from "@/components/journeys/FrameStrip";
import PhotoWall from "@/components/journeys/PhotoWall";
import Reveal from "@/components/journeys/Reveal";
import { showcaseFrames } from "@/lib/journeys/showcase";
import Finder from "@/components/journeys/Finder";
import { destinations, bySlug } from "@/lib/journeys/destinations";
import { generatedPhotos } from "@/lib/journeys/photos.generated";
import { TIER_COPY } from "@/lib/journeys/routes";

export const metadata: Metadata = {
  title: "EARTGALLA Journeys — Discover Kenya through culture",
  description: "Discover Kenyan towns, plan a multi-stop journey and request a personalised itinerary with EartGalla Journeys.",
  openGraph: { title: "EARTGALLA Journeys", description: "Discover Kenya. Experience Culture. Create Memories." },
};

const cta = "label-mono inline-flex min-h-12 items-center rounded-full px-8 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

// Only photos with a confirmed free licence are used on this page.
const showcase = (bySlug("nakuru")?.attractions.flatMap((a) => a.photos ?? []) ?? []).filter((p) => p.licence !== "unconfirmed");
const heroPhoto = showcase.find((p) => p.src.includes("flamingos-flight")) ?? showcase[0];

// Wildlife marquee: Nakuru and Nairobi National Park photos plus the owner-supplied wildlife photos, mixed so neighbours differ.
const nairobiPark = bySlug("nairobi")?.attractions.find((a) => a.name === "Nairobi National Park")?.photos ?? [];
const wildlife = generatedPhotos.wildlife ?? [];
const lanes = [nairobiPark, wildlife, showcase.filter((p) => p !== heroPhoto)];
const animals = Array.from({ length: Math.max(...lanes.map((l) => l.length)) }, (_, i) => lanes.map((l) => l[i])).flat().filter((p) => p !== undefined);
const zebraBackdrop = wildlife.find((p) => p.src.includes("zebras"));
const culture = generatedPhotos.culture ?? [];
const frames = showcaseFrames(10);

export default function JourneysHome() {
  return (
    <>
      <section data-theme="dark" className="relative isolate flex min-h-[85svh] items-end overflow-hidden bg-gallery-dark px-6 pb-20 pt-40 text-ivory md:px-10">
        {heroPhoto && <Image src={heroPhoto.src} alt={heroPhoto.alt} fill priority sizes="100vw" className="jr-hero-photo -z-20 object-cover" />}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal via-charcoal/65 to-charcoal/25" />
        {heroPhoto && <p className="label-mono absolute bottom-4 right-6 text-[0.65rem] text-ivory/50 md:right-10">{heroPhoto.credit}</p>}
        <div className="mx-auto w-full max-w-6xl">
          <p className="label-mono text-gold">EARTGALLA · Journeys</p>
          <h1 className="font-editorial mt-5 max-w-5xl text-6xl leading-[0.98] md:text-8xl">Your next great story begins <em className="text-gold">in Kenya.</em></h1>
          <p className="mt-6 max-w-2xl text-lg text-ivory/75">Discover remarkable places, experience living cultures and create a journey that stays with you.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/journeys/planner" className={`${cta} bg-gold text-charcoal hover:bg-ivory`}>Plan Your Journey</Link>
            <Link href="/journeys/destinations" className={`${cta} border border-ivory/30 hover:border-gold`}>Explore Destinations</Link>
          </div>
          <dl className="mt-14 flex flex-wrap gap-x-12 gap-y-4 border-t border-ivory/15 pt-6">
            <div><dt className="label-mono text-ivory/50">Destinations</dt><dd className="font-editorial text-3xl">{destinations.length}</dd></div>
            <div><dt className="label-mono text-ivory/50">Ways to travel</dt><dd className="font-editorial text-3xl">{Object.keys(TIER_COPY).length}</dd></div>
            <div><dt className="label-mono text-ivory/50">Trip planner</dt><dd className="font-editorial text-3xl">Share by link</dd></div>
          </dl>
        </div>
      </section>

      {frames.length > 0 && (
        <section className="pt-20" aria-labelledby="frames">
          <Reveal className="mx-auto max-w-6xl px-6 pb-10 md:px-10">
            <p className="label-mono text-gold">01 — Kenya in frames</p>
            <h2 id="frames" className="font-editorial mt-3 max-w-3xl text-4xl leading-tight md:text-6xl">Swipe through the places you could be.</h2>
          </Reveal>
          <FrameStrip frames={frames} label="Photos of Kenyan destinations. Scroll sideways to see more." />
        </section>
      )}

      <section className="pt-16" aria-labelledby="wild">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <p className="label-mono text-gold">02 — Along the way</p>
          <h2 id="wild" className="font-editorial mt-3 text-4xl md:text-5xl">Who you might meet on the road.</h2>
        </div>
        <div className="mt-8"><AnimalMarquee photos={animals} label="Wildlife photos, scrolling slowly. Hover or focus to pause." /></div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10" aria-labelledby="discover">
        <p className="label-mono text-gold">03 — Discover Kenya</p>
        <h2 id="discover" className="font-editorial mt-4 max-w-3xl text-4xl md:text-5xl">Kenya is more than a destination. It’s a collection of stories waiting to be discovered.</h2>
        <p className="mt-5 max-w-2xl text-ivory/70">From the vibrant streets of Nairobi to the Swahili heritage of the coast, discover the places, people and experiences that make Kenya unforgettable.</p>
        <ul className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {destinations.map((d) => (
            <li key={d.slug}>
              <Link data-theme={d.hero ? "dark" : undefined} href={`/journeys/destinations/${d.slug}`} className="group relative block aspect-[4/5] overflow-hidden border border-ivory/10 bg-gallery-dark text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
                {d.hero && <Image src={d.hero.src} alt="" fill sizes="(min-width: 1024px) 220px, (min-width: 768px) 30vw, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4">
                  <span className="font-editorial block text-2xl">{d.name}</span>
                  <span className="label-mono mt-1 block text-ivory/60 group-hover:text-gold">{d.county}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {culture.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10" aria-labelledby="people">
          <Reveal>
            <p className="label-mono text-gold">04 — People and places</p>
            <h2 id="people" className="font-editorial mt-3 text-4xl md:text-6xl">Kenya is more than scenery.</h2>
            <p className="mt-4 max-w-xl text-ivory/70">Tap any photo to see it larger.</p>
          </Reveal>
          <div className="mt-10"><PhotoWall photos={culture} label="People and places of Kenya" /></div>
        </section>
      )}

      <section data-theme="dark" className="relative isolate overflow-hidden bg-gallery-dark px-6 py-24 text-ivory md:px-10" aria-labelledby="notsure">
        {zebraBackdrop && <Image src={zebraBackdrop.src} alt="" fill sizes="100vw" className="-z-20 object-cover" />}
        <div aria-hidden className="absolute inset-0 -z-10 bg-charcoal/80" />
        {zebraBackdrop && <p className="label-mono absolute bottom-3 right-6 text-[0.6rem] text-ivory/40 md:right-10">{zebraBackdrop.credit}</p>}
        <div className="mx-auto max-w-6xl">
          <p className="label-mono text-gold">Not sure where to go?</p>
          <h2 id="notsure" className="font-editorial mt-4 text-4xl">Start with what you love.</h2>
          <div className="mt-10"><Finder /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10" aria-labelledby="artist-tours">
        <Reveal>
          <Link href="/artists/john-njoroge" className="group relative grid overflow-hidden border border-ivory/15 md:grid-cols-[1fr_1.2fr] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
            <span className="relative block aspect-[4/3] bg-gallery-dark md:aspect-auto md:min-h-80">
              <Image src="/art/john-cards/card-king-queen-royals.jpg" alt="A hand-painted playing card by John Njoroge" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-contain p-6 transition-transform duration-700 group-hover:scale-[1.03]" />
            </span>
            <span className="flex flex-col justify-center p-8 md:p-12">
              <span className="label-mono text-gold">05 — Travel with an artist</span>
              <span id="artist-tours" className="font-editorial mt-4 block text-3xl leading-tight md:text-5xl">John Njoroge now offers tours.</span>
              <span className="mt-4 block max-w-md text-ivory/70">One of EARTGALLA’s artists is now taking visitors out. Read his profile, then tell us where you’d like to go.</span>
              <span className="label-mono mt-6 inline-block border-b border-gold pb-1 text-gold">Meet John →</span>
            </span>
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 md:px-10" aria-labelledby="packages">
        <p className="label-mono text-gold">06 — Explore our packages</p>
        <h2 id="packages" className="font-editorial mt-4 text-4xl md:text-6xl">Three ways to travel.</h2>
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
