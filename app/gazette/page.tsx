import Link from "next/link";
import { stories } from "@/lib/data";

export const metadata = { title: "Gazette | EARTGALLA" };

export default function GazettePage() {
  return (
    <div className="pt-32 px-6 md:px-10 pb-24">
      <p className="label-mono text-ivory/50 mb-3">THE EARTGALLA GAZETTE</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-14">Studio. People. Process. Culture.</h1>
      <div className="grid md:grid-cols-2 gap-10">
        {stories.map((s) => (
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
