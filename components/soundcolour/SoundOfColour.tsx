"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { CollectionItem } from "@/lib/collection";
import { extractPalette, rgbToCss, type RGB } from "@/lib/palette";
import { ARTWORK_SIZES, EASE_OUT } from "@/lib/frame";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { CHORD_SECONDS, paletteToChord, playChord, type Playing } from "./soundEngine";

/**
 * EXPERIMENT 07 — THE SOUND OF COLOUR
 * A palette, translated into a chord. Nothing plays until you press Listen.
 */
export default function SoundOfColour({ works }: { works: CollectionItem[] }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [palette, setPalette] = useState<RGB[]>([]);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const ctxRef = useRef<AudioContext | null>(null);
  const voice = useRef<Playing | null>(null);
  const volumeRef = useRef(volume);
  useEffect(() => {
    volumeRef.current = volume;
    voice.current?.setVolume(volume);
  }, [volume]);

  const stop = useCallback(() => {
    voice.current?.stop();
    voice.current = null;
    setPlaying(false);
  }, []);

  // leave nothing playing / open when the visitor leaves the page
  useEffect(
    () => () => {
      voice.current?.stop();
      const ctx = ctxRef.current;
      if (ctx) void ctx.close().catch(() => {});
    },
    [],
  );

  const work = works[index] ?? null;
  const chord = paletteToChord(palette);

  async function listen() {
    if (playing) return stop();
    if (chord.length === 0) return;
    const AudioCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;
    const ctx = (ctxRef.current ??= new AudioCtor());
    await ctx.resume();
    voice.current = playChord(ctx, chord, volumeRef.current, () => {
      voice.current = null;
      setPlaying(false);
    });
    setPlaying(true);
  }

  function choose(i: number) {
    if (i === index) return;
    stop();
    setPalette([]);
    setIndex(i);
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-10 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 07</span>
          <span>·</span><span>AUDIO</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE SOUND OF COLOUR</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto">
          Every palette has a chord in it. This is one honest way of hearing it.
        </p>
        <p className="label-mono mt-6 text-gold">
          <span aria-hidden="true">🔊 </span>THIS EXPERIMENT USES SOUND
        </p>
      </div>

      {work === null ? (
        <p className="px-6 text-center font-editorial text-xl text-ivory/60">No artworks are ready to listen to yet.</p>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4 mb-10 label-mono">
            {works.map((w, i) => (
              <button
                key={w.id}
                onClick={() => choose(i)}
                aria-label={`Listen to ${w.title}`}
                aria-current={i === index}
                className={`px-2 py-1 border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                  i === index ? "border-gold text-gold" : "border-transparent text-ivory/40 hover:text-ivory/70"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>

          <div className="px-6 md:px-10 grid md:grid-cols-[1fr_280px] gap-8 md:gap-12">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-black/30">
                <Image
                  key={work.id}
                  src={work.image}
                  alt={`${work.title} by ${work.artist}`}
                  fill
                  sizes={ARTWORK_SIZES}
                  onLoad={(e) => setPalette(extractPalette(e.currentTarget, 5))}
                  className="object-contain"
                />
                {palette.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center label-mono text-ivory/30">LOADING —</div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mt-6">
                <button
                  onClick={listen}
                  disabled={chord.length === 0}
                  aria-pressed={playing}
                  data-cursor="style"
                  className="label-mono border border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  {playing ? "■ STOP" : "▶ LISTEN"}
                </button>
                <label className="flex items-center gap-3 label-mono text-ivory/50">
                  VOLUME
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Volume"
                    className="h-11 w-32 accent-[var(--color-gold)]"
                  />
                </label>
              </div>

              {/* the palette, and the note each colour became */}
              <ul className="flex flex-wrap items-start gap-5 mt-6" aria-label="The palette and its notes">
                {chord.map((n, i) => (
                  <li key={n.midi} className="flex flex-col items-center gap-2">
                    <motion.span
                      className="block w-9 h-9 rounded-full border border-ivory/20"
                      style={{ background: rgbToCss(n.rgb) }}
                      animate={playing && !reduced ? { y: [0, -6, 0], scale: [1, 1.12, 1] } : { y: 0, scale: 1 }}
                      transition={
                        playing && !reduced
                          ? { duration: 2.2, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }
                          : { duration: 0.4, ease: EASE_OUT }
                      }
                    />
                    <span className="label-mono !text-[0.7rem] text-ivory/50">{n.name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-md text-sm text-ivory/45">
                How it&apos;s heard: hue picks the note, lightness picks the octave, and saturation opens the sound. A
                choice, not a law — the same picture could be heard many other ways.
              </p>
              <p className="sr-only" aria-live="polite">
                {playing ? `Playing a chord of ${chord.map((n) => n.name).join(", ")} for ${CHORD_SECONDS} seconds.` : ""}
              </p>
            </div>

            <div className="pt-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={work.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="label-mono text-ivory/40 mb-2">TITLE</p>
                  <p className="font-editorial text-2xl mb-6">{work.title}</p>
                  <p className="label-mono text-ivory/40 mb-2">ARTIST</p>
                  <p className="text-ivory/80 mb-6">{work.artist}</p>
                  <p className="label-mono text-ivory/40 mb-2">YEAR</p>
                  <p className="text-ivory/80 mb-6">{work.year ?? "—"}</p>
                  <p className="label-mono text-ivory/40 mb-2">MEDIUM</p>
                  <p className="text-ivory/80">{work.medium ?? "—"}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
