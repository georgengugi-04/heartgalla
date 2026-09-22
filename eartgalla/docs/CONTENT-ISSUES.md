# Content issues found in the catalogue (not changed)

While building the Art Lab, several images turned out to show something other than their title. These are in
`lib/data.ts`, `components/PlayCards.tsx` and the image filenames. **Nothing here has been changed** — they are your
catalogue's decisions — but the same mismatch exists on the live site. The new experiments only use works whose
title was checked against the image.

## John Njoroge's cards — the file names are shifted
What each file actually shows (rank and suit are printed on the card, so this is certain):

| File | Actually shows | Currently used as |
|---|---|---|
| `card-king-queen-royals.jpg` | 5 of clubs (guitar) | "The Royals" |
| `card-5-clubs-guitar.jpg` | King and Queen | "Five of Clubs" |
| `card-queen-of-hearts.jpg` | 7 of clubs (grey background) | "Queen of Hearts" |
| `card-queen-of-hearts-alt.jpg` | 3 of clubs (hummingbird) | "Queen of Hearts — Studio View" |
| `card-7-clubs.jpg` | 8 of spades (bench) | "Seven of Clubs" |
| `card-7-strawberries.jpg` | 10 of clubs (red bow) | "Seven of Diamonds" |
| `card-8-spades-bench.jpg` | 2 of clubs (baby) | "Eight of Spades" |
| `card-3-hummingbird.jpg` | 7 of diamonds (strawberries) | "Three of Clubs" |
| `card-2-clubs-baby.jpg` | a photograph of a man holding a painting (not a card) | "Two of Clubs" |
| `card-6-clubs-koi.jpg`, `-alt.jpg` | 6 of clubs (koi) | "Six of Clubs" ✓ correct |

There is no Queen of Hearts among the files.

## Other titles that don't match their image
- Lenny Kariuki: "Mountain Solitude" shows a painted portrait of a man in a tall headdress, and "The Spearman" shows a
  mountain campsite — they look swapped. "Village Under the Mountain" is a photograph of a person, and "Herd at Dawn"
  (`elephant-herd-savanna.jpg`) is a photograph of many paintings laid out.
- Alvin Mwangi: "Two Skies" is a blue-and-yellow abstract face, "Faces of Africa" is a mountain campsite scene, and
  "The Orator" is a lion with a cub. (The actual two-skies tree painting is "Between Hours".)
- A Gazette cover points at `/art/process/cutlery-cross.jpg`; the file is at `/art/lenny/cutlery-cross.jpg`.
- `components/awb/RadialMap.tsx` logs a browser warning (`<circle> r`) from an animation with no starting radius.

## Fixing it
For the cards, the simplest fix is to point each entry at the file that shows its own card (e.g. "The Royals" →
`card-5-clubs-guitar.jpg`), rename or retitle the entries that have no matching card, and update `PlayCards.tsx` the
same way. Slugs (URLs) don't need to change.
