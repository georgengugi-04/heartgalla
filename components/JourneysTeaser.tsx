import Image from "next/image";
import Link from "next/link";
import { showcaseFrames } from "@/lib/journeys/showcase";

/** Home-page doorway into EartGalla Journeys. Uses only photos whose licence is known; falls back to type alone. */
export default function JourneysTeaser() {
  const frames = showcaseFrames(3);
  return (
    <section className="px-6 py-24 md:px-10 md:py-40" aria-labelledby="journeys-teaser">
      <p className="label-mono mb-10 text-ivory/50">04 — JOURNEYS</p>
      <div className="grid items-end gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div>
          <h2 id="journeys-teaser" className="font-editorial text-4xl leading-tight md:text-6xl">Travel Kenya through its culture.</h2>
          <p className="mt-6 max-w-md text-lg text-ivory/70">Pick your towns, set your nights and share the plan. EARTGALLA Journeys builds the trip around the people and places behind the art.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/journeys" data-cursor="view" className="label-mono inline-flex min-h-12 items-center rounded-full bg-gold px-7 text-charcoal transition-colors hover:bg-ivory">Explore Journeys</Link>
            <Link href="/journeys/planner" className="label-mono inline-flex min-h-12 items-center rounded-full border border-ivory/30 px-7 transition-colors hover:border-gold">Plan a trip</Link>
          </div>
        </div>
        {frames.length > 0 && (
          <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 md:gap-3" aria-label="Photos from Kenyan destinations">
            {frames.map((f, i) => (
              <li key={f.src} className={`relative aspect-[3/4] overflow-hidden ${i === 1 ? "mt-8" : ""}`}>
                <Image src={f.src} alt={f.alt} fill sizes="(min-width: 768px) 18vw, 30vw" className="object-cover" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
