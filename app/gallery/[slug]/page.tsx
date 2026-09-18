import { artworks, artists } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export function generateStaticParams() {
  return artworks.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) return { title: "Artwork Not Found | EARTGALLA" };
  const artist = artists.find((a) => a.id === artwork.artistId);
  const title = `${artwork.title}${artist ? ` — ${artist.name}` : ""} | EARTGALLA`;
  const description = artwork.description ?? `${artwork.title}${artist ? ` by ${artist.name}` : ""}, part of the EARTGALLA collection.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: artwork.image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [artwork.image] },
  };
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) notFound();
  const artist = artists.find((a) => a.id === artwork.artistId)!;
  const related = artworks.filter((a) => a.artistId === artist.id && a.id !== artwork.id).slice(0, 3);

  return (
    <div className="pt-28 pb-24">
      <div className="grid md:grid-cols-2 gap-10 px-6 md:px-10">
        <div className="aspect-[4/5] overflow-hidden relative">
          <Image src={artwork.image} alt={artwork.title} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
        <div className="pt-4">
          <p className="label-mono text-ivory/50 mb-4">{artwork.availability === "sold" ? "SOLD" : "AVAILABLE"}</p>
          <h1 className="font-editorial text-4xl md:text-5xl mb-2">{artwork.title}</h1>
          <Link href={`/artists/${artist.slug}`} className="label-mono text-gold">{artist.name}</Link>

          <dl className="grid grid-cols-2 gap-y-3 mt-8 label-mono text-ivory/70 max-w-sm">
            <dt className="opacity-40">Year</dt><dd>{artwork.year ?? "—"}</dd>
            <dt className="opacity-40">Medium</dt><dd>{artwork.medium ?? "—"}</dd>
            <dt className="opacity-40">Dimensions</dt><dd>{artwork.dimensions ?? "—"}</dd>
            <dt className="opacity-40">Collection</dt><dd>{artwork.collection ?? "—"}</dd>
            <dt className="opacity-40">Price</dt>
            <dd>{artwork.price ? `KES ${artwork.price.toLocaleString()}` : "Price on request"}</dd>
          </dl>

          <div className="mt-10 flex gap-4">
            <Link href="/contact" className="label-mono border border-ivory/30 rounded-full px-6 py-3">Enquire</Link>
            <Link href="/wear" className="label-mono border border-ivory/30 rounded-full px-6 py-3">Wear This Piece</Link>
          </div>

          <div className="hr-hairline my-10" />
          <h2 className="label-mono text-ivory/50 mb-3">ABOUT THE WORK</h2>
          <p className="text-ivory/70">{artwork.description ?? "Artist notes for this piece haven't been published yet — check back soon, or ask us directly."}</p>

          <h2 className="label-mono text-ivory/50 mt-8 mb-3">ABOUT THE ARTIST</h2>
          <p className="text-ivory/70">{artist.bio ?? `${artist.name}'s biography is being finalised.`}</p>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24 px-6 md:px-10">
          <p className="label-mono text-ivory/50 mb-6">SEE IT IN CONTEXT</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/gallery/${r.slug}`} data-cursor="view" className="block group">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={r.image} alt={r.title} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <p className="font-editorial mt-2">{r.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
