/** Shared by the inline guard script (layout) and IntroSplash, so the two can never drift apart. */
export const INTRO_STORAGE_KEY = "eartgalla:intro-seen:v1";

/** Only the homepage plays the intro; a visitor arriving on an artwork or artist link goes straight to it. */
export const INTRO_HOME_ONLY = true;

/**
 * Runs in <head>, before first paint. If the visitor has already seen the intro, is a bot / automated
 * audit, or landed on a page other than the homepage, it tags <html> so CSS hides the intro from the very
 * first frame — nobody sees a flash of it. Add `?intro=1` to any URL to replay it there.
 */
export const INTRO_GUARD_SCRIPT = `(function(){try{var d=document.documentElement;var force=/[?&]intro=1(&|$)/.test(location.search);var bot=/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent);var away=${INTRO_HOME_ONLY}&&location.pathname!=="/";if(!force&&(bot||away||localStorage.getItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)}))){d.classList.add("intro-skip")}}catch(e){document.documentElement.classList.add("intro-skip")}})();`;
