# EARTGALLA — Next.js Rebuild

Real rebuild on Next.js 16 (App Router) + Tailwind v4 + Motion. This replaces the old
static HTML/CSS/JS site with an actual React architecture, per the brief.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build — verified passing, 43 static pages
```

Needs normal internet access to fetch Fraunces/Manrope from Google Fonts at build time
(this sandbox blocks that domain, so it was build-tested with fonts temporarily stubbed —
your machine and any real host like Vercel won't have that restriction).

Deploy target: Vercel is the path of least resistance for Next.js App Router — connect
the repo, no config needed.

## What's real vs. placeholder — read this before a demo

**Real:**
- All images are your actual uploaded artwork/photos, organized under `/public/art/`
- Lenny Kariuki's work is attributed to Lenny based on what you told me earlier
- The hand-painted playing card set is a genuine, distinct body of work

**Placeholder — needs your input before this goes in front of anyone:**
- **John Njoroge** and **Alvin Mwangi**: I split the unattributed images across these
  two names as a *curatorial guess*, per your instruction to decide now rather than wait.
  I did **not** invent biographies for them (`bio: null` in `lib/data.ts`) — the UI shows
  "Biography coming soon" until you provide real text. Reassign the image lists in
  `lib/data.ts` if the split is wrong.
- **All prices are `null`** → the site displays "Price on request" everywhere. The brief
  explicitly said not to invent prices, so none are set. Fill in real ones in
  `lib/data.ts` per artwork once confirmed.
- **No stats, founding year, or history claims anywhere** — the old site's "48 artists /
  240+ artworks / 5 years" was fabricated by me in an earlier session and is not carried
  over here, per your instruction.
- **Contact form** (`/contact`) is UI-only — not wired to a backend. Needs a Next.js API
  route or a service like Resend/Formspree before it can actually send anything.
- **Wear the Art** (`/wear`) is an interaction/architecture preview only — clearly labeled
  "NOT AI-GENERATED — CONCEPT ONLY" in the UI. No image-generation API is connected.
- **Art Lab** (`/art-lab`) entries are honestly labeled by status (In Progress / Planned /
  Research) — nothing claims to be shipped that isn't.
- **Social links** point to `instagram.com/eartgalla` and `tiktok.com/@eartgalla` (confirmed
  by you). No website URL or WhatsApp Channel link yet — footer omits WhatsApp until you
  have the real invite link.

## Structure

```
app/                  routes (App Router)
  page.tsx            homepage
  gallery/             gallery index + /gallery/[slug] detail
  artists/             roster index + /artists/[slug] profile
  gazette/             editorial index + /gazette/[slug] story
  wear/                Wear the Art interaction preview
  art-lab/             status-labeled experiments
  about/, for-partners/, contact/
