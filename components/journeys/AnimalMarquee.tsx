import Image from "next/image";
import type { Photo } from "@/lib/journeys/types";

/**
 * A slow, endless strip of wildlife photos. Pure CSS (no client JS): it pauses on hover or keyboard focus,
 * and with "reduce motion" switched on it stops and becomes a normal swipe/scroll strip.
 * The second copy of the photos only exists to make the loop seamless, so it is hidden from screen readers.
 */
export default function AnimalMarquee({ photos, label, seconds = 8 }: { photos: Photo[]; label: string; seconds?: number }) {
  if (photos.length === 0) return null;
  const copy = (hidden: boolean) => (
    <ul className={`m-0 flex list-none gap-3 p-0 pr-3 ${hidden ? "marquee-dup" : ""}`} aria-hidden={hidden || undefined}>
      {photos.map((p) => (
        <li key={`${hidden ? "dup-" : ""}${p.src}`} className="relative h-48 w-72 flex-none overflow-hidden bg-ivory/5 md:h-64 md:w-96">
          <Image src={p.src} alt={hidden ? "" : p.alt} fill sizes="(min-width: 768px) 384px, 288px" className="object-cover" />
          <span className="label-mono absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/80 to-transparent px-3 pb-2 pt-6 text-[0.6rem] text-ivory/70">{p.credit}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee-pause overflow-hidden" role="group" aria-label={label} tabIndex={0}>
      <div className="marquee-track flex" style={{ animationDuration: `${photos.length * seconds}s` }}>
        {copy(false)}
        {copy(true)}
      </div>
    </div>
  );
}
