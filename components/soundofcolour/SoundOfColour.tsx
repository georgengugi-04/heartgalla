"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { artworks, artists } from "@/lib/data";
import { extractPalette, rgbToCss, RGB } from "@/lib/palette";
import { sonifyPalette, Sonification } from "@/lib/sonify";
import { useSoundOfColour } from "./useSoundOfColour";

const SLUGS = ["guardians-of-the-plain", "queen-of-hearts", "unbound", "crowned-in-red"];
const SELECTABLE = SLUGS.map((s) => artworks.find((a) => a.slug === s)).filter(
  (a): a is (typeof artworks)[number] => !!a
);

export default function SoundOfColour() {
  const [selected, setSelected] = useState(SELECTABLE[0]);
  const [palette, setPalette] = useState<RGB[]>([]);
  const [son, setSon] = useState<Sonification | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [audioError, setAudioError] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const engine = useSoundOfColour();
  const reduced = useReducedMotion();
  const artist = artists.find((a) => a.id === selected.artistId);

  useEffect(() => {
    if (!engine.playing) {
      // reset orbs to idle rather than leaving them frozen mid-pulse on stop
      orbRefs.current.forEach((el) => {
        if (!el) return;
        el.style.transform = "scale(1)";
        el.style.boxShadow = "0 0 10px 3.5px rgba(255,255,255,0.045)";
      });
      return;
    }
    let raf: number;
    function tick() {
      const active = engine.activeRef.current;
      const now = performance.now();
      orbRefs.current.forEach((el, i) => {
        if (!el) return;
        let scale = 1;
        let glow = 0.25;
        if (i === active.index) {
          const elapsed = now - active.triggeredAt;
          const t = Math.min(1, elapsed / active.durationMs);
          const env = Math.sin(Math.PI * Math.min(t, 1)) * (1 - t * 0.3);
          scale = 1 + env * (reduced ? 0.12 : 0.55);
          glow = 0.25 + env * 0.75;
        }
        el.style.transform = `scale(${scale})`;
        el.style.boxShadow = `0 0 ${glow * 40}px ${glow * 14}px rgba(255,255,255,${glow * 0.18})`;
      });
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [engine.activeRef, engine.playing, reduced]);

  function selectArtwork(a: (typeof SELECTABLE)[number]) {
    engine.stop();
    setSelected(a);
    setSon(null);
    setPalette([]);
  }

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const p = extractPalette(img, 5);
    setPalette(p);
    setSon(sonifyPalette(p));
  }

  function togglePlay() {
    if (engine.playing) {
      engine.stop();
      return;
    }
    if (!son) return;
    try {
      engine.start(son, volume);
      setAudioError(false);
    } catch {
      setAudioError(true);
    }
  }

  function handleVolume(v: number) {
    setVolume(v);
    engine.setVolume(v);
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-14 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 07</span>
          <span>·</span><span>AUDIO</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE SOUND OF COLOUR</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto">
          Every palette has a chord in it. This is one honest way of hearing it.
        </p>
        <p className="label-mono text-ivory/35 mt-4">🔊 THIS EXPERIMENT USES SOUND</p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-10 label-mono">
        {SELECTABLE.map((a, i) => (
          <button
            key={a.id}
            onClick={() => selectArtwork(a)}
            aria-label={`Listen to ${a.title}`}
            aria-current={selected.id === a.id}
            className={`px-2 py-1 border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
              selected.id === a.id ? "border-gold text-gold" : "border-transparent text-ivory/40 hover:text-ivory/70"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}
      </div>

      <div className="px-6 md:px-10 grid md:grid-cols-[1fr_280px] gap-8 md:gap-12">
        <div>
          <div className="relative aspect-[16/9] bg-black/30 overflow-hidden">
            <img
              ref={imgRef}
              key={selected.id}
              src={selected.image}
              alt={selected.title}
              crossOrigin="anonymous"
              onLoad={handleImgLoad}
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 flex items-center justify-center gap-4 md:gap-8">
              {(palette.length ? palette : Array(5).fill(null)).map((c, i) => (
                <div
                  key={i}
                  ref={(el) => { orbRefs.current[i] = el; }}
                  className="rounded-full w-10 h-10 md:w-14 md:h-14 transition-transform"
                  style={{ background: c ? rgbToCss(c as RGB) : "rgba(255,255,255,0.08)" }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 mt-6">
            <button
              onClick={togglePlay}
              disabled={!son}
              data-cursor="style"
              className="label-mono border border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              {engine.playing ? "■ STOP" : "▶ LISTEN"}
            </button>
            <label className="flex items-center gap-3 label-mono text-ivory/50">
              VOLUME
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => handleVolume(Number(e.target.value))}
                className="accent-gold w-28"
                aria-label="Volume"
              />
            </label>
          </div>
          {audioError && (
            <p className="label-mono text-ivory/40 mt-4">
              Sound couldn&apos;t start in this browser — the visuals above still respond to the palette.
            </p>
          )}

          {son && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-wrap gap-x-8 gap-y-2 mt-6 label-mono text-ivory/40"
            >
              <span>FORM <span className="text-ivory/70">{son.dna.form}</span></span>
              <span>TEXTURE <span className="text-ivory/70">{son.dna.texture}</span></span>
              <span>ENERGY <span className="text-ivory/70">{son.dna.energy}</span></span>
              <span>MODE <span className="text-ivory/70">{son.mode}</span></span>
            </motion.div>
          )}
        </div>

        <div className="pt-2">
          <p className="label-mono text-ivory/40 mb-2">TITLE</p>
          <p className="font-editorial text-2xl mb-6">{selected.title}</p>
          <p className="label-mono text-ivory/40 mb-2">ARTIST</p>
          <p className="text-ivory/80 mb-6">{artist?.name ?? "—"}</p>
          <p className="label-mono text-ivory/40 mb-2">YEAR</p>
          <p className="text-ivory/80 mb-6">{selected.year ?? "—"}</p>
          <p className="label-mono text-ivory/40 mb-2">MEDIUM</p>
          <p className="text-ivory/80">{selected.medium ?? "—"}</p>
        </div>
      </div>
    </section>
  );
}
