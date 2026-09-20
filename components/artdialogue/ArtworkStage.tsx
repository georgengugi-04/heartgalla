"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ARTWORK_SIZES, EASE_OUT, frameStyle } from "@/lib/frame";
import { useElementSize } from "@/lib/hooks";
import AnnotationLayer, { AnnotationPanel, PANEL_SPACE } from "./AnnotationLayer";
import type { DialogueWork, Session } from "./session";

/** How close (as a fraction of the artwork's shorter side) a resting cursor must be to notice a detail. */
const NOTICE_RADIUS = 0.2;
/** How long the cursor must rest before something is noticed. */
const DWELL_MS = 650;

/**
 * The artwork, alone in a dark room.
 *
 * LOOK   — a very slight local response: the work leans a few pixels away from the cursor and a faint
 *          pool of light follows it. Nothing else on screen.
 * NOTICE — rest the cursor near something and a small marker appears there (touch and keyboard
 *          reach the same markers from the detail list below the work).
 */
export default function ArtworkStage({
  work,
  session,
  wide,
  reduced,
  onNotice,
  onOpen,
  onStep,
  onClose,
}: {
  work: DialogueWork;
  session: Session;
  wide: boolean;
  reduced: boolean;
  onNotice: (id: string) => void;
  onOpen: (id: string) => void;
  onStep: (dir: 1 | -1) => void;
  onClose: () => void;
}) {
  const [stageRef, stageSize] = useElementSize<HTMLDivElement>();
  const [frameRef, frameSize] = useElementSize<HTMLDivElement>();
  const [failed, setFailed] = useState(false);

  // cursor response (spring-smoothed motion values: no React re-render per pointer move)
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 55, damping: 22 });
  const sy = useSpring(py, { stiffness: 55, damping: 22 });
  const imgX = useTransform(sx, (v) => v * -7);
  const imgY = useTransform(sy, (v) => v * -7);
  const scale = useSpring(1, { stiffness: 45, damping: 20 });

  // dwell detection reads the latest values through a ref so its timer never sees stale state
  const dwell = useRef<number | undefined>(undefined);
  const latest = useRef({ work, noticed: session.noticed, size: frameSize, onNotice });
  useEffect(() => {
    latest.current = { work, noticed: session.noticed, size: frameSize, onNotice };
  });
  useEffect(() => () => window.clearTimeout(dwell.current), []);

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType === "touch" || reduced) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    px.set(nx - 0.5);
    py.set(ny - 0.5);
    scale.set(1.03);
    el.style.setProperty("--mx", `${nx * 100}%`);
    el.style.setProperty("--my", `${ny * 100}%`);
    el.dataset.hover = "1";

    window.clearTimeout(dwell.current);
    dwell.current = window.setTimeout(() => {
      const { work: w, noticed, size, onNotice: notice } = latest.current;
      if (size.w === 0 || size.h === 0) return;
      const shortSide = Math.min(size.w, size.h);
      let best: { id: string; d: number } | null = null;
      for (const a of w.annotations) {
        if (noticed.includes(a.id)) continue;
        const d = Math.hypot((a.x - nx) * size.w, (a.y - ny) * size.h) / shortSide;
        if (d < NOTICE_RADIUS && (!best || d < best.d)) best = { id: a.id, d };
      }
      if (best) notice(best.id);
    }, DWELL_MS);
  }

  function handleLeave(e: React.PointerEvent<HTMLDivElement>) {
    window.clearTimeout(dwell.current);
    e.currentTarget.dataset.hover = "0";
    px.set(0);
    py.set(0);
    scale.set(1);
  }

  const active = work.annotations.find((a) => a.id === session.activeId) ?? null;
  const activeIndex = active ? work.annotations.indexOf(active) : -1;

  // wide screens: when a catalogue entry opens beside the work, slide the pair left just enough to fit
  const shiftX =
    wide && active && frameSize.w && stageSize.w
      ? -Math.max(0, frameSize.w / 2 + PANEL_SPACE + 24 - stageSize.w / 2)
      : 0;

  return (
    <div>
      <div
        ref={stageRef}
        className="relative mx-auto h-[min(62svh,560px)] w-full lg:h-[min(68svh,700px)]"
        style={{ containerType: "size" }}
      >
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ x: shiftX }}
          transition={{ duration: reduced ? 0.15 : 0.9, ease: EASE_OUT }}
        >
          <div
            ref={frameRef}
            data-hover="0"
            onPointerMove={handleMove}
            onPointerLeave={handleLeave}
            className="eg-frame relative shadow-[0_60px_140px_-40px_rgba(0,0,0,0.95)]"
            style={frameStyle(work.width, work.height, {
              maxWidth: wide ? `calc(100cqw - ${PANEL_SPACE + 48}px)` : "100cqw",
            })}
          >
            {failed ? (
              <div className="absolute inset-0 flex items-center justify-center border border-ivory/15 p-6 text-center">
                <p className="eg-meta text-ivory/50">This artwork could not be displayed.</p>
              </div>
            ) : (
              <motion.div className="absolute inset-0" style={reduced ? undefined : { x: imgX, y: imgY, scale }}>
                <Image
                  src={work.image}
                  alt={`${work.title} by ${work.artist}`}
                  fill
                  sizes={ARTWORK_SIZES}
                  draggable={false}
                  onError={() => setFailed(true)}
                  className="object-contain"
                />
              </motion.div>
            )}

            <div aria-hidden="true" className="eg-spot pointer-events-none absolute inset-0" />

            {!failed && (
              <AnnotationLayer
                annotations={work.annotations}
                noticedIds={session.noticed}
                activeId={session.activeId}
                size={frameSize}
                wide={wide}
                reduced={reduced}
                onOpen={onOpen}
                onStep={onStep}
                onClose={onClose}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* small screens: the catalogue entry sits under the work instead of beside it */}
      {!wide && (
        <div className="mx-auto mt-2 max-w-xl px-1">
          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.id}
                className="pt-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { duration: reduced ? 0.15 : 0.6, ease: EASE_OUT } }}
                exit={{ opacity: 0, y: -6, transition: { duration: 0.25 } }}
              >
                <AnnotationPanel
                  annotation={active}
                  index={activeIndex}
                  total={work.annotations.length}
                  onStep={onStep}
                  onClose={onClose}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
