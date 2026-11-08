# Light mode

## How it works
- Colours are CSS variables (`--c-charcoal`, `--c-ivory`, `--c-gold`, ...) in `app/globals.css`. `data-theme="light"` on `<html>` swaps their values.
- The token **names stay the same** and their roles swap: `bg-charcoal` / `bg-gallery-dark` are the page surfaces, `text-ivory` / `border-ivory/10` are the text and lines on them. So all existing classes work in both themes with no per-component changes.
- Accent colours are deepened in light mode so they keep 4.5:1+ contrast on paper (gold `#7d5f1b`, terracotta `#9c4a2e`, electric `#4f6b00`).
- `--c-error` / `text-error` / `border-error` is the form-error colour (use it instead of hard-coded salmon).
- A script in `<head>` (`lib/theme.ts`) sets `data-theme` before first paint. **Default is dark** unless the visitor chose light with the toggle in the nav (stored in localStorage). To follow the visitor's system setting instead, use the `prefers-color-scheme` line that was removed from `THEME_GUARD_SCRIPT`.

## Keeping a section dark in light mode
Put `data-theme="dark"` on the element (add `text-ivory` and a background, because the page text colour is inherited). Used for: Art Lab (`app/art-lab/layout.tsx`), the Journeys photo hero, the zebra section, destination cards that have a photo, and the marquee credit bars. Use it for any section with a photo behind white text.

## Known gaps (first pass)
- About 20 components still hard-code a few colours (`components/hero/Sculpture.tsx`, `CurateWall`, `BorrowedPalette`, `SoundOfColour`, `awb/RadialMap`, `artdialogue/AnnotationLayer`, `app/global-error.tsx`, `app/_og/card.tsx`). Most are decorative or inside the dark Art Lab; check each in light mode.
- Open Graph / Twitter images are always dark.
- No `theme-color` meta tag yet (phone browser bar colour).
- Small captions at `text-ivory/40` are below 4.5:1 contrast in both themes.
- Pages checked in light mode: Home, Explore, Gallery, Artists, Gazette, Stories, Wear, For Partners, About, Contact, Art Lab, Journeys (landing, Nakuru, planner). Not checked: individual artwork pages, story viewer, journeys admin, error pages.
