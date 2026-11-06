# Journeys photos: where to find them and how to add them

Every destination has a folder: `public/journeys/<slug>/`. Nakuru is the worked example (its photos are written by hand in `lib/journeys/destinations.ts`); the other ten are set up the same way and filled by a script.

## Adding photos (about two minutes per destination)

1. Download a photo from the links below. Prefer landscape, at least 1600 px wide.
2. Save it into the destination's folder, e.g. `public/journeys/lamu/lamu-old-town-street.jpg`. Use lowercase names with hyphens.
3. Describe it in that folder's `_credits.json`:

```json
{
  "lamu-old-town-street.jpg": {
    "alt": "A narrow whitewashed street with a carved wooden door",
    "credit": "Photographer name / Pexels",
    "licence": "pexels",
    "attraction": "Lamu Old Town",
    "hero": true
  }
}
```

   - `alt`: describe what is actually in the picture. Do not guess the place from the search term.
   - `credit`: the photographer's name and the site, shown under the photo.
   - `licence`: `pexels`, `unsplash`, or `unconfirmed` if you are not sure.
   - `attraction` (optional): the exact attraction name from the list below. The photo then appears under that attraction. Without it, the photo goes in the destination's Gallery.
   - `hero` (optional): make this the destination's main image. Otherwise the first file alphabetically is used.

4. Run `npm run journeys:photos`, then check the site locally with `npm run dev`.
5. Commit and push. Push photos in small batches, because a large single push can time out.

A photo with no entry in `_credits.json` still shows, but with the caption "Photo credit to be confirmed" and a plain placeholder alt text.

## Licences

Pexels and Unsplash photos are free to use on a website, including commercially, without asking. Crediting the photographer is not required, but this site does it anyway. Check each photo's page, because:
- Do not use photos that show recognisable people for any purpose that implies endorsement, and avoid photos of private individuals.
- Do not use photos of brands, logos or art that is itself copyrighted.
- Pexels and Unsplash photos that were re-uploaded by someone other than the photographer can be wrong. Prefer a photographer with a profile and several Kenya photos.
- iStock, Alamy, Getty and Google Images results are **not** free. Do not use them.

Pexels licence: https://www.pexels.com/license/  ·  Unsplash licence: https://unsplash.com/license

## Search links by destination

The attraction names below match `lib/journeys/destinations.ts`; use them exactly in `"attraction"`.

### Nairobi — `public/journeys/nairobi/`

