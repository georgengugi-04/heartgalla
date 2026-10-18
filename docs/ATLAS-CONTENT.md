# Adding to the Living Atlas

Records live in `lib/atlas/data.ts` and are typed in `lib/atlas/types.ts`. The Explore page (`/explore`) and the detail pages
(`/explore/practices/[slug]`, `/explore/communities/[slug]`) read from there.

## Rules every record must meet

1. **Permission first.** `permission.grantedBy` names who agreed and in what form. If you can't fill it in, leave the record as `draft`.
2. **Sources.** Every claim lists `sourceIds` that exist in the record's `sources`.
3. **Claim kinds.** `verified` = checked against a cited source. `attributed` = an account by a named person or group (set `speaker`).
   `interpretation` = a reading or opinion. Never file an oral account as `verified`.
4. **Their names first.** `names.primary` is the name the community or maker uses for itself; other names go in `alternates`.
5. **No uniformity.** Community records carry `diversityNote`. Use `relatedCommunityIds` for overlap; don't force one label per person.
6. **Status.** Only `published` records appear without the "still in review" note. `withdrawn` records are removed from Explore and the sitemap.

## Communities

`communities` is intentionally empty. Add one only after documenting it with the people concerned.

## Connecting a CMS

The index is built by `buildExploreIndex()` in `lib/atlas/index.ts`. To move to a CMS or database, replace the arrays in
`lib/atlas/data.ts` with fetches that return the same types (keep fetching on the server, and keep API keys in server-only env vars).
