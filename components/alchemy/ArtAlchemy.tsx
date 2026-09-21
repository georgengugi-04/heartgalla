"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { artworks } from "@/lib/data";
import { extractPalette, artDNA, rgbToCss, RGB } from "@/lib/palette";
import { useAlchemyCanvas } from "./useAlchemyCanvas";

const SELECTABLE = artworks.filter((a) =>
  ["guardians-of-the-plain", "between-hours", "bloom-beneath-the-surface", "unbound", "the-royals"].includes(a.slug)
);

export default function ArtAlchemy() {
  const [selected, setSelected] = useState(SELECTABLE[0]);
  const [palette, setPalette] = useState<RGB[]>([]);
  const [distilled, setDistilled] = useState(false);
  const [distilling, setDistilling] = useState(false);
  const [traced, setTraced] = useState(false);
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState({ particles: 140, flow: 30, grain: 20, chaos: 15 });
  const [frozen, setFrozen] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const traceCanvasRef = useRef<HTMLCanvasElement>(null);

  const dna = useMemo(() => (palette.length ? artDNA(palette) : null), [palette]);

  const engine = useAlchemyCanvas(canvasRef, palette, settings, distilled);
  const traceEngine = useAlchemyCanvas(traceCanvasRef, palette, { ...settings, flow: 6, chaos: 4 }, true);

  // extract palette whenever selection changes
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const doExtract = () => setPalette(extractPalette(img, 5));
    if (img.complete) doExtract();
    else img.onload = doExtract;
  }, [selected]);

  useEffect(() => { engine.setFrozen(frozen); }, [frozen, engine]);

  function handleDistill() {
    if (distilling || distilled) return;
    setDistilling(true);
    window.setTimeout(() => {
      setDistilling(false);
      setDistilled(true);
    }, 1100);
  }

  function handleSave() {
    const canvas = traceCanvasRef.current;
    if (!canvas) return;
    try {
      setSavedImage(canvas.toDataURL("image/png"));
    } catch {
      setSavedImage(null);
    }
  }

  async function handleShare() {
    if (!savedImage) return;
    try {
      const blob = await (await fetch(savedImage)).blob();
      const file = new File([blob], "art-alchemy.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "EARTGALLA Art Alchemy" });
        return;
      }
    } catch {
      // fall through to clipboard fallback
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Sharing isn't available on this browser — link copied instead.");
    } catch {
      alert("Sharing isn't available on this browser.");
    }
  }

  function resetAll() {
    setDistilled(false);
    setTraced(false);
    setSavedImage(null);
    setSettings({ particles: 140, flow: 30, grain: 20, chaos: 15 });
    setFrozen(false);
  }

  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      {/* 1 — HERO */}
      <div className="px-6 md:px-10 mb-14">
        <div className="flex flex-wrap items-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 09</span>
          <span>·</span><span>FLAGSHIP</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">ART ALCHEMY</h2>
        <p className="text-ivory/60 max-w-lg">Turn a painting into a living visual instrument.</p>
        <p className="label-mono text-gold mt-6">SELECT AN ARTWORK ↓</p>
      </div>

      {/* 2 — ARTWORK SELECTOR */}
      <div className="flex gap-4 overflow-x-auto px-6 md:px-10 pb-6 mb-10 [scrollbar-width:none]">
        {SELECTABLE.map((a, i) => (
          <button
            key={a.id}
            onClick={() => { setSelected(a); setDistilled(false); setTraced(false); }}
            data-cursor="view"
            className="relative flex-shrink-0 w-40 md:w-48 group text-left"
          >
            <div className={`relative aspect-[4/5] overflow-hidden rounded-sm border transition-colors ${selected.id === a.id ? "border-gold" : "border-ivory/10"}`}>
              <img src={a.image} alt={a.title} className={`w-full h-full object-cover transition-all duration-500 ${selected.id === a.id ? "" : "opacity-50 grayscale-[0.3]"}`} />
            </div>
            <p className="label-mono text-ivory/40 mt-2">{String(i + 1).padStart(2, "0")}</p>
            <p className="font-editorial text-sm mt-0.5">{a.title}</p>
          </button>
        ))}
      </div>

      {/* 3 — MAIN ALCHEMY EXPERIENCE */}
      <div className="px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {/* LEFT: artwork */}
          <div className="relative aspect-[4/5] md:aspect-auto overflow-hidden rounded-sm bg-black/40">
            <motion.img
              ref={imgRef}
              key={selected.id}
              src={selected.image}
              alt={selected.title}
              crossOrigin="anonymous"
              animate={{ opacity: distilled ? 0.35 : 1, filter: distilled ? "saturate(0.6) blur(1px)" : "saturate(1) blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover"
            />
            <AnimatePresence>
              {distilling && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {palette.map((c, i) => (
                    <motion.span
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{ background: rgbToCss(c), left: `${20 + i * 15}%`, top: `${30 + (i % 3) * 20}%` }}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], x: ["0%", "180%"], y: ["0%", "-40%"], scale: [0.5, 1.2, 0.3] }}
                      transition={{ duration: 1.1, ease: "easeInOut" }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute bottom-3 left-3 label-mono text-ivory/70 bg-charcoal/60 backdrop-blur-sm px-2 py-1 rounded">
              {selected.title}
            </div>
          </div>

          {/* RIGHT: generative canvas */}
          <div
            className="relative aspect-[4/5] md:aspect-auto overflow-hidden rounded-sm bg-black touch-none"
            onPointerMove={(e) => engine.onPointerMove(e.clientX, e.clientY)}
            onPointerDown={(e) => { engine.onPointerDown(); engine.burst(e.clientX, e.clientY); }}
            onPointerUp={engine.onPointerUp}
            onPointerLeave={engine.onPointerUp}
          >
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {!distilled && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6 text-center">
                <p className="label-mono text-ivory/30">GENERATIVE CANVAS — AWAITING DISTILLATION</p>
              </div>
            )}
          </div>
        </div>

        {/* 5 — DISTILL BUTTON */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleDistill}
            disabled={distilling || distilled}
            data-cursor="style"
            className="label-mono border border-gold text-gold rounded-full px-8 py-4 hover:bg-gold hover:text-charcoal transition-colors disabled:opacity-50"
          >
            {distilled ? "DISTILLED ✓" : distilling ? "DISTILLING…" : "DISTILL THIS ARTWORK →"}
          </button>
        </div>
      </div>

      {/* 6 — ART DNA PANEL */}
      {dna && (
        <div className="px-6 md:px-10 mt-20">
          <p className="label-mono text-ivory/50 mb-2">ART DNA</p>
          <p className="text-ivory/40 text-sm mb-8 max-w-md">An artistic interpretation of the palette — not a scientific measurement.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="label-mono text-ivory/40 mb-3">PALETTE</p>
              <div className="flex gap-2">
                {palette.map((c, i) => (
                  <motion.span
                    key={i}
                    className="w-8 h-8 rounded-full border border-ivory/20"
                    style={{ background: rgbToCss(c) }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.08, type: "spring" }}
                  />
                ))}
              </div>
            </div>
            <div><p className="label-mono text-ivory/40 mb-3">FORM</p><p className="font-editorial text-xl">{dna.form}</p></div>
            <div><p className="label-mono text-ivory/40 mb-3">TEXTURE</p><p className="font-editorial text-xl">{dna.texture}</p></div>
            <div><p className="label-mono text-ivory/40 mb-3">ENERGY</p><p className="font-editorial text-xl">{dna.energy}</p></div>
          </div>
        </div>
      )}

      {/* 7 — EXPERIMENT CONTROLS */}
      <div className="px-6 md:px-10 mt-16">
        <div className="border border-ivory/10 rounded-lg p-6 md:p-8 flex flex-col md:flex-row gap-8 md:items-end">
          {(["particles", "flow", "grain", "chaos"] as const).map((key) => (
            <div key={key} className="flex-1 min-w-[120px]">
              <p className="label-mono text-ivory/50 mb-2">{key.toUpperCase()}</p>
              <input
                type="range"
                min={key === "particles" ? 30 : 0}
                max={key === "particles" ? 320 : 100}
                value={settings[key]}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: Number(e.target.value) }))}
                className="w-full accent-gold"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={engine.regenerate} data-cursor="style" className="label-mono border border-ivory/30 rounded-full px-4 py-2">REGENERATE</button>
            <button onClick={() => setFrozen((f) => !f)} data-cursor="style" className="label-mono border border-ivory/30 rounded-full px-4 py-2">{frozen ? "UNFREEZE" : "FREEZE"}</button>
            <button onClick={resetAll} data-cursor="style" className="label-mono border border-ivory/30 rounded-full px-4 py-2">RESET</button>
          </div>
        </div>
      </div>

      {/* 8 — LEAVE YOUR TRACE */}
      <div className="px-6 md:px-10 mt-20">
        <p className="label-mono text-ivory/50 mb-2">LEAVE YOUR TRACE</p>
        <p className="text-ivory/60 max-w-md mb-6">Every interaction changes the composition. Draw across the canvas below.</p>
        <div
          className="relative aspect-[16/9] overflow-hidden rounded-sm bg-black touch-none"
          onPointerMove={(e) => { traceEngine.onPointerMove(e.clientX, e.clientY); if (e.buttons === 1) { setTraced(true); traceEngine.burst(e.clientX, e.clientY); } }}
          onPointerDown={(e) => { traceEngine.onPointerDown(); setTraced(true); traceEngine.burst(e.clientX, e.clientY); }}
          onPointerUp={traceEngine.onPointerUp}
          onPointerLeave={traceEngine.onPointerUp}
        >
          <canvas ref={traceCanvasRef} className="absolute inset-0 w-full h-full" />
        </div>
        <AnimatePresence>
          {traced && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center gap-5 flex-wrap">
              <p className="label-mono text-gold">YOU LEFT SOMETHING BEHIND.</p>
              <button onClick={handleSave} data-cursor="style" className="label-mono border border-gold text-gold rounded-full px-5 py-2.5 hover:bg-gold hover:text-charcoal transition-colors">
                SAVE EXPERIMENT
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 9 — EXPERIMENT RESULT */}
      <AnimatePresence>
        {savedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-charcoal/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setSavedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1a17] border border-gold/40 rounded-lg overflow-hidden max-w-sm w-full"
            >
              <img src={savedImage} alt="Your Art Alchemy experiment" className="w-full aspect-[16/9] object-cover" />
              <div className="p-6">
                <p className="label-mono text-ivory/40">EARTGALLA ART LAB</p>
                <p className="font-editorial text-xl mt-1 mb-4">ART ALCHEMY / 004</p>
                <p className="label-mono text-ivory/40">DERIVED FROM</p>
                <p className="mb-3">{selected.title}</p>
                <p className="label-mono text-ivory/40">GENERATED</p>
                <p className="mb-6">{dateStr}</p>
                <div className="flex gap-3 flex-wrap">
                  <a href={savedImage} download="eartgalla-art-alchemy.png" className="label-mono border border-gold text-gold rounded-full px-4 py-2">DOWNLOAD</a>
                  <button onClick={handleShare} className="label-mono border border-ivory/30 rounded-full px-4 py-2">SHARE</button>
                  <button onClick={() => { setSavedImage(null); resetAll(); }} className="label-mono border border-ivory/30 rounded-full px-4 py-2">TRY AGAIN</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
