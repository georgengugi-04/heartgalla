/**
 * How often a page's opening message plays. Change PAGE_INTRO_FREQUENCY and nothing else needs touching.
 *
 *   "always"  — every time a page is opened: a new visit, a refresh, and every click through to a page.
 *               Nothing is remembered. The default.
 *   "session" — each page's message plays once per visit (per browser tab); a page already seen goes straight in.
 *   "off"     — no page messages.
 */
export type PageIntroFrequency = "off" | "always" | "session";
export const PAGE_INTRO_FREQUENCY = "always" as PageIntroFrequency;

/** How long the message stays before the curtain lifts (milliseconds). */
export const PAGE_INTRO_MS = 2600;

const KEY = "eartgalla:page-intro:v1:";
const forced = () => /[?&]intro=1(&|$)/.test(window.location.search); // ?intro=1 is the big intro's replay flag

function seen(pathname: string): boolean {
  if (PAGE_INTRO_FREQUENCY !== "session") return false;
  try {
    return window.sessionStorage.getItem(KEY + pathname) !== null;
  } catch {
    return false;
  }
}

export function markPageSeen(pathname: string) {
  if (PAGE_INTRO_FREQUENCY !== "session") return;
  try {
    window.sessionStorage.setItem(KEY + pathname, "1");
  } catch {
    /* storage blocked: the message may play again, which is fine */
  }
}

// The decision is made once per opening of a page and remembered until that page is left, so finishing the
// message (which marks it seen) can't re-decide mid-animation and cut the curtain's exit short.
const decided = new Map<string, boolean>();
export function shouldPlay(pathname: string): boolean {
  const known = decided.get(pathname);
  if (known !== undefined) return known;
  const v = PAGE_INTRO_FREQUENCY !== "off" && !forced() && !seen(pathname);
  decided.set(pathname, v);
  return v;
}
export const forgetDecision = (pathname: string) => decided.delete(pathname);

/**
 * Runs in <head> before first paint. If this page's message shouldn't play (already seen, a bot / audit, the
 * homepage, or the big intro is being forced), it adds a CSS rule that hides that page's message from the very
 * first frame, so nobody sees a flash of it. Only affects the page that was loaded.
 */
export const PAGE_INTRO_GUARD_SCRIPT = `(function(){try{var p=location.pathname;var freq=${JSON.stringify(
  PAGE_INTRO_FREQUENCY,
)};var skip=freq==="off"||/[?&]intro=1(&|$)/.test(location.search)||/bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent)||(freq==="session"&&sessionStorage.getItem(${JSON.stringify(
  KEY,
)}+p)!==null);if(skip){var s=document.createElement("style");s.textContent='[data-page-intro="'+p.replace(/["\\\\]/g,"")+'"]{display:none!important}';document.head.appendChild(s)}}catch(e){}})();`;
