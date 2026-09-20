/**
 * The short message each page opens with. Edit the words here — nothing else needs to change.
 * `kicker` is the small line above (it's shown as "EARTGALLA · <KICKER>"); `message` is the line itself.
 *
 * Exact routes win; otherwise the first matching prefix is used (artwork, artist and article pages). A route
 * with no entry — and the homepage, which has its own longer intro — simply opens with no message.
 */
export type PageMessage = { kicker: string; message: string };

const EXACT: Record<string, PageMessage> = {
  "/gallery": { kicker: "The Gallery", message: "Slow down. Look properly." },
  "/artists": { kicker: "The Artists", message: "Behind every work, a hand." },
  "/gazette": { kicker: "The Gazette", message: "Stories worth staying for." },
  "/stories": { kicker: "Stories", message: "Art, in motion." },
  "/wear": { kicker: "Wear the Art", message: "Art, off the wall." },
  "/art-lab": { kicker: "Art Lab", message: "Where technology meets art." },
  "/about": { kicker: "About", message: "Kenyan art, told differently." },
  "/for-partners": { kicker: "For Partners", message: "Let’s build something together." },
  "/contact": { kicker: "Contact", message: "Say hello." },
  "/art-lab/art-alchemy": { kicker: "Art Alchemy", message: "Give it your full attention." },
  "/art-lab/living-canvas": { kicker: "The Living Canvas", message: "What happens when an artwork stops being still?" },
  "/art-lab/curate-your-wall": { kicker: "Curate Your Wall", message: "See them together first." },
};

const PREFIX: [string, PageMessage][] = [
  ["/art-lab/", { kicker: "Art Lab", message: "Where technology meets art." }],
  ["/gallery/", { kicker: "The Gallery", message: "Take a closer look." }],
  ["/artists/", { kicker: "The Artists", message: "Meet the artist." }],
  ["/gazette/", { kicker: "The Gazette", message: "Pull up a chair." }],
];

export function messageFor(pathname: string): PageMessage | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (EXACT[path]) return EXACT[path];
  return PREFIX.find(([p]) => path.startsWith(p))?.[1] ?? null;
}
