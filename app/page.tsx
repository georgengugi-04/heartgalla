import Hero from "@/components/Hero";
import EnterGallery from "@/components/EnterGallery";
import ArtistRow from "@/components/ArtistRow";
import GazetteTeaser from "@/components/GazetteTeaser";
import Marquee from "@/components/Marquee";
import { artworks, artists } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";

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
        image="/art/lenny/the-spearman.jpg"
        alt="The Spearman — Lenny Kariuki, paint and pencil"
        credit="THE SPEARMAN — LENNY KARIUKI"
      />

      {/* 01 — first artwork wall, immediately after hero */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <p className="label-mono text-ivory/50 mb-10">01 — THE WORK</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {artworks.slice(0, 8).map((a, i) => (
            <Link
              href={`/gallery/${a.slug}`}
              key={a.id}
              data-cursor="view"
              className={`relative overflow-hidden group ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              style={{ aspectRatio: i === 0 ? "1/1" : "3/4" }}
            >
              <Image
                src={a.image}
                alt={a.title}
                fill
                sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </Link>
          ))}
        </div>
      </section>

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
