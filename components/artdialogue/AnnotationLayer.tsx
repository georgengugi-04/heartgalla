"use client";
import { AnimatePresence, motion } from "motion/react";
import type { Annotation } from "@/lib/annotations";
import { EASE_OUT } from "@/lib/frame";

const pad = (n: number) => String(n).padStart(2, "0");
const PANEL_W = 320;
const PANEL_GAP = 32;
/** horizontal room the desktop panel needs beside the artwork */
export const PANEL_SPACE = PANEL_W + PANEL_GAP;

/**
 * The catalogue entry for one observation. Exhibition-label typography, not a tooltip:
 * a hairline, the kind of observation, the observation itself, and "02 / 04".
 */
export function AnnotationPanel({
  annotation,
  index,
  total,
  onStep,
  onClose,
}: {
  annotation: Annotation;
  index: number;
  total: number;
  onStep: (dir: 1 | -1) => void;
  onClose: () => void;
}) {
  const btn =
    "min-h-11 min-w-11 px-2 text-ivory/50 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
  return (
    <div className="border-t border-ivory/30 pt-4">
      <p className="eg-meta text-gold">{annotation.kind}</p>
      <p className="mt-3 font-editorial text-[1.15rem] leading-relaxed text-ivory/90">{annotation.text}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="eg-meta tabular-nums text-ivory/50">
          {pad(index + 1)} / {pad(total)}
        </span>
        <span className="-mr-2 flex items-center">
          <button type="button" onClick={() => onStep(-1)} aria-label="Previous detail" className={btn}>
            ←
          </button>
          <button type="button" onClick={() => onStep(1)} aria-label="Next detail" className={btn}>
            →
          </button>
          <button type="button" onClick={onClose} aria-label="Close detail" className={btn}>
            ✕
          </button>
        </span>
      </div>
    </div>
  );
}

/**
 * Everything that sits on top of the artwork itself: the markers the visitor has found, the soft
 * focus around the active one, and (on wide screens only) the thin line that extends to the
 * catalogue entry. Coordinates are fractions of the artwork, so they hold at any size.
 * Small screens get numbered markers and the entry below the artwork — no lines forced into
 * a phone-sized viewport.
 */
export default function AnnotationLayer({
  annotations,
  noticedIds,
  activeId,
  size,
  wide,
  reduced,
  onOpen,
  onStep,
  onClose,
}: {
  annotations: Annotation[];
  noticedIds: string[];
  activeId: string | null;
  size: { w: number; h: number };
  wide: boolean;
  reduced: boolean;
  onOpen: (id: string) => void;
  onStep: (dir: 1 | -1) => void;
  onClose: () => void;
}) {
  const active = annotations.find((a) => a.id === activeId) ?? null;
  const activeIndex = active ? annotations.indexOf(active) : -1;
  const found = annotations.filter((a) => noticedIds.includes(a.id));

  // wide layout: where the line and the panel go
  const my = active ? active.y * size.h : 0;
  const mx = active ? active.x * size.w : 0;
  const panelTop = Math.min(Math.max(my - 18, 0), Math.max(0, size.h - 250));
  const showLine = wide && active && size.w > 0;

  return (
    <>
      {/* soft focus around the active detail */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.id}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${active.x * 100}% ${active.y * 100}%, rgba(11,10,9,0) 0%, rgba(11,10,9,0) 8%, rgba(11,10,9,0.62) 34%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE_OUT }}
          />
        )}
      </AnimatePresence>

      {/* markers */}
      <AnimatePresence>
        {found.map((a) => {
          const isActive = a.id === activeId;
          const i = annotations.indexOf(a);
          return (
            <motion.button
              key={a.id}
              type="button"
              onClick={() => onOpen(a.id)}
              aria-label={`Detail ${pad(i + 1)}, ${a.kind}`}
              aria-pressed={isActive}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.4, transition: { duration: 0.35, delay: (found.length - 1 - found.indexOf(a)) * 0.06 } }}
              transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE_OUT }}
              className="absolute z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              style={{ left: `${a.x * 100}%`, top: `${a.y * 100}%` }}
            >
              <span
                className={`relative grid place-items-center rounded-full border transition-all duration-500 ${
                  wide ? "h-3.5 w-3.5" : "eg-meta h-7 w-7 !text-[0.75rem] tracking-normal"
                } ${
                  isActive
                    ? "border-gold bg-gold text-charcoal"
                    : "border-ivory/80 bg-charcoal/40 text-ivory backdrop-blur-[1px]"
                }`}
              >
                {!wide && pad(i + 1)}
                {!isActive && !reduced && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border border-ivory/60"
                    style={{ animation: "eg-ping 2.6s ease-out 1" }}
                  />
                )}
              </span>
            </motion.button>
          );
        })}
      </AnimatePresence>

      {/* wide screens: a thin line extends from the point to the catalogue entry */}
      <AnimatePresence>
        {showLine && (
          <motion.svg
            key={`line-${active.id}`}
            aria-hidden="true"
            width={size.w}
            height={size.h}
            className="pointer-events-none absolute left-0 top-0 overflow-visible text-gold"
          >
            <motion.path
              d={`M ${mx} ${my} L ${size.w + 14} ${my} L ${size.w + PANEL_GAP - 4} ${panelTop + 10}`}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.7}
              strokeWidth={1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ pathLength: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.7, delay: reduced ? 0 : 0.12, ease: EASE_OUT }}
            />
          </motion.svg>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLine && (
          <motion.div
            key={`panel-${active.id}`}
            className="absolute z-20"
            style={{ left: size.w + PANEL_GAP, top: panelTop, width: PANEL_W }}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0, transition: { duration: reduced ? 0.15 : 0.8, delay: reduced ? 0 : 0.5, ease: EASE_OUT } }}
            exit={{ opacity: 0, x: -8, transition: { duration: 0.3 } }}
          >
            <AnnotationPanel
              annotation={active}
              index={activeIndex}
              total={annotations.length}
              onStep={onStep}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
