# PROMPT — Add "The Art Dialogue" to the live EARTGALLA Art Lab

> Paste everything below the line into your coding assistant (Claude Code, Cursor, etc.), run it from the root of your **current** EARTGALLA repo.
> Also attach `eartgalla-nextjs-collection-and-art-dialogue.zip` as **reference material** (see "Reference implementation"). Do not unzip it over your project.

---

You are working on the existing EARTGALLA website (live at https://eartgalla.vercel.app, Art Lab at /art-lab). EARTGALLA is a Kenyan art platform for discovering, documenting and presenting Kenyan art.

## 0. Read this first
- `AGENTS.md` / `CLAUDE.md` in this repo may say this Next.js version differs from what you know. Read the relevant guides in `node_modules/next/dist/docs/` before writing code. (In Next 16, the `<Image priority>` prop is deprecated — use `loading="eager"` / `fetchPriority="high"` only if you truly need it. This feature doesn't.)
- This is **not** a redesign. Add **one** new experiment to the Art Lab. Do not touch the homepage, the other experiments, or the existing routes/URLs.

## 1. What to build
**THE ART DIALOGUE — "Look closer."** An Art Lab experiment about the relationship between a viewer and a single painting. The viewer doesn't just look at an artwork; they learn to look closer.

It must feel like a quiet, dark exhibition room, not a demo: **contemporary art + editorial design + African cultural identity + creative technology.** The technology should disappear behind the artwork. It must not resemble the existing experiments: no world map, no decomposition/recomposition, no particles, no 3D, no carousel, no parallax gallery.

**Numbering:** the live Art Lab currently ends at Experiment 09 (Art Alchemy). Verify this in the code, then give this experiment the **next free number** (expected: **10**). Do not renumber anything. Use `{N}` below for that number.

## 2. Audit before coding (report findings briefly)
Inspect and reuse, don't replace: framework/router, how `/art-lab` composes its experiments (sections on one page vs sub-routes — **follow whichever exists**), the experiment index cards, the header format inside each experiment (e.g. `EXPERIMENT 07·AUDIO·EARTGALLA ART LAB`), fonts, colour tokens, existing animation library (expected: `motion/react` — do **not** add another), the artwork data source (`lib/data.ts` or equivalent) and its types, the custom cursor (`data-cursor`), reduced-motion handling, and how images are served.

## 3. The experience — LOOK → NOTICE → EXPLORE → UNDERSTAND → REVEAL → RETURN
Start almost empty: header (`EXPERIMENT {N}` label, **THE ART DIALOGUE**, *Look closer.*), then one large artwork in a dark room. Show no artwork information yet.

1. **LOOK** — pointer over the artwork gives a very slight local response: the image leans a few px away from the cursor (spring-smoothed, ±7px, scale ≈1.03, fixed transform-origin) and a faint pool of light follows the cursor (update CSS variables directly on pointermove; no per-move React state). Must not feel like an e-commerce magnifier.
2. **NOTICE** — when the cursor *rests* (~650 ms) within ~20% of the artwork's shorter side of an annotation point, a small marker appears there (ring + dot, one soft ping). Only found markers are shown.
3. **EXPLORE** — clicking a marker opens an exhibition-catalogue entry, not a tooltip: hairline, small-caps kind label (COLOUR / TEXTURE / FORM / COMPOSITION / DETAIL), one observation in editorial serif, `02 / 04`, and ← → ✕. Sequence: soft dark focus around the point → thin gold line draws from marker to entry (SVG `pathLength`) → entry fades in. Restrained motion.
4. **UNDERSTAND/REVEAL** — after 3 details have been opened (or after ≥1 via a quiet "Reveal the work →" button) reveal the work's own information below the artwork: artist (linked to the artist page), title, and only the fields that exist (medium, year, dimensions, collection). Show `description` under the label **"Described by EARTGALLA"** and the artist's confirmed bio under **"The story — About {artist}"**. Keep observation and artist's story visibly separate. Provide "View artwork →" (existing artwork detail route — don't create new routes).
5. **RETURN** — "← Return to artwork" reverses the layers: reveal retracts first, then markers disappear (staggered), then the artwork is back to its clean state. Scroll the artwork back into view (smooth unless reduced motion).

**Artwork picker:** a quiet row of numerals (01…) top-right to switch artworks. Label them `Artwork 3 of 7` — don't show titles before the reveal.
**Back link:** an understated `← ART LAB` at the top left of the section, anchored to the top of the Art Lab page. No big "BACK" button.

### Desktop (≥1024px) vs. phone/tablet
- **Desktop:** artwork left/centre; opening a detail slides the artwork+entry group left only as much as needed (translate `x`, not layout) and shows the leader line + catalogue entry to the right of the artwork, positioned near the marker (clamped inside the artwork's height).
- **Below 1024px:** do **not** force lines into a small viewport. Markers become numbered dots (44×44px hit area), the entry appears **below** the artwork, and a **"Look closer" list** ("Detail 01 / 02 / 03 …", full-width rows ≥48px tall) is the primary way in. Copy adapts: "Tap a detail to look closer."
- **Everywhere:** a row of "Detail 01…" buttons must exist as the non-hover, keyboard and touch route to every annotation. Nothing important may be hover-only. Show a hint line: "Rest the cursor on the work, or choose a detail." (hover-capable) / "Tap a detail to look closer." (touch).

## 4. CONTENT RULES — critical
- **Never fabricate**: artists, titles, years, mediums, prices, stories, locations, exhibition history, or artist intentions. No "the artist intended/wanted/symbolises…".
- Annotations describe **only what can be seen** ("A dominant red field occupies the upper right…"). Where a material is only *probably* visible, hedge it ("looks to be bare denim"). Don't name a medium the data doesn't state.
- **Never annotate an image you haven't actually opened and looked at.** For every artwork: open the image, write 3–4 annotations (mix of the five kinds), give each `x`,`y` as fractions (0–1) of the displayed image.
- **Verify coordinates**: render each image with numbered circles at your `x,y` and look at the result; fix any marker that isn't on what its text describes.
- Some existing artworks have titles that don't match their image (e.g. on the live site "Mountain Solitude" and "The Spearman" look swapped, and "Village Under the Mountain" is a photo of a person). **Exclude any artwork whose title doesn't match its image, or that is a photo rather than an artwork**, and list what you excluded. Do not "fix" titles yourself.
- A missing field is omitted, never rendered as `undefined`/`—`.
- Artwork `description` values written by the site are "EARTGALLA's voice", not the artist's words — keep the "Described by EARTGALLA" label.

## 5. Data architecture — one source of truth
- Do **not** duplicate artwork data. Add a new `lib/annotations.ts` keyed by artwork **slug**:
  ```ts
  export type AnnotationKind = "Colour" | "Texture" | "Form" | "Composition" | "Detail";
  export type Annotation = { id: string; kind: AnnotationKind; x: number; y: number; text: string };
  export const annotationsBySlug: Record<string, Annotation[]> = {
    "between-hours": [
      { id: "moon-and-sun", kind: "Detail", x: 0.19, y: 0.17,
        text: "A thin white crescent moon sits in the upper left of the night half. Its counterpart, a round orange sun with visible brush texture, sits in the upper right." },
      // …
    ],
  };
  export const getAnnotations = (slug: string) => annotationsBySlug[slug] ?? [];
  ```
  Put the rules from §4 in a comment at the top of the file.
- Add a **server-side** selector (e.g. `lib/collection.ts`) `getDialogueWorks()` that maps existing artworks that have annotations into a serialisable object: id, slug, href (existing detail route), title, artist name, artist href, `artistBio` (**only if the artist's status is confirmed**), image, `width`/`height`, medium, year, dimensions, collection, description. Read image dimensions at build time from the file header (small `fs` helper for JPEG/PNG; no new dependency) so the artwork can be framed at its exact aspect ratio with **no cropping and no layout shift**.
- Pass that to a client component as props. Client code must never import the `fs`-using modules (use `import type` only).

## 6. Engineering requirements (lessons already learned — follow them)
- **Component structure** (adapt names to repo conventions; existing folders are lowercase like `awb/`, `alchemy/`): `components/artdialogue/{ArtDialogue, ArtworkStage, AnnotationLayer, DialogueControls, ArtworkStory}.tsx` + a small `session.ts` reducer (`noticed[]`, `opened[]`, `activeId`, `revealed`; actions notice/open/close/reveal/hideReveal/reset).
- **Artwork frame:** make the stage a size container (`container-type: size`) and size the frame with `aspect-ratio` and `width: min(100cqw, calc(100cqh * ratio))`. Image is `next/image` with `fill`, `object-contain`, one shared `sizes` string, and `onError` → graceful "This artwork could not be displayed." fallback (no markers when the image failed).
- **Hydration safety:** motion's `useReducedMotion()` is already `true` on the client's first render, which causes a **React #418 hydration mismatch** whenever it changes the rendered DOM. Use a `useMediaQuery` built on `useSyncExternalStore` (server snapshot `false`) for `prefers-reduced-motion`, `(min-width: 1024px)` and `(hover: hover) and (pointer: fine)`.
- **Measuring:** a callback-ref `useElementSize` hook (one `ResizeObserver`, disconnected on cleanup) for frame/stage px sizes; keep the dwell timer's inputs in a ref so it never reads stale state; clear all timers/listeners on unmount.
- **Performance:** animate `transform`/`opacity`/`clip-path`/SVG `pathLength` only — never width/height/top/left. No canvas, WebGL, particles or animation loops; no per-pointer-move React renders. Lazy-load images (this section is far below the fold).
- **Accessibility:** every marker/detail is a real `<button>` with an `aria-label` (`Detail 02, Colour`) and `aria-pressed`; visible focus outlines (match the site's gold outline); Escape closes the open entry; one visually hidden `aria-live="polite"` region announces the active observation (the visible entry itself is not a live region); targets ≥44px; contrast checked on dark.
- **Reduced motion:** no cursor-follow, no spotlight, no ping, no scale/drift; crossfades ≤0.25s; content fully usable.
- **React lint rules** (eslint-config-next 16): no `setState` inside effects, no reading refs during render.

## 7. Wiring into the Art Lab
- Add the section to `/art-lab` **after the last existing experiment** with `id="experiment-{N}"` and `scroll-mt-16`, following the existing page pattern (a section on the page, or a route if that's how the others work — never both).
- Add an index card in the existing experiment list, matching the existing card markup exactly: status **LIVE**, title **THE ART DIALOGUE**, description **"Look closer."** Make it link to the section by anchor (only change existing cards if they need to be links for this to work, and do so minimally).
- Section header: same format as its siblings: `EXPERIMENT {N}·{ONE-WORD CATEGORY}·EARTGALLA ART LAB` (suggested category: `LOOKING`), then `THE ART DIALOGUE`, then *Look closer.*
- Visual language: existing tokens only. Add at most one new token: a slightly deeper charcoal (e.g. `--color-gallery-dark: #0b0a09`) for the "room". Editorial serif for observations/titles, small monospace caps for labels (≥13px for anything a visitor must read), warm ivory text, existing gold as the single accent. No glassmorphism, neon, gradients-everywhere, glow or floating cards.
- Do not add dependencies.

## 8. Reference implementation (if attached)
`eartgalla-nextjs-collection-and-art-dialogue.zip` contains a working version, built against an **older copy of the site** (its Art Lab numbering is 04–07 and it lacks Collector's Eye, Sound of Colour and Curate Your Wall). **Port, don't overwrite.** Take from it: `components/artdialogue/*`, `lib/annotations.ts` (29 verified annotations for 7 works), `lib/frame.ts`, `lib/hooks.ts`, `lib/image-size.ts`, and the `getDialogueWorks` logic from `lib/collection.ts`. **Do not copy over** `app/art-lab/page.tsx`, `app/page.tsx`, `app/globals.css`, `lib/data.ts` or `package-lock.json` — merge only the small additions this feature needs (the one CSS token + a few utilities/keyframes: `.eg-meta`, `eg-ping`, `.eg-frame .eg-spot`, guarded for reduced motion). Change every "Experiment 07" reference in the ported code to `{N}`.

**Optional, ask me before doing it:** the zip also contains 7 new works by Lenny Kariuki (`public/art/lenny/{between-hours,denim-tide,kitchen-brigade,lovers-moon,slice-of-trouble,still-becoming,the-scavenger}.jpg` and data entries a12–a18 with proposed titles/descriptions). If I say yes, add them to the live data without id collisions and with `collection: null`, `year: null`. If not, write annotations for works already in the live data instead (subject to §4).

## 9. Validation — do not stop until all of this is true
1. `npm run lint` → 0 errors (report any warnings that are new). `npx tsc --noEmit` passes. `npm run build` passes with no route/hydration/image errors.
2. Run the built site in a browser and confirm: the index card scrolls to the section; resting the cursor on a point reveals its marker; clicking opens the entry with the line; the "Detail" buttons work by keyboard alone (Tab → Enter → Escape); 3 opened details trigger the reveal; missing fields don't render; Return leaves 0 markers and no reveal; switching artworks resets state.
3. Check widths 360, 375, 390, 412, 430, 768, 1280, 1440: no horizontal overflow, no clipping, markers ≥44px, text readable, no nested scrolling.
4. Check with `prefers-reduced-motion: reduce` **and** without: no console errors, **no hydration errors** on `/art-lab` in either mode, nothing moves under reduced motion.
5. Existing experiments and every existing route/URL still work; nothing was renumbered or restyled.

## 10. Report back
Give me: files added/changed; the experiment number you used; artworks you annotated and any you excluded (and why); every place you deviated from this prompt (and why); anything you could not verify. Do not claim something was tested unless you actually ran it.
