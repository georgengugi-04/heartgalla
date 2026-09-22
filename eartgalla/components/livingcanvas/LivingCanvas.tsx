"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { artworks, artists } from "@/lib/data";
import { extractPalette, rgbToCss, RGB } from "@/lib/palette";
import { useLivingCanvas, Stage } from "./useLivingCanvas";

const SELECTABLE_SLUGS = ["happiness", "the-royals", "bloom-beneath-the-surface", "tiger-in-frost"];
const SELECTABLE = SELECTABLE_SLUGS
  .map((slug) => artworks.find((a) => a.slug === slug))
  .filter((a): a is (typeof artworks)[number] => !!a);

const STAGE_LABELS: { stage: Stage; label: string }[] = [
  { stage: "colour", label: "COLOUR" },
  { stage: "texture", label: "TEXTURE" },
  { stage: "form", label: "FORM" },
];

export default function LivingCanvas() {
  const [selected, setSelected] = useState(SELECTABLE[0]);
  const [stage, setStageState] = useState<Stage>("whole");
  const [deconstructed, setDeconstructed] = useState(false);
  const [palette, setPalette] = useState<RGB[]>([]);
  const [imgLoaded, setImgLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useLivingCanvas(canvasRef, imgRef);
  const reduced = useReducedMotion();

  const artist = artists.find((a) => a.id === selected.artistId);

  useEffect(() => {
    engine.setStage(stage);
  }, [stage, engine]);

  function selectArtwork(a: (typeof SELECTABLE)[number]) {
    setSelected(a);
    setDeconstructed(false);
    setStageState("whole");
    setImgLoaded(false);
  }

  function handleImgLoad() {
    setImgLoaded(true);
    engine.buildCells();
    const img = imgRef.current;
    if (img) setPalette(extractPalette(img, 5));
  }

  function handleDeconstruct() {
    setDeconstructed(true);
    setStageState("colour");
  }

  function handleRecompose() {
    setStageState("whole");
    window.setTimeout(() => setDeconstructed(false), 900);
  }

  function onPointerMove(e: React.PointerEvent) {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    engine.setPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-14 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 06</span>
          <span>·</span><span>INTERACTIVE</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE LIVING CANVAS</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-md mx-auto">
          What happens when an artwork stops being still?
        </p>
      </div>

      {/* minimal artwork selector */}
      <div className="flex items-center justify-center gap-4 mb-10 label-mono">
        {SELECTABLE.map((a, i) => (
          <button
            key={a.id}
            onClick={() => selectArtwork(a)}
            aria-label={`View ${a.title}`}
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
          <div
            className="relative aspect-[4/5] md:aspect-[4/5] bg-black/30 overflow-hidden touch-none"
            onPointerMove={onPointerMove}
          >
            {/* hidden source image — the canvas engine samples and draws from this */}
            <img
              ref={imgRef}
              key={selected.id}
              src={selected.image}
              alt={selected.title}
              crossOrigin="anonymous"
              onLoad={handleImgLoad}
              className="absolute opacity-0 pointer-events-none w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center label-mono text-ivory/30">
                LOADING —
              </div>
            )}
          </div>

          {/* primary controls */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {!deconstructed ? (
              <button
                onClick={handleDeconstruct}
                data-cursor="style"
                className="label-mono border border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-charcoal transition-colors"
              >
                DECONSTRUCT →
              </button>
            ) : (
              <>
                {STAGE_LABELS.map((s) => (
                  <button
                    key={s.stage}
                    onClick={() => setStageState(s.stage)}
                    aria-pressed={stage === s.stage}
                    className={`label-mono border rounded-full px-5 py-2.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                      stage === s.stage ? "border-gold text-gold bg-gold/10" : "border-ivory/25 text-ivory/60 hover:text-ivory"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                <button
                  onClick={handleRecompose}
                  data-cursor="style"
                  className="label-mono border border-ivory/40 rounded-full px-6 py-2.5 hover:border-ivory transition-colors"
                >
                  ← RECOMPOSE
                </button>
              </>
            )}
          </div>

          {/* colour palette, shown during the COLOUR stage */}
          <AnimatePresence>
            {deconstructed && stage === "colour" && palette.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 mt-6"
              >
                <span className="label-mono text-ivory/40">PALETTE</span>
                {palette.map((c, i) => (
                  <motion.span
                    key={i}
                    className="w-7 h-7 rounded-full border border-ivory/20"
                    style={{ background: rgbToCss(c) }}
                    animate={reduced ? {} : { y: [0, -4, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* metadata panel */}
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
