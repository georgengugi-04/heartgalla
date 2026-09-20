/**
 * A counted page-scroll lock, so overlays that overlap (or that each start while another is settling) can never
 * leave the page locked: scrolling only comes back when the LAST lock is released.
 * Usage: const release = lockScroll(); … release();   (release is safe to call more than once)
 */
let locks = 0;

export function lockScroll(): () => void {
  locks += 1;
  document.documentElement.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.documentElement.style.overflow = "";
  };
}
