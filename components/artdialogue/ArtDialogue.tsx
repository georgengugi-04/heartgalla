"use client";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Annotation } from "@/lib/annotations";
import { EASE_OUT } from "@/lib/frame";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import ArtworkStage from "./ArtworkStage";
import ArtworkStory from "./ArtworkStory";
import DialogueControls from "./DialogueControls";
import { emptySession, sessionReducer, type DialogueWork } from "./session";

const pad = (n: number) => String(n).padStart(2, "0");
const NO_ANNOTATIONS: Annotation[] = []; // stable identity for the empty case

/**
 * EXPERIMENT 10 — THE ART DIALOGUE
 * Viewer ↔ artwork. LOOK → NOTICE → EXPLORE → UNDERSTAND → REVEAL → RETURN.
 * Every observation comes from lib/annotations.ts (things that can be seen, never intentions);
 * every fact about the work comes from lib/data.ts, and a field that doesn't exist is not shown.
 */
export default function ArtDialogue({ works }: { works: DialogueWork[] }) {
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  const [workIndex, setWorkIndex] = useState(0);
  const [session, dispatch] = useReducer(sessionReducer, emptySession);
  const stageAnchor = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const work = works[workIndex] ?? null;
  const annotations = work?.annotations ?? NO_ANNOTATIONS;
  const threshold = Math.min(3, annotations.length);
  const activeIndex = annotations.findIndex((a) => a.id === session.activeId);

  const open = useCallback((id: string) => dispatch({ type: "open", id, threshold }), [threshold]);
  const notice = useCallback((id: string) => dispatch({ type: "notice", id }), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      if (annotations.length === 0) return;
      const from = activeIndex === -1 ? (dir === 1 ? -1 : 0) : activeIndex;
      const next = annotations[(from + dir + annotations.length) % annotations.length];
      dispatch({ type: "open", id: next.id, threshold });
    },
    [annotations, activeIndex, threshold],
  );

  function selectWork(i: number) {
    if (i === workIndex) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    dispatch({ type: "reset" });
    setWorkIndex(i);
  }

  // RETURN: the layers come back off in reverse — the entry retracts first, then the markers,
  // and the work is left as it began.
  function returnToArtwork() {
    dispatch({ type: "hideReveal" });
    timers.current.push(
      window.setTimeout(() => dispatch({ type: "reset" }), reduced ? 0 : 650),
    );
    stageAnchor.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }

  const active = annotations[activeIndex] ?? null;

  return (
    <section
      id="experiment-10"
      aria-labelledby="experiment-10-title"
      onKeyDown={(e) => {
        if (e.key === "Escape" && session.activeId) {
          e.stopPropagation();
          dispatch({ type: "close" });
        }
      }}
      className="relative scroll-mt-16 overflow-hidden border-t border-ivory/10 bg-gallery-dark py-12 md:py-16"
    >
      <div className="mb-6 flex items-center justify-between gap-6 px-6 md:mb-6 md:px-10">
        <a
          href="#art-lab"
          className="eg-meta -ml-2 inline-flex min-h-11 items-center px-2 text-ivory/50 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          ← Art Lab
        </a>
        {works.length > 1 && (
          <ul className="flex items-center" aria-label="Choose an artwork">
            {works.map((w, i) => (
              <li key={w.id}>
                <button
                  type="button"
                  onClick={() => selectWork(i)}
                  aria-label={`Artwork ${i + 1} of ${works.length}`}
                  aria-current={i === workIndex ? "true" : undefined}
                  className={`eg-meta grid min-h-11 min-w-9 place-items-center border-b-2 px-1.5 tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                    i === workIndex ? "border-gold text-gold" : "border-transparent text-ivory/40 hover:text-ivory/75"
                  }`}
                >
                  {pad(i + 1)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-8 px-6 text-center md:mb-10 md:px-10">
        <div className="mb-5 flex flex-wrap items-center justify-center gap-3 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 10</span>
          <span>·</span>
          <span>INTERACTIVE</span>
          <span>·</span>
          <span>EARTGALLA ART LAB</span>
        </div>
        <h2 id="experiment-10-title" className="font-editorial text-4xl leading-[0.95] md:text-5xl">
          THE ART DIALOGUE
        </h2>
        <p className="mx-auto mt-4 max-w-md font-editorial text-xl italic text-ivory/70 md:text-2xl">Look closer.</p>
      </div>

      {work === null ? (
        <p className="px-6 text-center font-editorial text-xl text-ivory/60 md:px-10">
          The Dialogue is being prepared — there are no artworks ready for it yet.
        </p>
      ) : (
        <motion.div
          ref={stageAnchor}
          className="px-6 md:px-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: reduced ? 0.2 : 1, ease: EASE_OUT }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={work.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE_OUT }}
            >
              <ArtworkStage
                work={work}
                session={session}
                wide={wide}
                reduced={reduced}
                onNotice={notice}
                onOpen={open}
                onStep={step}
                onClose={() => dispatch({ type: "close" })}
              />
              <DialogueControls
                annotations={annotations}
                session={session}
                canHover={canHover}
                onOpen={open}
                onReveal={() => dispatch({ type: "reveal" })}
              />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {session.revealed && <ArtworkStory key={`story-${work.id}`} work={work} reduced={reduced} onReturn={returnToArtwork} />}
          </AnimatePresence>
        </motion.div>
      )}

      {/* the observation is announced once, here, so the visible entry doesn't need to be a live region */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {active ? `${active.kind}. ${active.text}` : ""}
      </p>
    </section>
  );
}
