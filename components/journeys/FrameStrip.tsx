import Image from "next/image";
import type { Photo } from "@/lib/journeys/types";

export type Frame = Photo & { place: string };

/**
 * "Kenya in frames": big photos in a swipeable, snapping strip. Server-rendered, no JS needed;
 * keyboard users can scroll it because the strip is focusable.
 */
export default function FrameStrip({ frames, label }: { frames: Frame[]; label: string }) {
  if (frames.length === 0) return null;
  return (
    <div className="jr-strip flex gap-4 overflow-x-auto px-6 pb-6 md:gap-6 md:px-10" role="group" aria-label={label} tabIndex={0}>
      {frames.map((f, i) => (
        <figure key={f.src} className="relative m-0 h-[62svh] w-[78vw] flex-none overflow-hidden bg-ivory/5 md:h-[70svh] md:w-[34rem]">
          <Image src={f.src} alt={f.alt} fill sizes="(min-width: 768px) 544px, 78vw" className="object-cover transition-transform duration-[1400ms] ease-out hover:scale-[1.04]" priority={i === 0} />
          <div data-theme="dark" className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-transparent to-transparent" aria-hidden />
          <figcaption data-theme="dark" className="absolute inset-x-0 bottom-0 p-5 text-ivory md:p-7">
            <span className="label-mono block text-gold">{String(i + 1).padStart(2, "0")} · {f.place}</span>
            <span className="font-editorial mt-2 block text-2xl leading-tight md:text-3xl">{f.alt}</span>
            <span className="label-mono mt-2 block text-[0.65rem] text-ivory/50">{f.credit}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
