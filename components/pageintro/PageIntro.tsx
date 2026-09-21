"use client";
import { Fragment, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { lockScroll } from "@/lib/scrollLock";
import { messageFor, type PageMessage } from "./messages";
import { forgetDecision, markPageSeen, PAGE_INTRO_MS, shouldPlay } from "./pageIntroGuard";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const subscribeNone = () => () => {};

/**
 * The short opening message for each page: a dark curtain, the page's name, one line that rises into place,
 * then the curtain lifts. Around 3.5 seconds; a tap, click or key skips it. No sound (the homepage's long intro
 * is the only one with music). Per-page words live in messages.ts; how often it plays in pageIntroGuard.ts.
 * `key={pathname}` gives every page its own instance, so a page you navigate to gets its own message.
 */
// false until the app has finished its first render in the browser. The homepage's own (long) intro covers a fresh
// load or refresh, so Home's short message only plays for a visit made by clicking through the site.
let appHydrated = false;

export default function PageIntro() {
  const pathname = usePathname() ?? "/";
  const msg = messageFor(pathname);
  useEffect(() => {
    appHydrated = true;
  }, []);
  if (!msg || (pathname === "/" && !appHydrated)) return null;
  return <Curtain key={pathname} pathname={pathname} msg={msg} />;
}

function Curtain({ pathname, msg }: { pathname: string; msg: PageMessage }) {
  const reduced = usePrefersReducedMotion();
  // Server / hydrating render: show (the head guard hides it via CSS if it shouldn't play). Client: decide.
  const play = useSyncExternalStore(subscribeNone, () => shouldPlay(pathname), () => true);
  const [leaving, setLeaving] = useState(false);
  const finished = useRef(false);
  const release = useRef<(() => void) | null>(null);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    markPageSeen(pathname);
    release.current?.(); // scrolling is back the moment the curtain lifts
    setLeaving(true);
  }, [pathname]);

  useEffect(() => {
    if (!play) return;
    release.current = lockScroll();
    const timer = window.setTimeout(finish, reduced ? 1800 : PAGE_INTRO_MS);
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      release.current?.();
      forgetDecision(pathname); // leaving the page: the next opening decides afresh
    };
  }, [play, finish, reduced, pathname]);

  if (!play) return null;

  const words = msg.message.split(" ");
  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="page-intro"
          data-page-intro={pathname}
          role="region"
          aria-label={`${msg.kicker}: ${msg.message}`}
          onClick={finish}
          className="fixed inset-0 z-[190] flex cursor-pointer items-center justify-center overflow-hidden bg-[#0b0a09] px-6 text-ivory"
          exit={{
            clipPath: reduced ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
            opacity: reduced ? 0 : 1,
            transition: { duration: reduced ? 0.5 : 0.9, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 45% at 50% 55%, color-mix(in srgb, var(--color-gold) 13%, transparent), transparent 70%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <motion.p
              className="label-mono !text-[0.8rem] text-gold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              EARTGALLA · {msg.kicker}
            </motion.p>
            <p className="mt-6 font-editorial text-[clamp(2.1rem,6.2vw,5rem)] leading-[1.06] tracking-tight">
              <span className="sr-only">{msg.message}</span>
              <span aria-hidden="true">
                {words.map((w, i) => (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span className="inline-block overflow-hidden pb-[0.16em] -mb-[0.16em] align-bottom">
                      <motion.span
                        className="inline-block"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: "105%", filter: "blur(8px)" }}
                        animate={reduced ? { opacity: 1 } : { opacity: 1, y: "0%", filter: "blur(0px)" }}
                        transition={{ duration: reduced ? 0.5 : 0.85, delay: 0.35 + (reduced ? 0 : i * 0.09), ease: EASE }}
                      >
                        {w}
                      </motion.span>
                    </span>
                  </Fragment>
                ))}
              </span>
            </p>
            <motion.span
              aria-hidden="true"
              className="mx-auto mt-8 block h-px w-24 origin-center bg-gold/70"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduced ? 0.3 : 0.9, delay: 0.9 + (reduced ? 0 : words.length * 0.09), ease: EASE }}
            />
          </div>

          <motion.div
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-gold/70"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: (reduced ? 1800 : PAGE_INTRO_MS) / 1000, ease: "linear" }}
          />
          <p className="label-mono !text-[0.7rem] pointer-events-none absolute inset-x-0 bottom-6 text-center text-ivory/35">
            Tap to skip
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
