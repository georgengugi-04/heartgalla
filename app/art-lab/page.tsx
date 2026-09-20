import PlayCards from "@/components/PlayCards";
import Marquee from "@/components/Marquee";
import ArtAlchemy from "@/components/alchemy/ArtAlchemy";
import ArtWithoutBorders from "@/components/awb/ArtWithoutBorders";
import LivingCanvas from "@/components/livingcanvas/LivingCanvas";
import ArtDialogue from "@/components/artdialogue/ArtDialogue";
import { artworks } from "@/lib/data";
import { getDialogueWorks } from "@/lib/collection";
import { getAnnotations } from "@/lib/annotations";

export const metadata = { title: "Art Lab | EARTGALLA" };

// `no` + `href` only where the experiment is already numbered on the page (04–07); the rest are unchanged.
const EXPERIMENTS: { no?: string; title: string; status: string; desc: string }[] = [
  { no: "04", title: "Art Alchemy", status: "Live", desc: "Turn a painting into a living visual instrument." },
  { no: "05", title: "Art Without Borders", status: "Live", desc: "A radial map from Kenya outward, and the archive it opens into." },
  { no: "06", title: "The Living Canvas", status: "Live", desc: "Deconstruct a painting into colour, texture and form — then watch it recompose." },
  { no: "07", title: "The Art Dialogue", status: "Live", desc: "Look closer." },
  { title: "Interactive Card Deck", status: "Live", desc: "The playable card deck further down — click any card to flip it." },
  { title: "AR Wall Preview", status: "Research", desc: "Letting a collector see a piece on their own wall before buying." },
];

const marqueeImages = artworks.slice(0, 10).map((a) => ({ src: a.image, alt: a.title }));

// Experiment 07 reads the same artwork source as the homepage collection.
const dialogueWorks = getDialogueWorks().map((w) => ({ ...w, annotations: getAnnotations(w.slug) }));

export default function ArtLabPage() {
  return (
    <div id="art-lab" className="pt-32 pb-24">
      <div className="px-6 md:px-10">
        <p className="label-mono text-ivory/50 mb-3">EARTGALLA ART LAB</p>
        <h1 className="font-editorial text-4xl md:text-6xl mb-6">Where Technology Meets Art</h1>
        <p className="text-ivory/60 max-w-xl mb-16">
          This is the part of EARTGALLA that plays. Flip a card, scroll the wall of work
          below, and see what we&apos;re actually building — honestly labeled by status.
        </p>
        <div className="grid md:grid-cols-2 gap-px bg-ivory/10 mb-24">
          {EXPERIMENTS.map((e) => {
            const body = (
              <>
                <p className={`label-mono mb-3 ${e.status === "Live" ? "text-electric" : "text-gold"}`}>
                  {e.no ? `${e.no} · ` : ""}{e.status.toUpperCase()}
                </p>
                <h2 className="font-editorial text-2xl mb-3">{e.title}</h2>
                <p className="text-ivory/60">{e.desc}</p>
              </>
            );
            return e.no ? (
              <a
                key={e.title}
                href={`#experiment-${e.no}`}
                data-cursor="view"
                className="bg-charcoal p-8 block transition-colors hover:bg-ivory/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold"
              >
                {body}
              </a>
            ) : (
              <div key={e.title} className="bg-charcoal p-8">
                {body}
              </div>
            );
          })}
        </div>
      </div>

      {/* ART ALCHEMY — flagship experiment */}
      <div id="experiment-04" className="scroll-mt-16">
        <ArtAlchemy />
      </div>

      {/* ART WITHOUT BORDERS */}
      <div id="experiment-05" className="scroll-mt-16">
        <ArtWithoutBorders />
      </div>

      {/* THE LIVING CANVAS */}
      <div id="experiment-06" className="scroll-mt-16">
        <LivingCanvas />
      </div>

      {/* THE ART DIALOGUE — experiment 07 */}
      <ArtDialogue works={dialogueWorks} />

      {/* PLAY WITH THE CARDS */}
      <div className="px-6 md:px-10 mb-24">
        <p className="label-mono text-ivory/50 mb-2">LIVE EXPERIMENT</p>
        <h2 className="font-editorial text-3xl md:text-4xl mb-3">Play With the Cards</h2>
        <p className="text-ivory/60 max-w-lg mb-10">
          John Njoroge&apos;s hand-painted deck, rebuilt as something you can actually touch.
          Click any card — it&apos;ll turn around.
        </p>
        <PlayCards />
      </div>

      {/* MARQUEE — full bleed, breaks out of the page padding */}
      <div className="mb-4">
        <Marquee images={marqueeImages} speed={42} />
      </div>
      <div className="mb-24">
        <Marquee images={[...marqueeImages].reverse()} speed={34} reverse />
      </div>

      <div className="px-6 md:px-10">
        <p className="text-ivory/40 label-mono">
          More experiments land here as they&apos;re built — this page is meant to keep changing.
        </p>
      </div>
    </div>
  );
}
