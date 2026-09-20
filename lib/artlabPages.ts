/**
 * The Art Lab experiments that open on a page of their own. On /art-lab each shows as a teaser (label, title, one
 * line, an "OPEN …" button); the button takes the visitor to /art-lab/<slug>, where the experiment itself lives.
 * The teaser and the page read the same entry, so the words can't drift apart.
 *
 * To make another experiment work this way: add an entry here, create app/art-lab/<slug>/page.tsx (copy one of the
 * three that exist), and swap the experiment on /art-lab for <ExperimentTeaser slug="…" />.
 */
export type GatewaySlug = "art-alchemy" | "living-canvas" | "curate-your-wall";

export const GATEWAYS: Record<
  GatewaySlug,
  { no: string; category: string; title: string; blurb: string; cta: string }
> = {
  "art-alchemy": {
    no: "09",
    category: "FLAGSHIP",
    title: "Art Alchemy",
    blurb: "The most demanding experiment in the Lab. Open it when you're ready to give it your full attention.",
    cta: "Open Art Alchemy",
  },
  "living-canvas": {
    no: "06",
    category: "INTERACTIVE",
    title: "The Living Canvas",
    blurb: "What happens when an artwork stops being still?",
    cta: "Open The Living Canvas",
  },
  "curate-your-wall": {
    no: "08",
    category: "SPATIAL",
    title: "Curate Your Wall",
    blurb: "See a few pieces together before you commit to any of them.",
    cta: "Open Curate Your Wall",
  },
};

export const gatewayHref = (slug: GatewaySlug) => `/art-lab/${slug}`;
export const gatewayAnchor = (slug: GatewaySlug) => `experiment-${GATEWAYS[slug].no}`;
