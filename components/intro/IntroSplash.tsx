"use client";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { introSeenBefore, markIntroSeen } from "./introGuard";
import { INTRO_SECONDS, startIntroMusic, type MusicHandle } from "./introAudio";
import { lockScroll } from "@/lib/scrollLock";

/**
 * The EARTGALLA intro: a ~20 second typographic sequence with music. How often it plays (every visit, every
 * load, or once ever) is INTRO_FREQUENCY in introGuard.ts (the default is every time).
 *
 * The copy (edit freely — each `Line` is one beat):
 *   A  Art does not need to be seen.
 *   B  They say practice makes perfect.  /  But no one is perfect.
 *   C  So why do we practice?
 *   D  Maybe it was never about perfection.  /  Maybe it's about being good — so you can still be great.
 *   E  Welcome to EARTGALLA · Kenyan Art · Global Stage
 *
 * Timeline: change SCENE_STARTS / END_AT to make it shorter or longer. Keep the chord changes in
 * introAudio.ts (CHORDS) in step with SCENE_STARTS if you do.
 */
const SCENE_STARTS = [0.4, 3.3, 6.9, 9.6, 14.0]; // seconds: when each scene takes over from the last
const END_AT = 18.9; //                             seconds: the intro opens onto the site by itself
const SKIP_VISIBLE_AFTER = 1.2; //                  seconds before "Skip" fades in

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Sound = "waiting" | "blocked" | "on" | "muted";

// ── tiny external-store helpers, so first render matches the server and state is read safely ──
const subscribeNone = () => () => {};
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

// ── typography building blocks ──
type Tok = { t: string; gold?: boolean; strikeAt?: number; brushAt?: number };

function Line({
  toks,
  delay = 0,
  className = "",
  reduced,
}: {
  toks: Tok[];
  delay?: number;
  className?: string;
  reduced: boolean;
}) {
  const plain = toks.map((k) => k.t).join(" ");
  const stagger = reduced ? 0 : Math.min(0.09, 0.9 / toks.length); // long lines move faster, so they finish in time
  return (
    <p className={`font-editorial ${className}`}>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true">
        {toks.map((k, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
          <span className="relative inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
            <motion.span
              className={`relative inline-block ${k.gold ? "text-gold" : ""}`}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: "105%", filter: "blur(8px)" }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, y: "0%", filter: "blur(0px)" }}
              transition={{ duration: reduced ? 0.6 : 0.8, delay: delay + i * stagger, ease: EASE }}
            >
              {k.t}
              {k.strikeAt !== undefined && !reduced && (
                <motion.span
                  className="absolute left-[-2%] right-[-2%] top-[56%] h-[0.055em] origin-left bg-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.55, delay: k.strikeAt, ease: EASE }}
                />
              )}
              {k.brushAt !== undefined && !reduced && (
                <svg
                  className="pointer-events-none absolute -bottom-[0.12em] left-0 h-[0.3em] w-full overflow-visible text-gold"
                  viewBox="0 0 260 24"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M3 15 C 40 5, 82 21, 130 11 S 214 6, 257 13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: k.brushAt, ease: EASE }}
                  />
                </svg>
              )}
            </motion.span>
          </span>
          </Fragment>
        ))}
      </span>
    </p>
  );
}

const words = (s: string, mark: Record<string, Partial<Tok>> = {}): Tok[] =>
  s.split(" ").map((t) => ({ t, ...mark[t] }));

const BIG = "text-[clamp(2.1rem,6.4vw,5.4rem)] leading-[1.08] tracking-tight text-ivory";
const SMALL = "text-[clamp(1.35rem,3.2vw,2.5rem)] leading-[1.2] tracking-tight text-ivory/60";

