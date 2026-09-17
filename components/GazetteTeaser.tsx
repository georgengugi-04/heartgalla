import Link from "next/link";
import { stories } from "@/lib/data";

export default function GazetteTeaser() {
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="label-mono text-ivory/50 mb-3">04 — THE GAZETTE</p>
          <h2 className="font-editorial text-3xl md:text-4xl">Stories, not just sales.</h2>
        </div>
        <Link href="/gazette" data-cursor="read" className="label-mono border-b border-ivory/30 pb-1 hidden md:block">
          All Stories
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stories.slice(0, 3).map((s) => (
          <Link key={s.id} href={`/gazette/${s.slug}`} data-cursor="read" className="group">
            <div className="aspect-[4/3] overflow-hidden mb-4">
              <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <p className="label-mono text-gold mb-2">{s.category}</p>
            <h3 className="font-editorial text-xl leading-snug">{s.title}</h3>
            <p className="text-ivory/60 text-sm mt-2">{s.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