- Overview: [Pexels](https://www.pexels.com/search/Nairobi%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Nairobi-Kenya)
- Nairobi National Park: [Pexels](https://www.pexels.com/search/Nairobi%20National%20Park%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Nairobi-National-Park-Kenya)
- Nairobi National Museum: [Pexels](https://www.pexels.com/search/Nairobi%20National%20Museum%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Nairobi-National-Museum-Kenya)
- Karen Blixen Museum: [Pexels](https://www.pexels.com/search/Karen%20Blixen%20Museum%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Karen-Blixen-Museum-Kenya)
- GoDown Arts Centre: [Pexels](https://www.pexels.com/search/GoDown%20Arts%20Centre%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/GoDown-Arts-Centre-Kenya)
- Giraffe Centre: [Pexels](https://www.pexels.com/search/Giraffe%20Centre%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Giraffe-Centre-Kenya)

### Naivasha — `public/journeys/naivasha/`

- Overview: [Pexels](https://www.pexels.com/search/Naivasha%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Naivasha-Kenya)
- Lake Naivasha: [Pexels](https://www.pexels.com/search/Lake%20Naivasha%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Lake-Naivasha-Kenya)
- Crescent Island Game Sanctuary: [Pexels](https://www.pexels.com/search/Crescent%20Island%20Game%20Sanctuary%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Crescent-Island-Game-Sanctuary-Kenya)
- Hell’s Gate National Park: [Pexels](https://www.pexels.com/search/Hell%E2%80%99s%20Gate%20National%20Park%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Hell%E2%80%99s-Gate-National-Park-Kenya)
- Mount Longonot: [Pexels](https://www.pexels.com/search/Mount%20Longonot%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Mount-Longonot-Kenya)

### Mombasa — `public/journeys/mombasa/`

- Overview: [Pexels](https://www.pexels.com/search/Mombasa%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Mombasa-Kenya)
- Fort Jesus: [Pexels](https://www.pexels.com/search/Fort%20Jesus%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Fort-Jesus-Kenya)
- Old Town: [Pexels](https://www.pexels.com/search/Old%20Town%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Old-Town-Kenya)
- Mama Ngina Waterfront: [Pexels](https://www.pexels.com/search/Mama%20Ngina%20Waterfront%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Mama-Ngina-Waterfront-Kenya)
- Haller Park: [Pexels](https://www.pexels.com/search/Haller%20Park%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Haller-Park-Kenya)

### Watamu — `public/journeys/watamu/`

- Overview: [Pexels](https://www.pexels.com/search/Watamu%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Watamu-Kenya)
- Watamu Marine National Park: [Pexels](https://www.pexels.com/search/Watamu%20Marine%20National%20Park%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Watamu-Marine-National-Park-Kenya)
- Mida Creek: [Pexels](https://www.pexels.com/search/Mida%20Creek%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Mida-Creek-Kenya)
- Arabuko Sokoke Forest: [Pexels](https://www.pexels.com/search/Arabuko%20Sokoke%20Forest%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Arabuko-Sokoke-Forest-Kenya)
- Gedi Ruins: [Pexels](https://www.pexels.com/search/Gedi%20Ruins%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Gedi-Ruins-Kenya)

### Lamu — `public/journeys/lamu/`

- Overview: [Pexels](https://www.pexels.com/search/Lamu%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Lamu-Kenya)
- Lamu Old Town: [Pexels](https://www.pexels.com/search/Lamu%20Old%20Town%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Lamu-Old-Town-Kenya)
- Lamu Fort: [Pexels](https://www.pexels.com/search/Lamu%20Fort%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Lamu-Fort-Kenya)
- Lamu Museum: [Pexels](https://www.pexels.com/search/Lamu%20Museum%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Lamu-Museum-Kenya)
- Shela: [Pexels](https://www.pexels.com/search/Shela%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Shela-Kenya)

### Diani — `public/journeys/diani/`

- Overview: [Pexels](https://www.pexels.com/search/Diani%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Diani-Kenya)
- Diani Beach: [Pexels](https://www.pexels.com/search/Diani%20Beach%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Diani-Beach-Kenya)
- Kaya Kinondo: [Pexels](https://www.pexels.com/search/Kaya%20Kinondo%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Kaya-Kinondo-Kenya)
- Colobus Conservation: [Pexels](https://www.pexels.com/search/Colobus%20Conservation%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Colobus-Conservation-Kenya)
- Shimba Hills National Reserve: [Pexels](https://www.pexels.com/search/Shimba%20Hills%20National%20Reserve%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Shimba-Hills-National-Reserve-Kenya)
- Wasini Island: [Pexels](https://www.pexels.com/search/Wasini%20Island%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Wasini-Island-Kenya)

### Malindi — `public/journeys/malindi/`

- Overview: [Pexels](https://www.pexels.com/search/Malindi%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Malindi-Kenya)
- Vasco da Gama Pillar: [Pexels](https://www.pexels.com/search/Vasco%20da%20Gama%20Pillar%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Vasco-da-Gama-Pillar-Kenya)
- Gedi Ruins: [Pexels](https://www.pexels.com/search/Gedi%20Ruins%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Gedi-Ruins-Kenya)
- Malindi Marine National Park: [Pexels](https://www.pexels.com/search/Malindi%20Marine%20National%20Park%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Malindi-Marine-National-Park-Kenya)

### Nanyuki — `public/journeys/nanyuki/`

- Overview: [Pexels](https://www.pexels.com/search/Nanyuki%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Nanyuki-Kenya)
- Mount Kenya: [Pexels](https://www.pexels.com/search/Mount%20Kenya%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Mount-Kenya-Kenya)
- Ol Pejeta Conservancy: [Pexels](https://www.pexels.com/search/Ol%20Pejeta%20Conservancy%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Ol-Pejeta-Conservancy-Kenya)
- Equator marker: [Pexels](https://www.pexels.com/search/Equator%20marker%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Equator-marker-Kenya)

### Kisumu — `public/journeys/kisumu/`

- Overview: [Pexels](https://www.pexels.com/search/Kisumu%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Kisumu-Kenya)
- Lake Victoria waterfront: [Pexels](https://www.pexels.com/search/Lake%20Victoria%20waterfront%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Lake-Victoria-waterfront-Kenya)
- Kisumu Museum: [Pexels](https://www.pexels.com/search/Kisumu%20Museum%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Kisumu-Museum-Kenya)
- Kisumu Impala Sanctuary: [Pexels](https://www.pexels.com/search/Kisumu%20Impala%20Sanctuary%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Kisumu-Impala-Sanctuary-Kenya)
- Dunga Beach: [Pexels](https://www.pexels.com/search/Dunga%20Beach%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Dunga-Beach-Kenya)

### Nyeri — `public/journeys/nyeri/`

- Overview: [Pexels](https://www.pexels.com/search/Nyeri%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Nyeri-Kenya)
- Aberdare National Park: [Pexels](https://www.pexels.com/search/Aberdare%20National%20Park%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Aberdare-National-Park-Kenya)
- Mount Kenya: [Pexels](https://www.pexels.com/search/Mount%20Kenya%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Mount-Kenya-Kenya)
- Baden-Powell’s grave: [Pexels](https://www.pexels.com/search/Baden-Powell%E2%80%99s%20grave%20Kenya/) · [Unsplash](https://unsplash.com/s/photos/Baden-Powell%E2%80%99s-grave-Kenya)
