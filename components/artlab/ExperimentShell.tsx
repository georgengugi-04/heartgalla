import Link from "next/link";
import { GATEWAYS, gatewayAnchor, type GatewaySlug } from "@/lib/artlabPages";

/** The frame around an experiment that has its own page: a way back to its teaser at the top and the bottom. */
export default function ExperimentShell({ slug, children }: { slug: GatewaySlug; children: React.ReactNode }) {
  const back = `/art-lab#${gatewayAnchor(slug)}`;
  const label = `Back to the Art Lab, at ${GATEWAYS[slug].title}`;
  return (
    <div className="pb-24 pt-28 md:pt-32">
      <div className="px-6 md:px-10">
        <Link
          href={back}
          aria-label={label}
          className="label-mono -ml-2 inline-flex min-h-11 items-center px-2 text-ivory/50 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          ← ART LAB
        </Link>
      </div>
      {children}
      <div className="mt-16 px-6 text-center md:px-10">
        <Link
          href={back}
          aria-label={label}
          className="label-mono inline-flex min-h-12 items-center rounded-full border border-ivory/40 px-8 py-3.5 transition-colors hover:border-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          ← BACK TO THE ART LAB
        </Link>
      </div>
    </div>
  );
}
