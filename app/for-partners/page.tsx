import Link from "next/link";

export const metadata = { title: "For Partners | EARTGALLA" };

const PILLARS = [
  { title: "Emerging Artist Discovery", desc: "A structured way to find and present Kenyan creative talent before they're widely known." },
  { title: "Digital Art Commerce", desc: "A collector journey from discovery to ownership, built for a platform that doesn't yet have legacy gallery overhead." },
  { title: "Cultural Storytelling", desc: "The Gazette — editorial content that makes the art legible, not just visible." },
  { title: "Fashion Collaboration", desc: "Canvas-to-clothing as a second medium for the same body of work (architecture in place, see Art Lab)." },
  { title: "Creative Technology", desc: "Interaction and presentation systems built to scale past a single storefront." },
];

export default function ForPartnersPage() {
  return (
    <div className="pt-32 px-6 md:px-10 pb-24 max-w-3xl">
      <p className="label-mono text-ivory/50 mb-3">FOR PARTNERS</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-8">The Opportunity</h1>
      <p className="text-ivory/80 leading-relaxed mb-14">
        EARTGALLA is building infrastructure for the discovery, presentation, and
        commercialisation of Kenyan creativity. We&apos;re early — three artists, a founding
        collection, and a platform designed to scale as real inventory and real traction
        come in. What follows is what we&apos;re actually building, not a projection.
      </p>
      <div className="flex flex-col divide-y divide-ivory/10 border-t border-b border-ivory/10">
        {PILLARS.map((p) => (
          <div key={p.title} className="py-6">
            <h2 className="font-editorial text-xl mb-2">{p.title}</h2>
            <p className="text-ivory/60">{p.desc}</p>
          </div>
        ))}
      </div>
      <p className="text-ivory/50 italic mt-14">
        Traction figures, partnership details, and roadmap specifics available on request —
        we don&apos;t publish numbers here that we can&apos;t stand behind.
      </p>
      <Link href="/contact" className="label-mono border border-ivory/30 rounded-full px-6 py-3 inline-block mt-8">
        Get in Touch
      </Link>
    </div>
  );
}
