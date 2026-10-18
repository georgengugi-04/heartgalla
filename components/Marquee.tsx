"use client";

/**
 * Continuous horizontal image marquee. Duplicates the image set once so the
 * CSS animation loop is seamless. Pauses under prefers-reduced-motion via
 * the animation-play-state rule in the class below (see globals.css).
 */
export default function Marquee({
  images,
  speed = 38,
  reverse = false,
  height = "h-40 md:h-56",
}: {
  images: { src: string; alt: string }[];
  speed?: number;
  reverse?: boolean;
  height?: string;
}) {
  const track = [...images, ...images];
  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex gap-4 marquee-track ${reverse ? "marquee-reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {track.map((img, i) => (
          <div key={i} className={`relative flex-shrink-0 w-56 md:w-72 ${height} overflow-hidden rounded-lg`}>
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover" draggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