function SceneBody({ index, reduced, onEnter }: { index: number; reduced: boolean; onEnter: () => void }) {
  switch (index) {
    case 0: // A
      return <Line reduced={reduced} className={BIG} toks={words("Art does not need to be seen.")} />;
    case 1: // B
      return (
        <div className="space-y-5">
          <Line
            reduced={reduced}
            className={SMALL}
            toks={words("They say practice makes perfect.", { "perfect.": { strikeAt: 1.5 } })}
          />
          <Line reduced={reduced} delay={1.1} className={BIG} toks={words("But no one is perfect.")} />
        </div>
      );
    case 2: // C
      return <Line reduced={reduced} className={BIG} toks={words("So why do we practice?")} />;
    case 3: // D
      return (
        <div className="space-y-6">
          <Line reduced={reduced} className={SMALL} toks={words("Maybe it was never about perfection.")} />
          <Line
            reduced={reduced}
            delay={1.0}
            className={BIG}
            toks={words("Maybe it’s about being good\u00a0— so you can still be great.", {  // \u00a0 keeps the dash on the same line as "good"
              "great.": { gold: true, brushAt: 2.3 },
            })}
          />
        </div>
      );
    default: // E — the brand
      return (
        <div className="flex flex-col items-center gap-7 text-center">
          <motion.p
            className="label-mono !text-[0.85rem] tracking-[0.3em] text-ivory/70"
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            Welcome to
          </motion.p>
          <motion.h1
            className="font-editorial text-[clamp(2.4rem,9vw,7rem)] leading-none text-ivory"
            initial={reduced ? { opacity: 0 } : { opacity: 0, letterSpacing: "0.55em", filter: "blur(10px)" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, letterSpacing: "0.16em", filter: "blur(0px)" }}
            transition={{ duration: reduced ? 0.6 : 1.9, delay: 0.45, ease: EASE }}
          >
            EART<span className="text-ivory/60">GALLA</span>
          </motion.h1>
          <motion.p
            className="label-mono !text-[0.8rem] text-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.5 }}
          >
            Kenyan Art · Global Stage
          </motion.p>
          <motion.button
            type="button"
            onClick={onEnter}
            className="label-mono !text-[0.8rem] mt-2 inline-flex min-h-11 items-center border-b border-ivory/40 px-1 pb-0.5 text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.1 }}
          >
            Enter →
          </motion.button>
        </div>
      );
  }
}

/**
 * The long intro plays on a fresh load, a refresh, and — via IntroHost, per INTRO_FREQUENCY — a click back to
 * Home from inside the site. Whether it plays on a given render is decided by the <head> guard on first load
 * (introGuard.ts), or by IntroHost's own props for a later in-app visit to Home.
 *
 * `honourGuard` — true for the first render of the app, where the <head> guard has already decided (from the URL,
 * a returning visit, a bot…) and tagged <html>. False for a visit to Home made by clicking through the site: the
 * page is already loaded, so the decision is made here, from INTRO_FREQUENCY (and `playHere`: is this a page that
 * has the intro at all).
 */
