"use client";
import { useEffect, useReducer, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { DialogueWork } from "@/lib/collection";
import { getAnnotations } from "@/lib/annotations";
import { sessionReducer, initialSessionState } from "./session";
import { useMediaQuery, useElementSize } from "@/lib/artdialogue-hooks";
import ArtworkStage from "./ArtworkStage";
import { ArtworkPicker, DetailRow, HintLine, RevealButton } from "./DialogueControls";
import ArtworkStory from "./ArtworkStory";

export default function ArtDialogue({ works }: { works: DialogueWork[] }) {
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const [session, dispatch] = useReducer(sessionReducer, initialSessionState);
  const [imageError, setImageError] = useState(false);
  const [frameRef, frameSize] = useElementSize<HTMLDivElement>();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");

  const work = works[activeWorkIndex];
  const annotations = work ? getAnnotations(work.slug) : [];
  const active = annotations.find((a) => a.id === session.activeId);
  const activeIndex = active ? annotations.findIndex((a) => a.id === active.id) : -1;

  // Escape closes the open entry — a real keyboard subscription, not derived state
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dispatch({ type: "close" });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!work) return null;

  function selectWork(i: number) {
    setActiveWorkIndex(i);
    dispatch({ type: "reset" });
    setImageError(false);
  }

  function handleReturn() {
    dispatch({ type: "hideReveal" });
    window.setTimeout(() => dispatch({ type: "reset" }), reducedMotion ? 0 : 400);
    if (!reducedMotion) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      sectionRef.current?.scrollIntoView({ block: "start" });
    }
  }

  function step(dir: 1 | -1) {
    if (activeIndex < 0) return;
    const next = (activeIndex + dir + annotations.length) % annotations.length;
    dispatch({ type: "open", id: annotations[next].id });
  }

  return (
    <section id="experiment-11" className="py-16 md:py-24 border-t border-ivory/10 scroll-mt-16" ref={sectionRef}>
      <div className="px-6 md:px-10 mb-4">
        <a href="/art-lab" className="label-mono text-ivory/40 hover:text-ivory/70 transition-colors">
          ← Art Lab
        </a>
      </div>

      <div className="px-6 md:px-10 mb-10 text-center relative">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 11</span>
          <span>·</span><span>LOOKING</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE ART DIALOGUE</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70">Look closer.</p>

        {works.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="label-mono text-ivory/30">
              Artwork {activeWorkIndex + 1} of {works.length}
            </span>
          </div>
        )}
        <div className="absolute top-0 right-6 md:right-10 hidden md:block">
          <ArtworkPicker works={works} activeIndex={activeWorkIndex} onSelect={selectWork} />
        </div>
      </div>

      <div className="px-6 md:px-10 md:hidden mb-6 flex justify-center">
        <ArtworkPicker works={works} activeIndex={activeWorkIndex} onSelect={selectWork} />
      </div>

      <div className="px-6 md:px-10 max-w-5xl mx-auto">
        <div className={`relative flex ${isDesktop ? "flex-row" : "flex-col"} gap-8`}>
          <motion.div
            className={isDesktop ? "flex-1 min-w-0" : "w-full"}
            animate={{ x: isDesktop && active ? -40 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeOut" }}
          >
            <ArtworkStage
              work={work}
              annotations={annotations}
              session={session}
              dispatch={dispatch}
              hoverCapable={hoverCapable}
              reducedMotion={reducedMotion}
              imageError={imageError}
              onImageError={() => setImageError(true)}
              frameRef={frameRef}
              frameSize={frameSize}
            />
          </motion.div>

          {/* catalogue entry — desktop: floats beside the artwork; mobile: sits below */}
          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: isDesktop ? 20 : 0, y: isDesktop ? 0 : 12 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.4 }}
                className={isDesktop ? "w-72 flex-shrink-0 self-start sticky top-24" : "w-full"}
              >
                <div className="border-l-2 border-gold pl-5">
                  <p className="label-mono text-gold mb-3">{active.kind.toUpperCase()}</p>
                  <p className="font-editorial text-xl leading-relaxed mb-4">{active.text}</p>
                  <div className="flex items-center gap-4 label-mono text-ivory/40">
                    <button onClick={() => step(-1)} aria-label="Previous detail" className="hover:text-ivory transition-colors">
                      ←
                    </button>
                    <span>
                      {String(activeIndex + 1).padStart(2, "0")} / {String(annotations.length).padStart(2, "0")}
                    </span>
                    <button onClick={() => step(1)} aria-label="Next detail" className="hover:text-ivory transition-colors">
                      →
                    </button>
                    <button onClick={() => dispatch({ type: "close" })} aria-label="Close detail" className="ml-auto hover:text-ivory transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DetailRow annotations={annotations} session={session} dispatch={dispatch} isDesktop={isDesktop} />
        <HintLine hoverCapable={hoverCapable} />

        {!session.revealed && session.opened.length > 0 && <RevealButton onClick={() => dispatch({ type: "reveal" })} />}

        {/* visually hidden live region announcing the active observation */}
        <p className="sr-only" aria-live="polite">
          {active ? `${active.kind}: ${active.text}` : ""}
        </p>

        <AnimatePresence>
          {session.revealed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.15 : 0.4 }}>
              <ArtworkStory work={work} reducedMotion={reducedMotion} />
              <div className="text-center mt-10">
                <button onClick={handleReturn} className="label-mono text-ivory/40 hover:text-ivory transition-colors">
                  ← Return to artwork
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
