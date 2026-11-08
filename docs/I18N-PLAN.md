# Plan: English + Swahili (and room for more)

Status: **plan only, nothing built yet.** Written against Next.js 16 (see `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`).

## 1. Decisions to make first
| Question | Recommendation |
|---|---|
| URLs | Keep English where it is (`/gallery`) and put Swahili under `/sw` (`/sw/gallery`). Existing links and search rankings stay valid. |
| Locale codes | `en` (default) and `sw`. Add `sw-KE` later only if a Tanzanian variant is ever needed. |
| Who translates | Draft by Claude, **review by a native Swahili speaker** before launch (Koshe, plus one more reviewer for tone). Mark unreviewed strings so nothing ships unchecked. |
| Library | Start with plain typed dictionaries (as in the Next docs). Move to `next-intl` only if plurals/dates get heavy. |

## 2. Technical approach
1. **Routing.** Move every route under `app/[lang]/...` (page, layout, loading, error, not-found; `api/`, `_og`, `robots`, `sitemap`, icons stay at the root).
2. **One proxy.** `proxy.ts` already exists for the Journeys admin (Supabase session). Extend it, do not add a second one: for `/sw/...` pass through; for everything else `NextResponse.rewrite` to `/en/...` so English URLs do not change; honour a saved language cookie (`NEXT_LOCALE`) and `Accept-Language` for a first-visit suggestion banner, not a forced redirect. Keep the admin session refresh and its matcher behaviour.
3. **Dictionaries.** `app/[lang]/dictionaries/en.json` and `sw.json` (`server-only` loader). Pass strings down to client components as props. Types generated from `en.json` so a missing Swahili key fails the build.
4. **Content data.** `lib/data.ts` (artists, artworks, stories), `lib/journeys/destinations.ts` and `lib/atlas/*` hold long English text. Add a `sw` object per record for translatable fields only (descriptions, summaries, tips, alt text). Fall back to English per field when `sw` is empty, and show a small "in English" note rather than a blank.
5. **Do NOT translate:** artist names, artwork titles, place names, brand names (EARTGALLA, GreenTrack). Offer an optional Swahili subtitle for artwork titles later.
6. **SEO.** `<html lang>` per locale, `alternates.languages` (hreflang) in metadata, per-locale sitemap entries, translated titles and descriptions, localised Open Graph text.
7. **Language switcher.** `EN | SW` in the nav beside the theme toggle. Keeps the current page, sets the cookie.
8. **Forms and email.** Contact and Journeys inquiry forms: translated labels, validation messages and success text. Store the visitor's `locale` with each inquiry (new column in the Supabase table) so staff reply in the right language. The admin area stays English.
9. **Formatting.** Dates, numbers and money via `Intl` with the locale (`KES` stays). Swahili text runs roughly 20-30% longer: check nav, buttons, cards and the planner at 375 px.
10. **Fonts.** Fraunces and Manrope cover Swahili (Latin script). No new fonts needed.
11. **Testing.** Screenshot every page in `en`/`sw` x dark/light at 375 / 768 / 1280; a script that fails on missing or untranslated keys; keyboard and screen-reader pass with `lang` switching.

## 3. Phases
1. **Foundation** (about 1-2 days): `[lang]` routing, proxy, dictionary loader, switcher, `lang` attribute, English-only content unchanged.
2. **Chrome and forms** (about 1 day): nav, footer, buttons, contact form, errors, 404, cookie/consent text.
3. **Journeys** (about 2-3 days): landing, planner, packages, destination pages, inquiry form, emails.
4. **Art and stories** (about 2-3 days): gallery, artist pages, Gazette and story text, Atlas descriptions, About / For Partners.
5. **Art Lab** (later): interactive experiences with a lot of microcopy; translate last.
6. **Review and launch**: native review pass, fix overflow, hreflang check, announce.

## 4. Open questions for Koshe
- Swahili only, or also Sheng for some campaigns? (Plan assumes standard Swahili.)
- Should Swahili be offered automatically to visitors whose browser is set to Swahili, or only via the switcher?
- Who reviews the Swahili text, and how fast do they need to turn it around?
- Do artists want their descriptions translated, or only the site's own text?
