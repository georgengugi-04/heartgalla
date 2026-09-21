# EARTGALLA — Next.js Rebuild

Real rebuild on Next.js 16 (App Router) + Tailwind v4 + Motion. This replaces the old
static HTML/CSS/JS site with an actual React architecture, per the brief.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build — verified passing, 60 static pages
```

Needs normal internet access to fetch Fraunces/Manrope from Google Fonts at build time
(this sandbox blocks that domain, so it was build-tested with fonts temporarily stubbed —
your machine and any real host like Vercel won't have that restriction).

Deploy target: Vercel is the path of least resistance for Next.js App Router — connect
the repo, no config needed.

## What's in this folder now

This is the current, official EARTGALLA project. On top of the original rebuild it includes:

- **Homepage "The Collection"** — an immersive gallery right after the hero (`components/collection/`, `lib/collection.ts`).
- **Homepage intro** — a ~20 second typographic sequence with synthesised music, ending on "Welcome to EARTGALLA"
  (`components/intro/`). It plays when the site is **loaded** on the homepage — a new visit or a refresh — and never when someone already inside
  clicks to Home (they get a short ~3 second message, "Kenyan art. Global stage.", like every other page). That's one line:
  `INTRO_FREQUENCY` in `components/intro/introGuard.ts` (`"always"`, the default; `"session"` = once per visit; `"first-visit"` =
  once ever). Homepage only. Add `?intro=1` to any URL to replay it.
- **A short message on every page** (`components/pageintro/`) — each page opens with its own one-line message on a dark
  curtain (about 3.5 seconds, tap or Esc to skip, no sound). The words are in `messages.ts`; they play **every time** a page
  is opened (new visit, refresh, every click through) — Home included, when you click to it from inside the site. That's `PAGE_INTRO_FREQUENCY` in `pageIntroGuard.ts` (`"always"`, the
  default; `"session"` = each page once per visit; `"off"`).
- **Art Lab, in the live order** (`app/art-lab/page.tsx`): 04 The Collector's Eye · 05 Art Without Borders · 06 The Living
  Canvas · 07 The Sound of Colour · 08 Curate Your Wall · 09 Art Alchemy · 10 The Art Dialogue. Artwork lists for the
  Collector's Eye and Sound of Colour are in `lib/lab.ts`; Curate Your Wall and the Living Canvas hook are your own files
  from the live site (they pick their own artworks); the Art Dialogue's observations are in `lib/annotations.ts`.
- **Stories** (`/stories`) — vertical video/image stories with a full-screen player. See `docs/STORIES.md`.
- **The artists are shared 40 / 30 / 20 (Lenny · Alvin · John), plus 10% for the developer** — set in one place,
  `lib/balance.ts`, and applied to the hero, homepage, Collection, gallery order, marquee, Wear, the Art Lab
  experiments, Stories and the Gazette. The artist strip on the homepage is literally 4 : 3 : 2 : 1. The developer's
  "Built by" details are in `lib/developer.ts` (footer, About page, homepage strip) — edit or delete lines there.
  After adding works, check the split with `npx tsx scripts/balance-report.ts`.
- **Docs:** `docs/STORIES.md`, `docs/CONTENT-ISSUES.md` (images whose titles don't match — read this one).
- **For your live repo:** `docs/live-repo-dropin.zip` (the two intros as a drop-in, with instructions inside) and
  `docs/art-dialogue-prompt.md` (a paste-ready prompt for adding The Art Dialogue to a different copy of the site).

To rebuild the "artwork in motion" clips: `python scripts/make_story_videos.py <image under public/art> <name>`.

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
- **Art Lab** (`/art-lab`) entries are honestly labeled by status (Live / Research) — nothing claims to be shipped that
  isn't. The Collector's Eye, The Sound of Colour and Curate Your Wall were rebuilt from the live page's descriptions.
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
  art-lab/             status-labeled experiments (04–10)
  stories/             video + image stories
  art-lab/<experiment>/ Art Alchemy, The Living Canvas and Curate Your Wall open on their own pages;
                       /art-lab shows a teaser for each (see lib/artlabPages.ts)
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
