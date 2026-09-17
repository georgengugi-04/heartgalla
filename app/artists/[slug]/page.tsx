import { artists, worksByArtist } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

export function generateStaticParams() {
  return artists.map((a) => ({ slug: a.slug }));
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) notFound();
  const works = worksByArtist(artist.id);
  const hero = works[0]?.image ?? artist.coverImage;

  return (
    <div className="pb-24">
      <div className="relative h-[70vh] flex items-end">
        <img src={hero} alt={artist.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <div className="relative z-10 px-6 md:px-10 pb-14">
          <p className="label-mono text-ivory/60 mb-3">{artist.location}</p>
          <h1 className="font-editorial text-5xl md:text-7xl">{artist.name}</h1>
        </div>
      </div>

      <div className="px-6 md:px-10 pt-16 grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="label-mono text-ivory/50 mb-4">ARTIST STATEMENT</h2>
          {artist.statement ? (
            <p className="font-editorial text-xl leading-relaxed">{artist.statement}</p>
          ) : (
            <p className="text-ivory/50 italic">Artist statement not yet published.</p>
          )}
          <h2 className="label-mono text-ivory/50 mt-10 mb-4">BIOGRAPHY</h2>
          {artist.bio ? (
            <p className="text-ivory/70 leading-relaxed">{artist.bio}</p>
          ) : (
            <p className="text-ivory/50 italic">
              Biography coming soon{artist.status === "pending" ? " — this artist profile is a placeholder pending confirmation with the EARTGALLA founder." : "."}
            </p>
          )}
        </div>
        <div className="label-mono text-ivory/60 space-y-2">
          <p className="opacity-40">SOCIAL</p>
          {artist.socialLinks.instagram && <a href={artist.socialLinks.instagram}>Instagram</a>}
          {!artist.socialLinks.instagram && <p className="opacity-40">Not yet linked</p>}
          <Link href="/contact" className="block mt-6 border border-ivory/30 rounded-full px-5 py-2.5 w-fit">
            Commission Enquiry
          </Link>
        </div>
      </div>

      <div className="mt-20 px-6 md:px-10">
        <h2 className="label-mono text-ivory/50 mb-6">SELECTED WORKS</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {works.map((w) => (
            <Link key={w.id} href={`/gallery/${w.slug}`} data-cursor="view" className="group block overflow-hidden">
              <img src={w.image} alt={w.title} className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-700" />
              <p className="font-editorial mt-2">{w.title}</p>
              <p className="label-mono opacity-50">{w.price ? `KES ${w.price.toLocaleString()}` : "Price on request"}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
