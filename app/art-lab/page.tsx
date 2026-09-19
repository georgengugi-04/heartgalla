import PlayCards from "@/components/PlayCards";
import Marquee from "@/components/Marquee";
import ArtAlchemy from "@/components/alchemy/ArtAlchemy";
import ArtWithoutBorders from "@/components/awb/ArtWithoutBorders";
import LivingCanvas from "@/components/livingcanvas/LivingCanvas";
import SoundOfColour from "@/components/soundofcolour/SoundOfColour";
import CollectorsEye from "@/components/collectorseye/CollectorsEye";
import { artworks } from "@/lib/data";

export const metadata = { title: "Art Lab | EARTGALLA" };

const EXPERIMENTS = [
  { title: "Art Alchemy", status: "Live", desc: "Turn a painting into a living visual instrument." },
  { title: "Art Without Borders", status: "Live", desc: "A radial map from Kenya outward, and the archive it opens into." },
  { title: "The Living Canvas", status: "Live", desc: "Deconstruct a painting into colour, texture and form — then watch it recompose." },
  { title: "The Sound of Colour", status: "Live", desc: "A palette, translated into a chord. Press play and listen to a painting." },
  { title: "The Collector's Eye", status: "Live", desc: "Eight A/B picks, ending in a real recommendation from the roster." },
  { title: "Interactive Card Deck", status: "Live", desc: "The playable card deck further down — click any card to flip it." },
  { title: "AR Wall Preview", status: "Research", desc: "Letting a collector see a piece on their own wall before buying." },
];

const marqueeImages = artworks.slice(0, 10).map((a) => ({ src: a.image, alt: a.title }));

export default function ArtLabPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="px-6 md:px-10">
        <p className="label-mono text-ivory/50 mb-3">EARTGALLA ART LAB</p>
        <h1 className="font-editorial text-4xl md:text-6xl mb-6">Where Technology Meets Art</h1>
        <p className="text-ivory/60 max-w-xl mb-16">
          This is the part of EARTGALLA that plays. Flip a card, scroll the wall of work
          below, and see what we&apos;re actually building — honestly labeled by status.
        </p>
        <div className="grid md:grid-cols-2 gap-px bg-ivory/10 mb-24">
          {EXPERIMENTS.map((e) => (
            <div key={e.title} className="bg-charcoal p-8">
              <p className={`label-mono mb-3 ${e.status === "Live" ? "text-electric" : "text-gold"}`}>{e.status.toUpperCase()}</p>
              <h2 className="font-editorial text-2xl mb-3">{e.title}</h2>
              <p className="text-ivory/60">{e.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ART ALCHEMY — flagship experiment */}
      <ArtAlchemy />

      {/* ART WITHOUT BORDERS */}
      <ArtWithoutBorders />

      {/* THE LIVING CANVAS */}
      <LivingCanvas />

      {/* THE SOUND OF COLOUR */}
      <SoundOfColour />

      {/* THE COLLECTOR'S EYE */}
      <CollectorsEye />

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
