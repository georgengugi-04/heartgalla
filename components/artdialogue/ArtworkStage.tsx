"use client";
import { useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import Image from "next/image";
import type { DialogueWork } from "@/lib/collection";
import type { Annotation } from "@/lib/annotations";
import type { SessionState, SessionAction } from "./session";
import AnnotationLayer from "./AnnotationLayer";

const DWELL_MS = 650;
const DWELL_RADIUS_FRACTION = 0.2; // of the shorter side

export default function ArtworkStage({
  work,
  annotations,
  session,
  dispatch,
  hoverCapable,
  reducedMotion,
  imageError,
  onImageError,
  frameRef,
  frameSize,
}: {
  work: DialogueWork;
  annotations: Annotation[];
  session: SessionState;
  dispatch: React.Dispatch<SessionAction>;
  hoverCapable: boolean;
  reducedMotion: boolean;
  imageError: boolean;
  onImageError: () => void;
  frameRef: (node: HTMLDivElement | null) => void;
  frameSize: { width: number; height: number };
}) {
  const dwellTimer = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const localFrameEl = useRef<HTMLDivElement | null>(null);

  const leanX = useMotionValue(0);
  const leanY = useMotionValue(0);
  const scale = useMotionValue(1);
  const springX = useSpring(leanX, { stiffness: 220, damping: 22 });
  const springY = useSpring(leanY, { stiffness: 220, damping: 22 });
  const springScale = useSpring(scale, { stiffness: 220, damping: 22 });

  const setFrameRefs = useCallback(
    (node: HTMLDivElement | null) => {
      localFrameEl.current = node;
      frameRef(node);
    },
    [frameRef]
  );

  const ratio = work.width / work.height;

  function checkDwell() {
    const el = localFrameEl.current;
    const p = lastPointRef.current;
    if (!el || !p) return;
    const rect = el.getBoundingClientRect();
    const shorterSide = Math.min(rect.width, rect.height);
    for (const a of annotations) {
      if (session.noticed.includes(a.id)) continue;
      const dx = (a.x - p.x) * rect.width;
      const dy = (a.y - p.y) * rect.height;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= shorterSide * DWELL_RADIUS_FRACTION) {
        dispatch({ type: "notice", id: a.id });
      }
    }
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = localFrameEl.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    const fy = (e.clientY - rect.top) / rect.height;
    lastPointRef.current = { x: fx, y: fy };

    // spotlight — direct CSS var mutation, no React state
    el.style.setProperty("--spot-x", `${fx * 100}%`);
    el.style.setProperty("--spot-y", `${fy * 100}%`);
    el.style.setProperty("--spot-opacity", reducedMotion || !hoverCapable ? "0" : "1");

    if (!reducedMotion && hoverCapable) {
      // image leans a few px away from the cursor
      const dx = (fx - 0.5) * -14;
      const dy = (fy - 0.5) * -14;
      leanX.set(Math.max(-7, Math.min(7, dx)));
      leanY.set(Math.max(-7, Math.min(7, dy)));
      scale.set(1.03);
    }

    if (dwellTimer.current) window.clearTimeout(dwellTimer.current);
    if (hoverCapable && !reducedMotion) {
      dwellTimer.current = window.setTimeout(checkDwell, DWELL_MS);
    }
  }

  function handlePointerLeave() {
    const el = localFrameEl.current;
    if (dwellTimer.current) window.clearTimeout(dwellTimer.current);
    lastPointRef.current = null;
    leanX.set(0);
    leanY.set(0);
    scale.set(1);
    if (el) el.style.setProperty("--spot-opacity", "0");
  }

  return (
    <div style={{ containerType: "size", height: "min(74vh, 640px)" }} className="w-full">
      <div
        ref={setFrameRefs}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="eg-frame relative mx-auto bg-gallery-dark"
        style={{
          aspectRatio: ratio,
          width: `min(100cqw, calc(100cqh * ${ratio}))`,
          maxHeight: "100cqh",
          transformOrigin: "center center",
        }}
      >
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-center px-8">
            <p className="label-mono text-ivory/40">This artwork could not be displayed.</p>
          </div>
        ) : (
          <>
            <motion.div
              className="absolute inset-0"
              style={{ x: springX, y: springY, scale: springScale }}
            >
              <Image
                src={work.image}
                alt={work.title}
                fill
                sizes="(max-width: 1024px) 90vw, 60vw"
                className="object-contain"
                onError={onImageError}
              />
            </motion.div>
            {/* pool of light following the cursor */}
            <div
              className="eg-spot absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.10), transparent 55%)",
                opacity: "var(--spot-opacity, 0)",
                transition: "opacity 300ms ease",
              }}
            />
            <AnnotationLayer
              annotations={annotations}
              session={session}
              dispatch={dispatch}
              frameSize={frameSize}
              reducedMotion={reducedMotion}
            />
          </>
        )}
      </div>
    </div>
  );
}
