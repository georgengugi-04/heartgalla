"use client";
import type { Annotation } from "@/lib/annotations";
import type { Session } from "./session";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The way in that never depends on a mouse: every detail is a real button. Resting the cursor on the
 * work lights the matching one; tapping or pressing one reveals it directly. The list stays quiet:
 * a number and a dot until a detail has been found, and the kind of observation only after that.
 */
export default function DialogueControls({
  annotations,
  session,
  canHover,
  onOpen,
  onReveal,
}: {
  annotations: Annotation[];
  session: Session;
  canHover: boolean;
  onOpen: (id: string) => void;
  onReveal: () => void;
}) {
  const canReveal = !session.revealed && session.opened.length >= 1;
  return (
    <div className="mx-auto mt-6 max-w-5xl px-1 md:mt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-labelledby="dialogue-look-closer" className="min-w-0 lg:flex lg:items-center lg:gap-8">
          <p id="dialogue-look-closer" className="eg-meta text-ivory/55">
            Look closer
          </p>
          <ul className="mt-2 border-t border-ivory/10 lg:mt-0 lg:flex lg:items-center lg:gap-2 lg:border-t-0">
            {annotations.map((a, i) => {
              const found = session.noticed.includes(a.id);
              const read = session.opened.includes(a.id);
              const active = session.activeId === a.id;
              return (
                <li key={a.id} className="border-b border-ivory/10 lg:border-b-0">
                  <button
                    type="button"
                    onClick={() => onOpen(a.id)}
                    aria-pressed={active}
                    aria-label={`Detail ${pad(i + 1)}${found ? `, ${a.kind}` : ""}`}
                    className="group flex min-h-12 w-full items-center gap-3 px-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold lg:min-h-11 lg:w-auto lg:px-3"
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 shrink-0 rounded-full border transition-colors duration-500 ${
                        active ? "border-gold bg-gold" : read ? "border-gold/80 bg-gold/40" : found ? "border-ivory bg-ivory/30" : "border-ivory/40"
                      }`}
                    />
                    <span className={`eg-meta transition-colors ${active ? "text-ivory" : "text-ivory/60 group-hover:text-ivory"}`}>
                      <span className="lg:hidden">Detail </span>
                      {pad(i + 1)}
                    </span>
                    <span className="eg-meta ml-auto text-ivory/40 lg:hidden">{found ? a.kind : ""}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex min-h-11 items-center lg:justify-end">
          {canReveal ? (
            <button
              type="button"
              onClick={onReveal}
              className="eg-meta min-h-11 border-b border-ivory/40 pb-0.5 text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Reveal the work →
            </button>
          ) : session.revealed ? (
            <a
              href="#dialogue-reveal"
              className="eg-meta min-h-11 content-center text-ivory/55 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              The work is revealed ↓
            </a>
          ) : (
            <p className="eg-meta text-ivory/40">
              {canHover ? "Rest the cursor on the work, or choose a detail." : "Tap a detail to look closer."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
