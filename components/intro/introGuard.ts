/** Shared by the inline guard script (layout) and IntroSplash, so the two can never drift apart. */
export const INTRO_STORAGE_KEY = "eartgalla:intro-seen:v1";

/**
 * Runs in <head>, before first paint. If the visitor has already seen the intro (or is a bot / an
 * automated audit), it tags <html> so CSS hides the intro from the very first frame — returning
 * visitors never see a flash of it. Add `?intro=1` to any URL to replay it.
 */
export const INTRO_GUARD_SCRIPT = `(function(){try{var d=document.documentElement;var force=/[?&]intro=1(&|$)/.test(location.search);var bot=/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent);if(!force&&(bot||localStorage.getItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)}))){d.classList.add("intro-skip")}}catch(e){document.documentElement.classList.add("intro-skip")}})();`;
