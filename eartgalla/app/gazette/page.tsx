import Link from "next/link";
import { stories } from "@/lib/data";

export const metadata = { title: "Gazette | EARTGALLA" };

export default function GazettePage() {
  const [featured, ...rest] = stories;
  return (
    <div className="pt-32 px-6 md:px-10 pb-24">
      <p className="label-mono text-ivory/50 mb-3">THE EARTGALLA GAZETTE</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-14">Studio. People. Process. Culture.</h1>

      {/* featured story, full-bleed editorial treatment */}
      <Link href={`/gazette/${featured.slug}`} data-cursor="read" className="group block mb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden order-2 md:order-1">
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="order-1 md:order-2">
            <p className="label-mono text-gold mb-4">FEATURED — {featured.category}</p>
            <h2 className="font-editorial text-3xl md:text-5xl leading-tight mb-5">{featured.title}</h2>
            <p className="text-ivory/70 text-lg">{featured.excerpt}</p>
            <span className="inline-block mt-6 label-mono border-b border-ivory/30 pb-1">Read the Story</span>
          </div>
        </div>
      </Link>

      <div className="hr-hairline mb-16" />

      <div className="grid md:grid-cols-2 gap-10">
        {rest.map((s) => (
          <Link key={s.id} href={`/gazette/${s.slug}`} data-cursor="read" className="group">
            <div className="aspect-[16/10] overflow-hidden mb-4">
              <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <p className="label-mono text-gold mb-2">{s.category}</p>
            <h2 className="font-editorial text-2xl leading-snug">{s.title}</h2>
            <p className="text-ivory/60 mt-2">{s.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
