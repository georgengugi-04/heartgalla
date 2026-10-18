import Link from "next/link";
import Image from "next/image";
import { artists, worksByArtist } from "@/lib/data";

export const metadata = {
  title: "Artists — EARTGALLA",
  description: "The artists on EARTGALLA: Lenny Kariuki, Alvin Mwangi and John Njoroge.",
};

export default function ArtistsPage() {
  return (
    <div className="pb-24">
      <div className="relative mb-16 flex h-[45vh] items-end md:h-[55vh]">
        <Image src="/brand/clean/gallery-interior.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <div className="relative z-10 px-6 pb-10 md:px-10">
          <p className="label-mono mb-3 text-ivory/70">THE ARTISTS</p>
          <h1 className="font-editorial text-4xl md:text-6xl">Three Voices, One Platform</h1>
        </div>
      </div>
      <ul className="px-6 md:px-10">
        {artists.map((a, i) => {
          const cover = worksByArtist(a.id)[0]?.image;
          return (
            <li key={a.id}>
              <Link
                href={`/artists/${a.slug}`}
                data-cursor="view"
                className="group flex items-center justify-between gap-6 border-t border-ivory/10 py-7 last:border-b focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold md:py-8"
              >
                <div className="flex min-w-0 items-center gap-5 md:gap-8">
                  <span className="label-mono text-ivory/55">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block font-editorial text-3xl transition-all group-hover:italic md:text-5xl">{a.name}</span>
                    {a.status === "pending" && <span className="label-mono mt-1 block text-ivory/60">Profile in progress</span>}
                  </span>
                </div>
                {/* always visible on small screens; fades in on hover where there is a hover */}
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full md:h-24 md:w-24 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                  {cover && <Image src={cover} alt="" fill sizes="96px" className="object-cover" />}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
