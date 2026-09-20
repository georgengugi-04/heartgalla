"use client";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Catalogue-style progress: "03 / 07" and a hairline per work. When the slow ambient
 * progression is running, the active hairline fills over the interval, so the timing is
 * visible instead of a surprise. Every segment is a real button (44px tall hit area).
 */
export default function GalleryProgress({
  index,
  titles,
  playing,
  intervalMs,
  tick,
  onSelect,
  className = "",
}: {
  className?: string;
  index: number;
  titles: string[];
  playing: boolean;
  intervalMs: number;
  tick: number;
  onSelect: (i: number) => void;
}) {
  const count = titles.length;
  return (
    <div className={`flex min-w-0 items-center gap-4 md:gap-5 ${className}`}>
      <p className="eg-meta shrink-0 tabular-nums" aria-hidden="true">
        <span className="text-ivory">{pad(index + 1)}</span>
        <span className="text-ivory/40"> / {pad(count)}</span>
      </p>
      <ol className="flex min-w-0 flex-1 items-center gap-1.5" aria-label="Choose an artwork">
        {titles.map((title, i) => {
          const active = i === index;
          const done = i < index;
          return (
            <li key={i} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={`Show artwork ${i + 1} of ${count}: ${title}`}
                aria-current={active ? "true" : undefined}
                className="relative block h-11 w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                <span className="absolute inset-x-0 top-1/2 h-px bg-ivory/20" />
                <span
                  key={active ? `${index}-${tick}-${playing}` : i}
                  className={`absolute inset-x-0 top-1/2 -mt-px block h-[2px] origin-left ${
                    active ? "bg-ivory" : "bg-ivory/50"
                  }`}
                  style={
                    active
                      ? playing
                        ? { animation: `eg-fill ${intervalMs}ms linear forwards` }
                        : undefined
                      : { transform: done ? "scaleX(1)" : "scaleX(0)" }
                  }
                />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
