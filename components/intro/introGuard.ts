/**
 * How often the intro plays. Change INTRO_FREQUENCY and nothing else needs touching.
 *
 *   "always"      — every time the site is LOADED on the homepage: a new visit or a refresh. Nothing is remembered.
 *                   (Clicking to Home from inside the site plays the short Home message instead.) The default.
 *   "session"     — once per browser tab/session (a refresh or moving around the site doesn't replay it).
 *   "first-visit" — once per browser, ever.
 */
export type IntroFrequency = "always" | "session" | "first-visit";
export const INTRO_FREQUENCY = "always" as IntroFrequency;

/** Shared by the inline guard script (layout) and IntroSplash, so the two can never drift apart. */
export const INTRO_STORAGE_KEY = "eartgalla:intro-seen:v1";

/** Only the homepage plays the intro; a visitor arriving on an artwork or artist link goes straight to it. */
export const INTRO_HOME_ONLY = true;

const STORE = INTRO_FREQUENCY === "session" ? "sessionStorage" : INTRO_FREQUENCY === "first-visit" ? "localStorage" : null;

/** Called when the intro has finished or been skipped. */
export function markIntroSeen() {
  if (!STORE) return;
  try {
    window[STORE].setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    /* storage blocked (private mode): the intro may play again, which is fine */
  }
}

/**
 * Runs in <head>, before first paint. If the visitor has already seen the intro (per INTRO_FREQUENCY), is a
 * bot / automated audit, or landed on a page other than the homepage, it tags <html> so CSS hides the
 * intro from the very first frame — nobody sees a flash of it. `?intro=1` replays it on any page.
 */
export const INTRO_GUARD_SCRIPT = `(function(){try{var d=document.documentElement;var force=/[?&]intro=1(&|$)/.test(location.search);var bot=/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent);var away=${INTRO_HOME_ONLY}&&location.pathname!=="/";var store=${JSON.stringify(
  STORE,
)};var seen=store?window[store].getItem(${JSON.stringify(INTRO_STORAGE_KEY)}):null;if(!force&&(bot||away||seen)){d.classList.add("intro-skip")}}catch(e){document.documentElement.classList.add("intro-skip")}})();`;