export default function IntroSplash({ honourGuard = true, playHere = true }: { honourGuard?: boolean; playHere?: boolean }) {
  const reduced = usePrefersReducedMotion();
  // Server + hydrating render: assume "show". The <head> guard has already hidden it via CSS when it
  // shouldn't play, and this reads the same flag so the component then removes itself.
  const guarded = useSyncExternalStore(
    subscribeNone,
    () => document.documentElement.classList.contains("intro-skip"),
    () => false,
  );
  const skip = honourGuard ? guarded : !playHere || introSeenBefore();

  // A client-side visit to Home: the tag the guard left on <html> at load must not hide this new intro.
  useLayoutEffect(() => {
    if (!honourGuard) document.documentElement.classList.remove("intro-skip");
  }, [honourGuard]);

  const [scene, setScene] = useState(-1);
  const [leaving, setLeaving] = useState(false);
  const [sound, setSound] = useState<Sound>("waiting");
  const [showSkip, setShowSkip] = useState(false);

  const t0 = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const musicRef = useRef<MusicHandle | null>(null);
  const leavingRef = useRef(false);
  const release = useRef<(() => void) | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const finish = useCallback(() => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    markIntroSeen(); // remembered per INTRO_FREQUENCY (see introGuard.ts)
    release.current?.(); // give scrolling back the moment the curtain starts to lift
    musicRef.current?.stop(1.8);
    const ctx = ctxRef.current;
    if (ctx) window.setTimeout(() => void ctx.close().catch(() => {}), 2200);
    setLeaving(true);
  }, []);

  useEffect(() => {
    // `skip` is read from the server snapshot while hydrating, so also ask the page itself: for a returning
    // visitor the <head> guard has already tagged <html>, and there is nothing to start.
    if (skip || (honourGuard && document.documentElement.classList.contains("intro-skip"))) return;
    t0.current = performance.now();
    release.current = lockScroll(); // the page behind does not scroll during the intro

    // ── the timeline ──
    const timers: number[] = [];
    SCENE_STARTS.forEach((s, i) => timers.push(window.setTimeout(() => setScene(i), s * 1000)));
    timers.push(window.setTimeout(() => setShowSkip(true), SKIP_VISIBLE_AFTER * 1000));
    timers.push(window.setTimeout(finish, END_AT * 1000));

    // ── the music ──
    // Browsers keep sound locked until the visitor taps or presses a key, so we try once, and if it
    // stays locked, any first gesture unlocks it — the music then joins at the matching moment.
    const AudioCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    let ctx: AudioContext | null = null;
    const begin = () => {
      if (!ctx || musicRef.current || leavingRef.current) return;
      const elapsed = (performance.now() - t0.current) / 1000;
      if (elapsed > INTRO_SECONDS - 3) return; // too late to be worth starting
      musicRef.current = startIntroMusic(ctx, elapsed);
      setSound("on");
    };
    const unlock = () => {
      if (!ctx) return;
      void ctx.resume().then(begin, () => {});
    };
    if (AudioCtor) {
      ctx = new AudioCtor();
      ctxRef.current = ctx;
      ctx.onstatechange = () => {
        if (ctx?.state === "running") begin();
      };
      if (ctx.state === "running") timers.push(window.setTimeout(begin, 0));
      else void ctx.resume().catch(() => {});
      timers.push(
        window.setTimeout(() => {
          if (!musicRef.current) setSound("blocked");
        }, 900),
      );
    }
    const gestures = ["pointerdown", "keydown", "touchend"] as const;
    gestures.forEach((g) => window.addEventListener(g, unlock, { passive: true }));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    rootRef.current?.focus({ preventScroll: true }); // focus lands inside the intro; Tab reaches Sound / Skip

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      gestures.forEach((g) => window.removeEventListener(g, unlock));
      window.removeEventListener("keydown", onKey);
      release.current?.();
      musicRef.current?.stop(0.2);
      musicRef.current = null;
      if (ctx) void ctx.close().catch(() => {});
      ctxRef.current = null;
    };
  }, [skip, honourGuard, finish]);

  if (skip) return null;

  const toggleSound = () => {
    if (sound === "blocked" || sound === "waiting") {
      const ctx = ctxRef.current;
      if (ctx) void ctx.resume();
    } else if (musicRef.current) {
      const next = sound === "on";
      musicRef.current.setMuted(next);
      setSound(next ? "muted" : "on");
    }
  };

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="intro"
          ref={rootRef}
          tabIndex={-1}
          data-intro-root
          role="region"
          aria-label="Introduction to EARTGALLA"
          className="fixed inset-0 z-[200] flex cursor-default items-center outline-none justify-center overflow-hidden bg-[#0b0a09] px-6 text-ivory"
          exit={{
            clipPath: reduced ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
            opacity: reduced ? 0 : 1,
            transition: { duration: reduced ? 0.6 : 1.15, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* a slow, warm breathing of light behind the words */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 58%, color-mix(in srgb, var(--color-gold) 16%, transparent), transparent 70%)",
            }}
            animate={reduced ? { opacity: 0.7 } : { opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative mx-auto w-full max-w-5xl text-center">
            <AnimatePresence mode="wait">
              {scene >= 0 && (
                <motion.div
                  key={scene}
                  exit={{ opacity: 0, filter: reduced ? "none" : "blur(6px)", transition: { duration: 0.45 } }}
                >
                  <SceneBody index={scene} reduced={reduced} onEnter={finish} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* progress hairline: how long is left */}
          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gold/70"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: END_AT, ease: "linear" }}
          />

          {/* controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-5 md:px-8 md:pb-7">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={
                sound === "on" ? "Turn the music off" : sound === "muted" ? "Turn the music on" : "Play the music"
              }
              className="label-mono !text-[0.75rem] min-h-11 px-2 text-ivory/60 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span aria-hidden="true" className={sound === "blocked" ? "animate-pulse" : ""}>
                ♪{" "}
              </span>
              {sound === "on" ? "Sound on" : sound === "muted" ? "Sound off" : sound === "blocked" ? "Tap for sound" : "Sound"}
            </button>
            <button
              type="button"
              onClick={finish}
              className={`label-mono !text-[0.75rem] min-h-11 px-2 text-ivory/60 transition-all duration-700 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                showSkip || reduced ? "opacity-100" : "pointer-events-none opacity-0 focus:opacity-100"
              }`}
            >
              Skip intro →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
