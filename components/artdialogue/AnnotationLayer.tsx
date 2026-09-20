"use client";
import { motion, AnimatePresence } from "motion/react";
import type { Annotation } from "@/lib/annotations";
import type { SessionState, SessionAction } from "./session";

export default function AnnotationLayer({
  annotations,
  session,
  dispatch,
  frameSize,
  reducedMotion,
}: {
  annotations: Annotation[];
  session: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  frameSize: { width: number; height: number };
  reducedMotion: boolean;
}) {
  const active = annotations.find((a) => a.id === session.activeId);

  return (
    <>
      {/* leader line from the open marker to the catalogue entry, right edge of frame */}
      {active && frameSize.width > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          width={frameSize.width}
          height={frameSize.height}
          viewBox={`0 0 ${frameSize.width} ${frameSize.height}`}
        >
          <motion.line
            x1={active.x * frameSize.width}
            y1={active.y * frameSize.height}
            x2={frameSize.width}
            y2={Math.min(Math.max(active.y * frameSize.height, 24), frameSize.height - 24)}
            stroke="#c9a24a"
            strokeWidth={1}
            initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }}
          />
        </svg>
      )}

      <AnimatePresence>
        {annotations
          .filter((a) => session.noticed.includes(a.id))
          .map((a) => {
            const isActive = a.id === session.activeId;
            const index = annotations.findIndex((x) => x.id === a.id);
            return (
              <motion.button
                key={a.id}
                onClick={() => dispatch({ type: "open", id: a.id })}
                aria-label={`Detail ${String(index + 1).padStart(2, "0")}, ${a.kind}`}
                aria-pressed={isActive}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.15 : 0.4 }}
                className="absolute flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-full"
                style={{
                  left: `${a.x * 100}%`,
                  top: `${a.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                  width: 44,
                  height: 44,
                }}
              >
                <span
                  className={`absolute rounded-full border ${isActive ? "border-gold" : "border-ivory/60"}`}
                  style={{ width: 22, height: 22 }}
                />
                <span className={`absolute rounded-full ${isActive ? "bg-gold" : "bg-ivory"}`} style={{ width: 5, height: 5 }} />
                {!reducedMotion && (
                  <motion.span
                    className="absolute rounded-full border border-ivory/40"
                    style={{ width: 22, height: 22 }}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                  />
                )}
              </motion.button>
            );
          })}
      </AnimatePresence>
    </>
  );
}
