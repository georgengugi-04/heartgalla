import Link from "next/link";
import { artists, worksByArtist } from "@/lib/data";

export const metadata = { title: "Artists | EARTGALLA" };

export default function ArtistsPage() {
  return (
    <div className="pb-24">
      <div className="relative h-[45vh] md:h-[55vh] flex items-end mb-16">
        <img src="/brand/clean/gallery-interior.jpg" alt="Discover the artists" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <div className="relative z-10 px-6 md:px-10 pb-10">
          <p className="label-mono text-ivory/60 mb-3">THE ARTISTS</p>
          <h1 className="font-editorial text-4xl md:text-6xl">Three Voices, One Platform</h1>
        </div>
      </div>
      <div className="px-6 md:px-10">
      <div className="flex flex-col gap-3">
        {artists.map((a, i) => {
          const cover = worksByArtist(a.id)[0]?.image;
          return (
            <Link
              key={a.id}
              href={`/artists/${a.slug}`}
              data-cursor="view"
              className="group flex items-center justify-between border-t border-ivory/10 py-8 last:border-b"
            >
              <div className="flex items-center gap-8">
                <span className="label-mono opacity-40">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-editorial text-3xl md:text-5xl group-hover:italic transition-all">{a.name}</span>
              </div>
              <div className="hidden md:block w-24 h-24 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
              </div>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
