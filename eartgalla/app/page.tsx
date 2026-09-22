import Hero from "@/components/Hero";
import EnterGallery from "@/components/EnterGallery";
import CollectionGallery from "@/components/collection/CollectionGallery";
import ArtistRow from "@/components/ArtistRow";
import GazetteTeaser from "@/components/GazetteTeaser";
import Marquee from "@/components/Marquee";
import { artworks, artists } from "@/lib/data";
import { getCollection } from "@/lib/collection";
import Link from "next/link";

const brandMarquee = [
  { src: "/brand/marquee/idea-sketch.jpg", alt: "The idea takes shape" },
  { src: "/brand/marquee/brush-gold-monogram.jpg", alt: "Art comes to life" },
  { src: "/brand/marquee/logo-reveal-silk.jpg", alt: "The logo reveals" },
  { src: "/brand/marquee/painted-face-story.jpg", alt: "The story begins" },
  { src: "/brand/marquee/gallery-interior.jpg", alt: "Discover the artists" },
  { src: "/brand/marquee/wear-the-art-jacket.jpg", alt: "Wear the art" },
  { src: "/brand/marquee/nairobi-skyline.jpg", alt: "A global stage" },
  { src: "/brand/marquee/logo-with-ribbons.jpg", alt: "The journey continues" },
];

export default function Home() {
  const featured = artworks
    .filter((a) => a.featured)
    .slice(0, 4)
    .map((artwork) => ({
      artwork,
      artist: artists.find((ar) => ar.id === artwork.artistId)!,
    }));

  return (
    <>
      <Hero
        image="/art/lenny/moonlight-study.jpg"
        alt="Lenny Kariuki in the studio, holding a night-sky painting in progress"
        credit="IN THE STUDIO — LENNY KARIUKI"
      />

      {/* THE COLLECTION — the immersive gallery, immediately after the hero. Same artwork
          source as the rest of the site (lib/data.ts), curated by slug in lib/collection.ts. */}
      <CollectionGallery items={getCollection()} />

      <EnterGallery items={featured} />

      {/* brand story marquee — the EARTGALLA origin reel */}
      <section className="py-16 md:py-24">
        <p className="label-mono text-ivory/50 mb-8 px-6 md:px-10">HOW WE GOT HERE</p>
        <Marquee images={brandMarquee} speed={46} height="h-48 md:h-64" />
      </section>

      <ArtistRow />
      <GazetteTeaser />

      {/* honest, no-hype closing statement */}
      <section className="px-6 md:px-10 py-24 md:py-40 text-center">
        <p className="font-editorial italic text-2xl md:text-4xl max-w-2xl mx-auto leading-snug">
          &ldquo;Art should not need permission to be seen.&rdquo;
        </p>
        <p className="label-mono text-ivory/40 mt-8">NAIROBI → THE WORLD</p>
        <div className="flex gap-6 justify-center mt-10">
          <Link href="/gallery" data-cursor="view" className="label-mono border border-ivory/30 rounded-full px-6 py-3">
            Enter the Gallery
          </Link>
          <Link href="/artists" data-cursor="view" className="label-mono border border-ivory/30 rounded-full px-6 py-3">
            Meet the Artists
          </Link>
        </div>
      </section>
    </>
  );
}