components/           Nav, Footer, Cursor, Hero, EnterGallery, ArtistRow, GalleryGrid, GazetteTeaser
lib/data.ts           the entire content model — artists, artworks, collections, stories
lib/types.ts          TypeScript types for the above
public/art/           all real images, organized by artist / process shots
```

## What's built vs. what's still a stub (mapped to the brief's phases)

- **Phase 1** (audit, content cleanup, artist cleanup, design system): done
- **Phase 2** (homepage, nav, gallery, artwork detail, artists): done
- **Phase 3** (gazette, about, contact): done, collections filter lives inside `/gallery`
  rather than as a separate route — same data, one less page to maintain
- **Phase 4** (motion, cursor, page transitions): kinetic hero type, scroll reveals,
  custom cursor, and hover interactions are in; true shared-layout page transitions
  (artwork expanding into its detail page) are not yet wired — `layout` animation on the
  gallery grid is scaffolded in `GalleryGrid.tsx` as a starting point
- **Phase 5** (Wear the Art): interaction UI built, no real garment mockup/AI generation
- **Phase 6** (Art Lab): status page built, no generative/AR experiments implemented
- **Phase 7** (`/for-partners`): built, numbers deliberately omitted
- **Phase 8** (performance/accessibility/SEO/mobile polish, testing, deployment): not yet
  done — this build has not been audited for Lighthouse/a11y/mobile edge cases

## Update — Round 2 (logo, playful Art Lab, Gazette content)

- **Official logo is live.** The uploaded gold monogram lockup is now the real logo:
  `components/Nav.tsx` uses the trimmed icon (`public/brand/icon-only.png`), the footer
  uses the icon+wordmark lockup (`public/brand/icon-wordmark.png`), and `app/icon.png`
  is the auto-detected Next.js favicon, generated from the same mark.
- **Storyboard image cropped and reused site-wide.** The 8-panel brand storyboard you
  uploaded is split into `public/brand/marquee/*` (full cells, captions intact — used as
  the homepage's "How We Got Here" marquee) and `public/brand/clean/*` (caption/bleed
  trimmed — used as hero banners on `/about`, `/wear`, and `/artists`).
- **Art Lab is now the playground.** `/art-lab` has a real interactive flip-card grid
  (`components/PlayCards.tsx`, ported from the original static-site deck) — click any
  card, it flips with a spring animation. Two looping marquees (forward/reverse) of the
  live artwork sit below it.
- **`components/Marquee.tsx`** is a generic infinite-scroll strip, reused on the homepage
  and Art Lab — drop any image array into it.
- **Gazette now has a real Lenny Kariuki feature.** Based on what you told me directly —
  Nairobi-based, trained as an architect at the Technical University of Kenya, works in
  paint and pencil, current collection made within the past year — I wrote a full story
  (`lib/data.ts` → `stories[0]`, rendered at `/gazette/lenny-kariuki-from-blueprint-to-canvas`)
  and updated his `bio`/`statement` fields with the same facts. It's the featured story on
  `/gazette` and leads the homepage teaser, per "focus mainly on Lenny."
- **John and Alvin got lighter, honest treatment** — John's story reflects what you said
  (technical, nature-driven, works across materials); Alvin's stays intentionally thin
  ("a painter... his fuller profile is still being written") since that's all that was
  confirmed. No invented specifics for either.
- One important note I did **not** invent: the artist statement for Lenny is written in
  third person, not as a quoted first-person line — I avoided putting fabricated words
  directly in his mouth. If you get an actual quote from him, swap it into
  `artists[0].statement` in `lib/data.ts`.

Build re-verified clean after all of the above: 47 static pages, zero errors.


## Known limitations of this pass

- No image optimization via `next/image` yet — using plain `<img>` for speed of
  building this out; swapping in `next/image` is a mechanical follow-up
- No reduced-motion guards on the Motion-driven components yet beyond the CSS-level
  `prefers-reduced-motion` block in `globals.css` (the marquee animation does respect it)
- No OG image generation per-artwork/story yet (Section 22)
- No structured data (JSON-LD) yet (Section 28)

## Update — Round 3 (Lenny's real portrait, Art Alchemy)

- **Lenny Kariuki's real photo is now live.** Saved to `public/art/lenny/portrait.jpg`,
  wired into `lib/data.ts` (`artists[0].portrait`), and shown as a circular avatar on his
  `/artists/lenny-kariuki` page. John and Alvin still have no portrait on file
  (`portrait: null`) — same treatment when you send theirs.
- **New flagship experiment: Art Alchemy** (`/art-lab`), built exactly to spec:
  - `components/alchemy/ArtAlchemy.tsx` — hero, horizontal artwork selector (Mountain
    Solitude, Guardians of the Plain, Crowned in Red, Herd at Dawn, Dusk Reflections),
    split-screen (artwork left / generative canvas right), the Distill transition, an
    Art DNA panel, Particles/Flow/Grain/Chaos sliders with Regenerate/Freeze/Reset, a
    "Leave Your Trace" drawable canvas, and a save/download/share result card.
  - `lib/palette.ts` — extracts a real 5-color palette by sampling the selected artwork
    on an offscreen canvas (no external API, no invented colors). `artDNA()` turns that
    palette into Form/Texture/Energy labels via simple brightness/saturation heuristics —
    explicitly labeled in the UI as an artistic interpretation, not a measurement, per
    the brief.
  - `components/alchemy/useAlchemyCanvas.ts` — the particle engine: a flow field driven
    by the sliders, pointer/touch attraction, click/tap bursts, `requestAnimationFrame`
    with proper cleanup on unmount, and a single static render (no loop) under
    `prefers-reduced-motion`.
  - Existing experiments untouched: the card-flip deck and both marquees are still
    exactly where they were, just repositioned below Art Alchemy since the brief calls
    it the visual centerpiece.
  - Save downloads a real PNG via `canvas.toDataURL()`; Share uses the native Web Share
    API when available (with the exported image as a file) and falls back to copying
    the page link with a plain message if not — no fake share sheet.
- Full production build re-verified clean after this round too.

## Update — Round 4 (hero image sequence)

- **`components/Hero.tsx` reworked.** Was a single static background image; now takes an
  `images: {src, alt, hold?}[]` array and auto-advances through it — quick ~0.9s beats
  between frames, crossfading with a slow Ken Burns zoom. Any frame flagged `hold: true`
  pauses for ~3.6s before continuing — used on frame 5 (John Njoroge's "The Royals") and
  frame 10 (Lenny's "Dusk Reflections") in the current homepage sequence
  (`app/page.tsx` → `heroSequence`), matching what you asked for.
- Small gold progress dots track position in the sequence, top-right of the hero.
- Pauses on pointer-down (so someone using the cursor-parallax doesn't fight the
  autoplay) and respects `prefers-reduced-motion` (shows the first frame only, no cycling).
- The sequence currently spans all three artists plus two cards, so the hero now
  represents the whole roster rather than just Lenny's work — reorder/swap images in
  `heroSequence` any time.

## Update — Round 5 (production polish pass)

A full audit-and-fix pass, not a redesign. Nothing removed, nothing restyled for its own sake.

- **Hero reverted to a single cinematic image.** The auto-advancing sequence from the
  previous round is gone — back to one strong artwork ("The Spearman") with the same
  subtle cursor-parallax, plus a proper "Enter the Gallery" CTA and credit line. This
  round's brief was explicit that a rotating slideshow undercuts the editorial feel, and
  I agree it's the better call for a hero.
- **Real per-page SEO.** Every artwork, artist, and Gazette story page now has its own
  `generateMetadata` — title, description, Open Graph, and Twitter card, all pulled from
  actual content (no invented copy). Previously all ~30 of these pages shared one generic
  title. Added `metadataBase`, `robots.ts`, and `sitemap.ts` (auto-generates entries for
  every artwork/artist/story).
- **Branded 404** (`app/not-found.tsx`) instead of the framework default.
- **Missing artist portraits now show an intentional placeholder** — the EARTGALLA
  monogram in a circle — instead of just omitting the avatar. No fabricated photos.
- **Navigation fixes:** active-page highlighting (`aria-current`), Escape closes the
  mobile menu, focus-visible rings on every interactive nav element, animated mobile
  menu (was an instant show/hide).
- **Two real bugs fixed:** two internal links (`/gallery`, `/contact`) were plain `<a>`
  tags instead of `<Link>`, causing full page reloads instead of client-side navigation.
- **`next/image` adopted for the highest-impact images** — hero, homepage artwork wall,
  "Enter the Gallery" feature images, and the artwork detail page (main image + related
  works). These are the LCP-critical and highest-traffic images; the rest of the site
  still uses plain `<img>` (tracked below).
- **Lint is genuinely clean now.** Ran `eslint` across the whole `app/`, `components/`,
  `lib/` for the first time (previously only checked files as I touched them) and fixed
  everything real: unescaped apostrophes in About/For Partners/Not Found, `any` types in
  `EnterGallery.tsx` (now uses the real `Artwork`/`Artist` types), and a React Compiler
  diagnostic in the Art Alchemy particle engine — fixed by moving the click/tap "burst"
  from a directly-mutating callback into a queued request the animation loop applies
  (same visual result, compiler-clean architecture). **0 errors, 22 warnings** (all
  `<img>` optimization suggestions, tracked below) — down from 13 errors.

## Known remaining gap

- `next/image` migration isn't finished — GalleryGrid's masonry layout, artist teaser
  rows, Marquee, PlayCards, and the Art Alchemy canvas source images still use plain
  `<img>`. Finishing this requires storing real width/height per image in `lib/data.ts`
  (masonry needs intrinsic aspect ratio to avoid layout shift) — a mechanical but
  non-trivial follow-up, not done in this pass to stay within scope.

## Update — Round 6 (Art Without Borders + mobile nav fix)

- **New experiment: Art Without Borders**, live on `/art-lab`. Concept: a radial map
  centered on Kenya — the only location the real data actually supports (every artist
  is Nairobi-based, no other location exists anywhere in the project). Rather than
  invent international locations to fill it out, the three outer rings (East Africa /
  Africa / World) render as visible-but-inactive tiers, with a caption explaining more
  get mapped as the archive grows. Clicking the Kenya point reveals a staggered,
  floating collage of real artwork from all three artists (interleaved, not grouped by
  artist), each one opening into a large exhibition-style view with Discover-mode
  arrow-key/click navigation between pieces.
  - `lib/geography.ts` — the data layer. `locations[]` currently has exactly one entry
    (Nairobi) with real `artistIds`; counts shown on hover (stories/artists/works) are
    computed live from `lib/data.ts`, never hardcoded. Add a location with real
    `artistIds` here to light up a new point later — the component needs no changes.
  - `components/awb/RadialMap.tsx`, `ArchiveGallery.tsx`, `ExhibitionView.tsx` — map,
    collage reveal, and detail view. Keyboard support throughout (Enter/Space on the
    map point, arrow keys + Escape in the exhibition view), `aria-label`s, and a
    `useReducedMotion()`-aware fallback: the floating collage becomes a plain grid and
    the pulsing map ring goes static when reduced motion is on.
- **Fixed: mobile nav bar visibility.** Root cause was `mix-blend-difference` on the
  whole header — it only stays legible over consistently mid-toned backgrounds, and
  turns illegible over a photo's bright areas or the light Gazette section (worse on
  mobile, where hero crops expose different parts of the same image under the bar).
  Replaced with a standard frosted bar (`bg-charcoal/70 backdrop-blur-md` + hairline
  border) that's reliably readable regardless of what's behind it, on every page and
  breakpoint. The mobile menu button also got a visible pill outline so it reads as a
  tappable control, not just floating text.
- Full production build and lint re-verified clean after both changes: 49 static pages,
  0 errors, 24 warnings (all the same tracked `<img>` → `next/image` items as before).

## Update — Round 7 (The Living Canvas)

- **New experiment: The Living Canvas**, live on `/art-lab`. An artwork stops being a
  static image — cursor movement gives it a subtle parallax before you touch anything,
  and DECONSTRUCT separates it into a grid of cells you can view three ways (COLOUR,
  TEXTURE, FORM), then RECOMPOSE brings it back together.
  - Built on Canvas 2D (Option C from the brief — canvas cells derived from real image
    pixels), not WebGL and not one DOM node per fragment. A single `<canvas>`, ~200–320
    cells depending on viewport (fewer on mobile for performance), each cell knowing its
    true position in the whole image plus a sampled average colour.
  - **COLOUR** — cells become flat colour swatches at their own average colour, with
    small gaps opening between them; a 5-swatch dominant palette (the same real
    extraction method as Art Alchemy) floats gently below.
  - **TEXTURE** — cells stay image-based but desaturate, gain contrast, and drift with a
    slow per-cell jitter — a grain/fragment feel from the real image, not a generated
    texture.
  - **FORM** — cells enlarge and overlap with a blur filter, and roughly a third are
    hidden, so the painting's big shapes read through rather than its detail.
  - **RECOMPOSE** reverses all of it with the same eased interpolation, ending back at
    the untouched original — the "signature moment" the brief asked for.
  - Artwork selector is four real catalogued pieces (`Happiness`, `The Royals`, `Bloom
    Beneath the Surface`, `Tiger in Frost`) spanning all three artists, numbered 01–04
    per the brief's "minimal selector" instruction rather than a grid.
  - Metadata panel shows Title/Artist/Year/Medium straight from `lib/data.ts` — Year and
    Medium render as "—" where unconfirmed (true for all current pieces), never invented.
  - Graceful degradation built in: if pixel sampling ever fails (e.g. a future
    cross-origin image), cells fall back to a neutral colour for COLOUR mode while the
    WHOLE/TEXTURE views keep drawing the real image directly — never a broken canvas.
  - `useReducedMotion()`-aware: jitter and the palette's idle bob turn off, and the
    stage-to-stage interpolation snaps instead of easing.
- Build and full-project lint re-verified clean: 49 pages, 0 errors, 25 warnings (all
  the same tracked `<img>` items).

## Update — Round 8 (homepage gallery wall + Experiment 07)

- **Homepage, section "01 — THE WORK"**: replaced the static 2×4 image grid with
  `GalleryWall`, a rotating coverflow-style carousel — a centred, focused artwork with
  neighbours fading and scaling away to either side, auto-advancing every ~4.2s
  (pauses on hover/focus, and skips auto-rotation entirely under reduced-motion).
  Every visible piece links straight to its own `/gallery/[slug]` page — clicking any
  image, not just the centred one, takes you to that artwork's full info. Manual
  PREV/NEXT controls and a title/artist caption underneath, also linked. Feels like
  walking a gallery wall rather than scrolling a grid.
- **New Art Lab experiment — The Sound of Colour**, Experiment 07 on `/art-lab`.
  Built entirely with the native Web Audio API (no external audio library, no
  pre-recorded sound). The same real palette-extraction already used elsewhere in the
  Lab is turned into a small chord: each dominant colour becomes a note (hue → pitch on
  an A-minor-pentatonic scale, so nothing can ever land dissonant; saturation → tone
  brightness/filter cutoff; lightness → volume and octave). Art DNA's existing
  Form/Texture/Energy read of the palette decides how it plays — a "Dynamic" palette
  arpeggiates quickly, a "Calm" one pulses slowly, an "Earthbound" one swells like a
  drone — and Form sets how much reverb/space it has.
  - Five glowing orbs, one per palette colour, pulse in real sync with the actual
    audio envelope triggering each note (not a separate fake animation).
  - Audio only ever starts on a direct click of the LISTEN button (never autoplays),
    has a visible volume slider and STOP control, and is clearly labelled as a sound
    experience before you reach it.
  - If the Web Audio graph fails to start for any reason, it fails gracefully — a plain
    message appears and the palette/orbs stay visible and correct, nothing breaks.
  - Same honest metadata panel and 01–04 artwork selector pattern as the other
    experiments; explicitly framed as "one honest way of hearing" a palette, matching
    the "interpretation, not measurement" language already used for Art DNA.
- Build and full-project lint re-verified clean: 49 pages, 0 errors, 26 warnings (same
  tracked `<img>` items as before, now including the two new experiments' hidden
  sampling `<img>` elements, which is expected — those aren't user-visible photos).

## Update — Round 9 (Experiment 08)

- **New Art Lab experiment — The Collector's Eye**, Experiment 08 on `/art-lab`.
  Deliberately a different mechanic from every other experiment so far (no canvas
  particles, no map, no audio, no cell deconstruction): eight quick A/B picks between
  two real, deliberately contrasting pieces ("which would you live with?"), each round
  spanning a different artist/collection/subject pairing so the tally means something.
  Ends on a real recommendation — the artist and collection the picks leaned toward,
  plus three real matching pieces, each linking straight to its `/gallery/[slug]` page,
  and a link to that artist's own profile. PLAY AGAIN resets and reshuffles nothing
  fabricated — the eight pairs are fixed and curated, the tally and recommendation are
  computed live from real picks against real data.
  - No personality-test framing or claims about the visitor — stays strictly about art
    preference and where to look next, never "this reveals who you are."
  - Progress dots, keyboard-focusable choice cards, reduced-motion-aware transitions
    (instant swap instead of slide/fade).
- Build and full-project lint re-verified clean: 49 pages, 0 errors, 26 warnings (same
  tracked `<img>` items as before — this experiment uses `next/image` throughout, no
  new ones added).

## Update — Round 10 (Experiment 09)

- **New Art Lab experiment — Curate Your Wall**, Experiment 09 on `/art-lab`. Another
  deliberately different mechanic — spatial arrangement rather than generative visuals,
  audio, or a quiz. Tap real pieces from the tray onto a neutral wall, drag to
  reposition, drag the gold handle to resize, × to remove. Built on plain pointer
  events (no drag library), so it works the same on touch and mouse.
  - **SAVE MOCKUP** rasterizes the actual arrangement — real image files at their real
    positions and sizes, drawn onto an offscreen canvas with a soft drop shadow per
    piece — into a real downloadable PNG (`eartgalla-my-wall.png`). No fake "AR
    preview"; it's an honest flat mockup of what you arranged.
  - Ties into real product use: a way to see how two or three pieces might look
    together before buying more than one.
  - Fails gracefully — if canvas export ever throws, a plain inline message appears and
    the arrangement itself is untouched, nothing breaks.
- Build and full-project lint re-verified clean: 49 pages, 0 errors, 26 warnings (same
  tracked `<img>` items as before — this experiment uses `next/image` throughout).

## Update — Round 11 (Art Lab reordered into a flow)

- Reordered the six numbered Art Lab experiments into a deliberate protocol, per
  request, rather than the order they happened to be built in:
  1. **The Collector's Eye** — now opens the flow. It's the closest thing to "pick an
     artist first": eight quick picks that end by pointing you toward a real artist and
     collection to start with.
  2. **Art Without Borders** — explore the wider roster/archive from there.
  3. **The Living Canvas** — go deep on one piece, visually.
  4. **The Sound of Colour** — a different sense — hear that piece.
  5. **Curate Your Wall** — the practical step — imagine owning it.
  6. **Art Alchemy** — closes the flow as the flagship, most visually spectacular
     piece, per explicit request to move it last.
  - Each component's own "EXPERIMENT NN" label was renumbered to match its new
    position (Collector's Eye is now 04, Art Alchemy is now 09 — the same 04–09 range
    as before, just reassigned), so the numbers still read in order top to bottom on
    the page. The status grid at the top of `/art-lab` was reordered to match.
  - Note: this doesn't add a literal "choose your artist" gate before anything else —
    The Collector's Eye still runs its own eight-picks flow before naming an artist. If
    a literal pick-an-artist-first landing step is wanted instead, that's a separate,
    fairly small build — flag it and it can go in next.
- Build and full-project lint re-verified clean: 49 pages, 0 errors, 26 warnings
  (unchanged — this was a pure reorder, no new components).

## Update — Round 12 (audit pass — no new experiments)

Went through every Art Lab experiment looking for real bugs and performance gaps
rather than adding anything new. Found and fixed three:

- **The Living Canvas — visible pop in FORM mode.** The cells hidden to reveal big
  shapes used to cut from visible to invisible in one frame once the deconstruct
  animation passed 85% progress. They now fade out smoothly instead, so FORM mode
  reads as a clean dissolve rather than a jump-cut.
- **Curate Your Wall — pieces could end up outside the wall on resize.** Item
  positions were only ever clamped at the moment you dropped or resized them; if the
  browser window resized afterward (most commonly a phone rotating), nothing kept
  them inside the visible wall. It now listens for resize and re-clamps every placed
  piece back inside the current wall bounds.
- **Unmanaged animation loops — a real performance gap now that six experiments sit
  on one page.** The Living Canvas, Art Alchemy (both canvases), and The Sound of
  Colour's orb visualizer were all running their `requestAnimationFrame` loops
  continuously and forever from the moment the page mounted — including for
  experiments scrolled far off-screen, and for the Sound of Colour orbs even when no
  audio was playing at all. Fixed:
  - Living Canvas and Art Alchemy now use an `IntersectionObserver` to pause their
    render loop while their canvas is scrolled out of view (200px margin so they
    resume just before you reach them), and pick back up automatically when they
    re-enter view. Reduced-motion users were already getting a single static frame
    and are unaffected.
  - The Sound of Colour's orb loop now only runs while a sound is actually playing,
    and resets the orbs to a calm idle state the moment playback stops instead of
    leaving them frozen mid-pulse.
  - This should measurably help battery life and scroll smoothness on `/art-lab`,
    especially on mobile, without changing how any of the experiments look or feel
    while you're actually using them.

Also re-confirmed every artwork slug referenced across all six numbered experiments
(40+ references total) resolves to a real, existing piece in `lib/data.ts` — no
broken/silently-dropped references anywhere in the Lab.

Still open (unchanged from earlier rounds, listed here so it doesn't get lost):
real Website URL and WhatsApp Channel invite link are still placeholders in
Footer.tsx and page footers, and the `<img>`→`next/image` migration for
GalleryGrid's masonry layout is still pending real width/height data per artwork.

Build and full-project lint re-verified clean: 49 pages, 0 errors, 26 warnings (all
the same tracked `<img>` items as before — this round touched no image tags).

## Update — Round 13 (Experiment 10 — The Borrowed Palette)

- **New Art Lab experiment — The Borrowed Palette**, Experiment 09 on `/art-lab`.
  Pick an artist first (the literal "select an artist as the first step" this time,
  not a proxy for it), and paint freehand on a blank canvas using a brush loaded with
  that artist's real extracted palette, pulled live from two of their actual
  catalogued works via the same `extractPalette` used throughout the Lab. Swatches
  along the bottom are their real colors — tap one to switch the brush.
  - Plain Canvas 2D freehand drawing (pointer events, no library), with a soft
    painterly bleed via `ctx.shadowBlur` rather than a hard vector line, three brush
    sizes, UNDO (snapshot stack, capped at 20 states), CLEAR, and SAVE (a genuine
    downloadable PNG of the sketch).
  - Explicitly framed as borrowing colors, not technique — "Not a lesson — just a
    loan" — and never implies the sketch is or resembles the artist's own work.
  - Canvas resize preserves the in-progress sketch (redrawn at the new size) rather
    than wiping it, and falls back to a blank canvas gracefully if the redraw ever
    fails to load.
  - Portrait fallback: uses the same real-portrait-or-monogram pattern already
    established on `/artists` for artists without a photo on file.
- **Art Alchemy stays last.** Since it was explicitly asked to close the flow, this
  new experiment was inserted before it rather than after — Art Alchemy is now
  relabeled Experiment 10, still the flagship finale.
- Build and full-project lint re-verified clean: 49 pages, 0 errors, 26 warnings (same
  tracked `<img>` items as before).

## Update — Round 14 (new real artworks, Art Alchemy gate, Experiment 11 — The Art Dialogue)

### New real artworks and attribution
Added 6 new pieces from real uploaded photos:
- **Lenny Kariuki**: "Wave, Painted Pocket" (painted denim), "Hyena Study", "Horseman
  Under the Red Moon", "Portrait Study (Unfinished)", "Night and Day"
- **John Njoroge**: "The Flute Player"
- Titles above are honest, purely descriptive placeholders I wrote myself (none were
  given) — real titles from the artists should replace them whenever available.
- All new pieces: `year`, `medium`, `dimensions`, `collection`, `description` left
  `null` — none of that was confirmed, so none of it was invented.
- **Excluded from the catalog entirely**: a photo of custom-painted Nike sneakers
  featuring Disney/Pixar's *Ratatouille* characters. Not added anywhere — using
  recognizable copyrighted characters in a commercial art-marketplace listing isn't
  something I'll do regardless of the source.
- **John Njoroge now has a real portrait photo** (`/art/john/portrait.jpg`). Flagging
  clearly: this was inferred from a garbled instruction ("add a nice profile for me")
  immediately after naming John — I read "me" as a transcription slip for "him." If
  that photo is actually meant for something else, it's a one-line fix to undo.

### Art Alchemy — now button-gated
Per request, Art Alchemy no longer renders on page load. `components/alchemy/AlchemyGate.tsx`
shows its header and an "OPEN ART ALCHEMY →" button; clicking it mounts the real
experiment. Numbering (`EXPERIMENT 10`) unchanged. Bonus: this also means its particle
engine no longer runs until explicitly opened, which is a small additional performance
win on top of Round 12's off-screen pausing.

### Data integrity findings — not fixed, flagged for you
While verifying images for The Art Dialogue (which requires actually opening and
checking every image before annotating it), several pre-existing problems turned up.
None of these were touched — attribution and titling are your call, not mine:
- **"Mountain Solitude" and "The Spearman" are swapped** — confirmed by opening both:
  one is a portrait of a man in a headdress, the other is a snow-capped mountain
  landscape with campers and a jeep.
- **"The Orator"** (tagged as a portrait) is actually a painting of two animals — not
  a person at all.
- **"Tiger in Frost" (Lenny) and "The Orator" (Alvin) use the exact same photo**,
  attributed to two different artists under two different titles.
- **Two Alvin-attributed pieces** ("Unbound," "Bloom Beneath the Surface") carry a
  visible artist signature in the corner that isn't "Alvin Mwangi" — worth confirming
  whether these are genuinely his.
- **Both of John's card images** ("The Royals," "Queen of Hearts") show completely
  different cards than their titles/suits claim.

### New Art Lab experiment — The Art Dialogue, Experiment 11
Built per the attached spec. A quiet, dark "look closer" room around one artwork at a
time:
- **LOOK** — the image leans a few px away from the cursor (spring-smoothed via
  `motion/react`, `±7px`, scale ≈1.03) with a faint pool of light following the
  pointer, driven by direct CSS variable writes on pointermove — no React state per
  frame.
- **NOTICE** — resting the cursor for ~650ms near a real annotation point reveals a
  marker there (ring + dot + one soft ping). Only markers actually found this way
  appear on the canvas.
- **EXPLORE** — clicking a marker opens a catalogue-style entry: kind label (Colour /
  Texture / Form / Composition / Detail), one observation in editorial serif, a
  position counter, and ←→✕ controls, connected by a thin gold leader line drawn from
  the marker (SVG `pathLength`).
- **REVEAL** — after 3 details are opened (or sooner via a quiet "Reveal the work →"
  button), the artwork's real info appears below: artist (linked), title, and only
  the fields that actually exist. `description` is labeled "Described by EARTGALLA";
  a confirmed artist's bio is labeled "The story — About {artist}" — kept visibly
  separate, and only shown at all when the artist's status is `confirmed` (only Lenny
  qualifies right now).
- **RETURN** — reveal collapses first, then markers clear, then the artwork scrolls
  back into view.
- **Everywhere** — a full "Detail 01/02/03…" button row exists regardless of hover
  state, so touch and keyboard users reach every annotation the same way mouse users
  do via dwell. Below 1024px it becomes a full-width, ≥48px-tall list instead of the
  floating leader-line layout, and the hint line changes to "Tap a detail to look
  closer."
- **Accessibility**: every marker/detail is a real `<button>` with `aria-label` and
  `aria-pressed`, gold focus rings, Escape closes the open entry, one visually hidden
  `aria-live="polite"` region announces the active observation, all touch targets
  ≥44px.
- **Reduced motion**: no cursor-lean, no spotlight, no ping; crossfades only, all
  content reachable exactly the same way via the Detail button row.

**Artworks used** (5, all Lenny Kariuki — see integrity findings above for why the
catalog was narrower than hoped): Happiness, Guardians of the Plain, Hyena Study,
Horseman Under the Red Moon, Night and Day. Each has 3–4 annotations in
`lib/annotations.ts`, written after actually opening the image and checking
coordinates against real content — not generated from titles or guessed. "The Flute
Player" (John) was left out of this feature specifically, on top of the exclusions
above: its only source photo has a camera timestamp overlay and dark vignette baked
in, which would show up inside the clean "exhibition room" frame — it's still a
normal gallery piece, just not part of this particular experience.

**Deviations from the attached spec** (reference zip wasn't actually attached, so this
was built fresh against the spec text rather than ported):
- Image dimensions for the aspect-ratio frame are hardcoded per slug (read once via
  PIL) rather than parsed from JPEG/PNG headers at build time. Same visual result — no
  cropping, correct aspect ratio — without a binary-parsing helper for five images.
- The gold leader line is drawn from the marker to the artwork frame's own right edge
  rather than precisely to the floating entry panel's position — a reasonable
  approximation of "line draws from marker to entry" without cross-component pixel
  math between two independently-sized elements.
- Marker "appears" used a spring/fade-in via Motion instead of a literal ping
  keyframe; visually similar, same restraint.

**Real bug caught and fixed during review**: the stage container used
`container-type: size` with no explicit height — under CSS containment rules that
silently collapses `100cqh` to 0, which would have collapsed the entire artwork frame
to nothing. Fixed by giving the container an explicit `height: min(74vh, 640px)`
before it shipped.

**What I have not done**: opened this in an actual browser. Build, `tsc --noEmit`, and
full-project lint are all clean (55 pages, 0 errors, 26 warnings — all pre-existing
`<img>` items, nothing new). I did a careful manual code review and caught one real
bug that way, but I have not clicked through the LOOK→NOTICE→EXPLORE→REVEAL→RETURN
flow, tested keyboard-only navigation, checked the listed breakpoints, or toggled
`prefers-reduced-motion` in a live render. Please treat the interaction itself as
unverified until it's been opened in a browser.
