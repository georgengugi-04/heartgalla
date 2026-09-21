import PlayCards from "@/components/PlayCards";
import Marquee from "@/components/Marquee";
import ExperimentTeaser from "@/components/artlab/ExperimentTeaser";
import ArtWithoutBorders from "@/components/awb/ArtWithoutBorders";
import ArtDialogue from "@/components/artdialogue/ArtDialogue";
import CollectorsEye from "@/components/collectorseye/CollectorsEye";
import SoundOfColour from "@/components/soundcolour/SoundOfColour";
import { artworks } from "@/lib/data";
import { getDialogueWorks } from "@/lib/collection";
import { getAnnotations } from "@/lib/annotations";
import { getCollectorPairs, getSoundWorks } from "@/lib/lab";
import { balancedMix } from "@/lib/balance";

export const metadata = { title: "Art Lab | EARTGALLA" };

// The index, in the same order as the sections below. `id` (the experiment number) turns a card into a link
// to its section; the unnumbered cards are the card deck section and the research item.
const EXPERIMENTS: { id?: string; title: string; status: string; desc: string }[] = [
  { id: "04", title: "The Collector\u2019s Eye", status: "Live", desc: "Eight A/B picks, ending in a real recommendation from the roster." },
  { id: "05", title: "Art Without Borders", status: "Live", desc: "A radial map from Kenya outward, and the archive it opens into." },
  { id: "06", title: "The Living Canvas", status: "Live", desc: "Deconstruct a painting into colour, texture and form — then watch it recompose." },
  { id: "07", title: "The Sound of Colour", status: "Live", desc: "A palette, translated into a chord. Press play and listen to a painting." },
  { id: "08", title: "Curate Your Wall", status: "Live", desc: "Drag real pieces onto a wall together, then save the mockup as an image." },
  { id: "09", title: "Art Alchemy", status: "Live", desc: "Turn a painting into a living visual instrument." },
  { id: "10", title: "The Art Dialogue", status: "Live", desc: "Look closer." },
  { id: "11", title: "The Borrowed Palette", status: "Live", desc: "Pick an artist, paint with their real palette, save your sketch." },
  { title: "Interactive Card Deck", status: "Live", desc: "The playable card deck further down — click any card to flip it." },
  { title: "AR Wall Preview", status: "Research", desc: "Letting a collector see a piece on their own wall before buying." },
];

const marqueeImages = balancedMix(artworks, 10).map((a) => ({ src: a.image, alt: a.title }));

// Every experiment that shows artworks reads the same source (lib/data.ts) through lib/collection.ts + lib/lab.ts.
const collectorPairs = getCollectorPairs();
const soundWorks = getSoundWorks();
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
        <div className="grid md:grid-cols-2 gap-px bg-ivory/10 mb-24 [&>*:last-child:nth-child(odd)]:md:col-span-2">
          {EXPERIMENTS.map((e) => {
            const body = (
              <>
                <p className={`label-mono mb-3 ${e.status === "Live" ? "text-electric" : "text-gold"}`}>{e.status.toUpperCase()}</p>
                <h2 className="font-editorial text-2xl mb-3">{e.title}</h2>
                <p className="text-ivory/60">{e.desc}</p>
              </>
            );
            return e.id ? (
              <a
                key={e.title}
                href={`#experiment-${e.id}`}
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

      {/* 04 · THE COLLECTOR'S EYE */}
      <div id="experiment-04" className="scroll-mt-16">
        <CollectorsEye pairs={collectorPairs} />
      </div>

      {/* 05 · ART WITHOUT BORDERS */}
      <div id="experiment-05" className="scroll-mt-16">
        <ArtWithoutBorders />
      </div>

      {/* 06 · THE LIVING CANVAS — opens on its own page: /art-lab/living-canvas */}
      <div id="experiment-06" className="scroll-mt-16">
        <ExperimentTeaser slug="living-canvas" />
      </div>

      {/* 07 · THE SOUND OF COLOUR */}
      <div id="experiment-07" className="scroll-mt-16">
        <SoundOfColour works={soundWorks} />
      </div>

      {/* 08 · CURATE YOUR WALL — opens on its own page: /art-lab/curate-your-wall */}
      <div id="experiment-08" className="scroll-mt-16">
        <ExperimentTeaser slug="curate-your-wall" />
      </div>

      {/* 09 · ART ALCHEMY — opens on its own page: /art-lab/art-alchemy */}
      <div id="experiment-09" className="scroll-mt-16">
        <ExperimentTeaser slug="art-alchemy" />
      </div>

      {/* 10 · THE ART DIALOGUE (has its own id="experiment-10") */}
      <ArtDialogue works={dialogueWorks} />

      {/* 11 · THE BORROWED PALETTE — opens on its own page: /art-lab/borrowed-palette */}
      <div id="experiment-11" className="scroll-mt-16">
        <ExperimentTeaser slug="borrowed-palette" />
      </div>

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
