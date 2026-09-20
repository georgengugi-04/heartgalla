"use client";
import type { Annotation } from "@/lib/annotations";
import type { DialogueWork } from "@/lib/collection";
import type { SessionState, SessionAction } from "./session";

export function ArtworkPicker({
  works,
  activeIndex,
  onSelect,
}: {
  works: DialogueWork[];
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  if (works.length < 2) return null;
  return (
    <div className="flex items-center gap-2" aria-label={`Artwork ${activeIndex + 1} of ${works.length}`}>
      {works.map((w, i) => (
        <button
          key={w.id}
          onClick={() => onSelect(i)}
          aria-label={`Switch to artwork ${i + 1} of ${works.length}`}
          aria-current={i === activeIndex}
          className={`label-mono w-8 h-8 flex items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
            i === activeIndex ? "border-gold text-gold" : "border-ivory/20 text-ivory/40 hover:text-ivory/70"
          }`}
        >
          {String(i + 1).padStart(2, "0")}
        </button>
      ))}
    </div>
  );
}

export function DetailRow({
  annotations,
  session,
  dispatch,
  isDesktop,
}: {
  annotations: Annotation[];
  session: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  isDesktop: boolean;
}) {
  function openDetail(id: string) {
    dispatch({ type: "notice", id });
    dispatch({ type: "open", id });
  }

  if (isDesktop) {
    return (
      <div className="flex flex-wrap items-center gap-2 mt-6">
        {annotations.map((a, i) => (
          <button
            key={a.id}
            onClick={() => openDetail(a.id)}
            aria-label={`Detail ${String(i + 1).padStart(2, "0")}, ${a.kind}`}
            aria-pressed={session.activeId === a.id}
            className={`label-mono border rounded-full px-4 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
              session.activeId === a.id ? "border-gold text-gold" : "border-ivory/25 text-ivory/60 hover:text-ivory"
            }`}
          >
            Detail {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="label-mono text-ivory/40 mb-3">Tap a detail to look closer.</p>
      <div className="flex flex-col gap-2">
        {annotations.map((a, i) => (
          <button
            key={a.id}
            onClick={() => openDetail(a.id)}
            aria-label={`Detail ${String(i + 1).padStart(2, "0")}, ${a.kind}`}
            aria-pressed={session.activeId === a.id}
            className={`label-mono flex items-center justify-between border rounded-lg px-4 min-h-[48px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
              session.activeId === a.id ? "border-gold text-gold" : "border-ivory/20 text-ivory/60"
            }`}
          >
            <span>Detail {String(i + 1).padStart(2, "0")}</span>
            <span className="text-ivory/30">{a.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function HintLine({ hoverCapable }: { hoverCapable: boolean }) {
  return (
    <p className="label-mono text-ivory/30 text-center mt-6">
      {hoverCapable ? "Rest the cursor on the work, or choose a detail." : "Tap a detail to look closer."}
    </p>
  );
}

export function RevealButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="text-center mt-8">
      <button
        onClick={onClick}
        className="label-mono border border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-charcoal transition-colors"
      >
        Reveal the work →
      </button>
    </div>
  );
}
