"use client";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type HeroImage = { src: string; alt: string; hold?: boolean };

const NORMAL_MS = 900;   // quick beat between most photos
const HOLD_MS = 3600;    // the "pose" on the 5th / 10th

export default function Hero({ images }: { images: HeroImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const imgX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const imgY = useTransform(sy, [-0.5, 0.5], [-18, 18]);

  function onMove(e: React.PointerEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  // advance through the sequence — quick beats, with a longer hold on
  // whichever frames are flagged `hold: true` (the 5th and 10th, by default)
  useEffect(() => {
    if (images.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paused) return;

    const current = images[index];
    const duration = current.hold ? HOLD_MS : NORMAL_MS;
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
    }, duration);
    return () => window.clearTimeout(t);
  }, [index, images, paused]);

  const current = images[index];

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
      className="relative h-screen w-full overflow-hidden flex items-end"
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img
              src={current.src}
              alt={current.alt}
              style={{ x: imgX, y: imgY }}
              className="w-[108%] h-[108%] -m-[4%] object-cover"
              initial={{ scale: 1.06 }}
              animate={{ scale: current.hold ? 1.14 : 1.1 }}
              transition={{ duration: (current.hold ? HOLD_MS : NORMAL_MS) / 1000 + 0.7, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-charcoal/40" />

      {/* sequence progress dots */}
      {images.length > 1 && (
        <div className="absolute top-24 right-6 md:right-10 z-10 flex flex-col gap-1.5 items-end">
          {images.map((img, i) => (
            <span
              key={i}
              className="block rounded-full transition-all duration-500"
              style={{
                width: i === index ? (img.hold ? 8 : 5) : 4,
                height: i === index ? (img.hold ? 8 : 5) : 4,
                background: i === index ? "var(--color-gold)" : "rgba(244,239,230,0.3)",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 px-6 md:px-10 pb-14 md:pb-20 w-full">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="label-mono text-ivory/70 mb-4"
        >
          NAIROBI / KENYA — CONTEMPORARY ART
        </motion.p>

        <motion.h1
          className="font-editorial leading-[0.95] text-ivory"
          style={{ fontSize: "clamp(3rem, 11vw, 9rem)" }}
        >
          {"EARTGALLA".split("").map((ch, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.035, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="font-editorial italic text-2xl md:text-3xl text-ivory/85 mt-4 max-w-xl"
        >
          Kenyan art, told differently.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 right-6 md:right-10 label-mono text-ivory/50"
      >
        SCROLL ↓
      </motion.div>
    </section>
  );
}
