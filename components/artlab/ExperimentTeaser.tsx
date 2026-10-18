import Link from "next/link";
import { GATEWAYS, gatewayHref, type GatewaySlug } from "@/lib/artlabPages";

/** The Art Lab's doorway to an experiment that lives on its own page. */
export default function ExperimentTeaser({ slug }: { slug: GatewaySlug }) {
  const g = GATEWAYS[slug];
  return (
    <section className="border-t border-ivory/10 px-6 py-24 text-center md:px-10 md:py-32">
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 label-mono text-ivory/50">
        <span className="text-electric">EXPERIMENT {g.no}</span>
        <span>·</span>
        <span>{g.category}</span>
        <span>·</span>
        <span>EARTGALLA ART LAB</span>
      </div>
      <h2 className="mb-5 font-editorial text-4xl leading-[0.95] md:text-6xl">{g.title.toUpperCase()}</h2>
      <p className="mx-auto mb-10 max-w-md font-editorial text-xl italic text-ivory/70 md:text-2xl">{g.blurb}</p>
      <Link
        href={gatewayHref(slug)}
        data-cursor="view"
        className="label-mono inline-flex min-h-12 items-center rounded-full border border-gold px-8 py-3.5 text-gold transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        {g.cta.toUpperCase()} →
      </Link>
    </section>
  );
}
