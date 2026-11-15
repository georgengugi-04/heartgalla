import Image from "next/image";
import Link from "next/link";
import { studioArtists } from "@/lib/borrowedpalette/artworks";
import { gatewayHref, GATEWAYS, type GatewaySlug } from "@/lib/artlabPages";

const OTHERS: GatewaySlug[] = ["art-alchemy", "living-canvas", "curate-your-wall"];

/** Home-page doorway into the Art Lab, led by the Borrowed Palette. Uses only works already on the site. */
export default function ArtLabTeaser() {
  const artists = studioArtists().filter((a) => a.works[0]);
  return (
    <section className="px-6 py-24 md:px-10 md:py-36" aria-labelledby="artlab-teaser">
      <p className="label-mono mb-10 text-ivory/50">03 — THE ART LAB</p>
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
        <div>
          <p className="label-mono text-gold">EXPERIMENT {GATEWAYS["borrowed-palette"].no} · {GATEWAYS["borrowed-palette"].category}</p>
          <h2 id="artlab-teaser" className="font-editorial mt-4 text-4xl leading-[1.05] md:text-6xl">Borrow an artist’s colours. Make your own.</h2>
          <p className="mt-6 max-w-md text-lg text-ivory/70">Pick Lenny, Alvin or John, take the palette from one of their real works, and paint with it. Draw, layer, then save or export your picture.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={gatewayHref("borrowed-palette")} data-cursor="view" className="label-mono inline-flex min-h-12 items-center rounded-full bg-gold px-7 text-charcoal transition-colors hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ivory">Open the Borrowed Palette</Link>
            <Link href="/art-lab" data-cursor="view" className="label-mono inline-flex min-h-12 items-center rounded-full border border-ivory/30 px-7 transition-colors hover:border-gold">All experiments</Link>
          </div>
          <p className="label-mono mt-10 text-[0.7rem] text-ivory/45">ALSO IN THE LAB</p>
          <ul className="mt-3 divide-y divide-ivory/10 border-y border-ivory/10">
            {OTHERS.map((slug) => (
              <li key={slug}>
                <Link href={gatewayHref(slug)} className="group flex min-h-14 items-center justify-between gap-4 py-3 transition-colors hover:text-gold">
                  <span><span className="font-editorial text-xl">{GATEWAYS[slug].title}</span><span className="mt-0.5 block text-sm text-ivory/55 group-hover:text-ivory/70">{GATEWAYS[slug].blurb}</span></span>
                  <span aria-hidden className="label-mono text-ivory/40 transition-transform group-hover:translate-x-1 group-hover:text-gold">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link href={gatewayHref("borrowed-palette")} data-cursor="view" aria-label="Open the Borrowed Palette" className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
          <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 md:gap-3" aria-label="Works whose colours you can borrow">
            {artists.map((a, i) => {
              const w = a.works[0];
              return (
                <li key={a.id} className={i === 1 ? "mt-8 md:mt-12" : ""}>
                  <span className="relative block aspect-[3/4] overflow-hidden bg-gallery-dark">
                    <Image src={w.image} alt={`${w.title} by ${a.name}`} fill sizes="(min-width: 1024px) 20vw, 30vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" />
                  </span>
                  <span className="label-mono mt-2 block text-[0.65rem] text-ivory/55">{a.name.toUpperCase()}</span>
                </li>
              );
            })}
          </ul>
          <span className="label-mono mt-6 block text-center text-[0.7rem] text-gold">TAP A WORK TO START →</span>
        </Link>
      </div>
    </section>
  );
}
