"use client";

const ring =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold rounded-sm";

/** Thumb-sized round arrow — used on small screens, where the side labels are hidden. */
export function RoundArrow({ dir, onClick, label }: { dir: -1 | 1; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ivory/25 text-ivory/80 transition-colors hover:border-ivory hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {dir < 0 ? "←" : "→"}
      </span>
    </button>
  );
}

/** "Previous / next artwork" text control shown beside the caption on larger screens. */
export function SideControl({
  side,
  title,
  onClick,
}: {
  side: "prev" | "next";
  title: string;
  onClick: () => void;
}) {
  const next = side === "next";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${next ? "Next" : "Previous"} artwork: ${title}`}
      className={`group hidden min-h-11 flex-col gap-1 py-2 md:flex ${next ? "items-end text-right" : "items-start text-left"} ${ring}`}
    >
      <span className="eg-meta text-ivory/40 transition-colors group-hover:text-ivory/80">
        {next ? "Next artwork →" : "← Previous artwork"}
      </span>
      <span className="max-w-[16rem] truncate font-editorial text-lg text-ivory/55 transition-colors group-hover:text-ivory">
        {title}
      </span>
    </button>
  );
}

/** Pause / play for the slow ambient progression (WCAG 2.2.2). */
export function AutoplayToggle({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={paused ? "Resume automatic progression" : "Pause automatic progression"}
      className={`eg-meta min-h-11 shrink-0 px-2 text-ivory/50 transition-colors hover:text-ivory ${ring}`}
    >
      {paused ? "Play" : "Pause"}
    </button>
  );
}
