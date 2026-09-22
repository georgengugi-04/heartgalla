"use client";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero({
  image,
  alt,
  credit,
}: {
  image: string;
  alt: string;
  credit?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const imgX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const imgY = useTransform(sy, [-0.5, 0.5], [-14, 14]);

  function onMove(e: React.PointerEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      className="relative h-screen w-full overflow-hidden flex items-end"
    >
      <motion.div
        style={{ x: imgX, y: imgY }}
        className="absolute inset-0 w-[106%] h-[106%] -m-[3%]"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src={image}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-charcoal/40" />

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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.7 }}
          className="flex items-center gap-6 mt-8"
        >
          <Link href="/gallery" data-cursor="view" className="label-mono border border-ivory/40 rounded-full px-6 py-3 hover:border-ivory transition-colors">
            Enter the Gallery
          </Link>
          {credit && <span className="label-mono text-ivory/40">{credit}</span>}
        </motion.div>
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
