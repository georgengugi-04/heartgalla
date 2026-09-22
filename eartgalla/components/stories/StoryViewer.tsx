"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Story, StoryItem } from "@/lib/videoStories";
import { usePrefersReducedMotion } from "@/lib/hooks";

const HOLD_MS = 220;

/**
 * The full-screen story player: 9:16, progress segments across the top, tap right/left for next/previous, press
 * and hold to pause. Keys: ← → move, Space pauses, M mutes (only for clips that have sound), Esc closes.
 * Video items play muted and inline; image items get a slow push-in for 6 seconds. Under reduced motion nothing
 * starts by itself: clips wait for Play, and images wait for a tap to move on.
 */
export default function StoryViewer({
  stories,
  startIndex,
  onClose,
  onStoryChange,
}: {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onStoryChange: (slug: string) => void;
}) {
  const [si, setSi] = useState(startIndex);
  const story = stories[si];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // leave the page still while the story is open
  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = before;
    };
  }, []);

  const goStory = useCallback(
    (to: number) => {
      if (to < 0) return;
      if (to >= stories.length) return onClose();
      setSi(to);
      onStoryChange(stories[to].slug);
    },
    [stories, onClose, onStoryChange],
  );

  // Esc closes; Tab stays inside the player
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${story.title} — ${story.kicker}`}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0b0a09]"
    >
      {/* desktop: click the dark room around the player to leave */}
      <button type="button" aria-hidden="true" tabIndex={-1} onClick={onClose} className="absolute inset-0 hidden cursor-default md:block" />

      {stories.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goStory(si - 1)}
            disabled={si === 0}
            aria-label="Previous story"
            className="label-mono absolute left-6 z-10 hidden h-12 w-12 place-items-center rounded-full border border-ivory/25 text-ivory/80 transition-colors hover:border-ivory disabled:opacity-25 md:grid focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => goStory(si + 1)}
            disabled={si === stories.length - 1}
            aria-label="Next story"
            className="label-mono absolute right-6 z-10 hidden h-12 w-12 place-items-center rounded-full border border-ivory/25 text-ivory/80 transition-colors hover:border-ivory disabled:opacity-25 md:grid focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            →
          </button>
        </>
      )}

      <Player
        key={story.slug}
        story={story}
        closeRef={closeRef}
        onClose={onClose}
        onEnd={() => goStory(si + 1)}
        onBackPastStart={() => goStory(si - 1)}
      />
    </div>
  );
}

function Player({
  story,
  closeRef,
  onClose,
  onEnd,
  onBackPastStart,
}: {
  story: Story;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onEnd: () => void;
  onBackPastStart: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const [ii, setIi] = useState(0);
  const item: StoryItem = story.items[ii];
  const [progress, setProgress] = useState(0); // 0–1, for clips
  const [userPaused, setUserPaused] = useState(reduced); // reduced motion: nothing starts on its own
  const [held, setHeld] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const holdTimer = useRef<number | undefined>(undefined);
  const didHold = useRef(false);
  const paused = userPaused || held;

  const next = useCallback(() => {
    setProgress(0);
    if (ii >= story.items.length - 1) onEnd();
    else setIi(ii + 1);
  }, [ii, story.items.length, onEnd]);
  const prev = useCallback(() => {
    setProgress(0);
    if (ii === 0) onBackPastStart();
    else setIi(ii - 1);
  }, [ii, onBackPastStart]);

  // clips: play / pause / mute follow the state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    if (paused) v.pause();
    else v.play().catch(() => setUserPaused(true)); // autoplay refused → wait for a tap on Play
  }, [item.id, paused, muted]);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " " && !(e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement)) {
        e.preventDefault();
        setUserPaused((p) => !p);
      } else if ((e.key === "m" || e.key === "M") && item.type === "video" && item.hasAudio) setMuted((m) => !m);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, item]);

  // press and hold to pause; a quick tap moves on (right) or back (left)
  function pointerDown() {
    didHold.current = false;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => {
      didHold.current = true;
      setHeld(true);
    }, HOLD_MS);
  }
  function pointerUp(action: () => void) {
    window.clearTimeout(holdTimer.current);
    if (didHold.current) setHeld(false);
    else action();
  }
  function pointerAbort() {
    window.clearTimeout(holdTimer.current);
    setHeld(false);
  }

  const work = item.work;
  const facts = work ? [work.medium, work.year].filter((v): v is string | number => v !== null && String(v).trim() !== "") : [];
  const sizes = "(max-width: 768px) 100vw, 520px";

  return (
    <div className="relative z-10 h-full w-full overflow-hidden bg-black md:h-[min(92svh,900px)] md:w-auto md:aspect-[9/16] md:rounded-xl">
      {/* MEDIA */}
      {item.type === "video" ? (
        <video
          key={`media-${item.id}`} // distinct from the caption's key: siblings must never share one
          ref={videoRef}
          poster={item.poster}
          playsInline
          muted
          preload="auto"
          aria-label={item.alt}
          className="absolute inset-0 h-full w-full object-cover"
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
          onEnded={next}
        >
          {item.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
          {item.captions && <track kind="captions" src={item.captions} srcLang="en" label="English" default />}
        </video>
      ) : (
        <div key={`media-${item.id}`} className="absolute inset-0">
          <Image src={item.src} alt="" fill sizes={sizes} className="scale-110 object-cover opacity-45 blur-2xl" aria-hidden="true" />
          <div
            className="absolute inset-0"
            style={
              reduced
                ? undefined
                : { animation: `eg-kenburns ${item.durationMs}ms ease-out forwards`, animationPlayState: paused ? "paused" : "running" }
            }
          >
            <Image src={item.src} alt={item.alt} fill sizes={sizes} priority={false} className="object-contain p-6 pb-44 pt-24" />
          </div>
        </div>
      )}

      {/* TAP ZONES (behind the header and caption) */}
      <button
        type="button"
        aria-label="Previous"
        onPointerDown={pointerDown}
        onPointerUp={() => pointerUp(prev)}
        onPointerLeave={pointerAbort}
        onPointerCancel={pointerAbort}
        className="absolute inset-y-0 left-0 z-10 w-1/3 cursor-w-resize"
      />
      <button
        type="button"
        aria-label="Next"
        onPointerDown={pointerDown}
        onPointerUp={() => pointerUp(next)}
        onPointerLeave={pointerAbort}
        onPointerCancel={pointerAbort}
        className="absolute inset-y-0 right-0 z-10 w-2/3 cursor-e-resize"
      />

      {/* A big Play when something is paused on purpose (or the browser wouldn't autoplay) */}
      {userPaused && item.type === "video" && (
        <button
          type="button"
          onClick={() => setUserPaused(false)}
          aria-label="Play"
          className="absolute left-1/2 top-1/2 z-20 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-2xl text-ivory backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          <span aria-hidden="true">▶</span>
        </button>
      )}

      {/* PROGRESS + HEADER */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/60 to-transparent px-3 pb-8 pt-3">
        <div className="flex gap-1" role="progressbar" aria-label={`Item ${ii + 1} of ${story.items.length}`} aria-valuemin={1} aria-valuemax={story.items.length} aria-valuenow={ii + 1}>
          {story.items.map((it, i) => (
            <span key={it.id} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-ivory/30">
              <span
                key={i === ii ? `${item.id}-cur` : it.id}
                className="absolute inset-0 origin-left bg-ivory"
                style={
                  i < ii
                    ? { transform: "scaleX(1)" }
                    : i > ii
                      ? { transform: "scaleX(0)" }
                      : item.type === "video"
                        ? { transform: `scaleX(${progress})`, transition: "transform 250ms linear" }
                        : reduced
                          ? { transform: "scaleX(1)" }
                          : { animation: `eg-fill ${item.durationMs}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }
                }
                onAnimationEnd={i === ii && item.type === "image" ? next : undefined}
              />
            </span>
          ))}
        </div>
        <div className="pointer-events-auto mt-3 flex items-center gap-3">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-ivory/30">
            <Image src={story.cover} alt="" fill sizes="36px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-ivory">{story.title}</p>
            <p className="label-mono !text-[0.7rem] text-ivory/60">{story.kicker}</p>
          </div>
          {item.type === "video" && item.hasAudio && (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              aria-pressed={!muted}
              aria-label={muted ? "Turn sound on" : "Turn sound off"}
              className="grid h-11 w-11 place-items-center text-ivory/80 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-pressed={userPaused}
            aria-label={userPaused ? "Play" : "Pause"}
            className="label-mono grid h-11 w-11 place-items-center text-ivory/80 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            <span aria-hidden="true">{userPaused ? "▶" : "❚❚"}</span>
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close story"
            className="label-mono grid h-11 w-11 place-items-center text-ivory/80 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {/* CAPTION */}
      <motion.div
        key={`caption-${item.id}`}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pb-6 pt-28"
        initial={{ opacity: 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0.15 : 0.6, delay: reduced ? 0 : 0.2 }}
      >
        {work ? (
          <>
            <h3 className="font-editorial text-2xl leading-tight text-ivory">{work.title}</h3>
            <p className="mt-1 text-sm text-ivory/75">
              {work.artist}
              {facts.length > 0 && <span className="text-ivory/50"> · {facts.join(" · ")}</span>}
            </p>
          </>
        ) : (
          <h3 className="font-editorial text-2xl leading-tight text-ivory">{story.title}</h3>
        )}
        {item.caption && <p className="mt-2 max-w-sm text-sm text-ivory/70">{item.caption}</p>}
        {work && (
          <Link
            href={work.href}
            className="label-mono pointer-events-auto mt-3 inline-flex min-h-11 items-center border-b border-ivory/50 text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            View artwork →
          </Link>
        )}
      </motion.div>
    </div>
  );
}
