# Stories (`/stories`)

Short vertical stories, in a full-screen player. A story is a list of items; an item is a **video** or an **image**
(an artwork). Nothing about an artwork is typed twice — titles, artists, medium and year come from `lib/data.ts`.

> Naming: `stories` in `lib/data.ts` are the **Gazette articles**. The video stories live in `lib/videoStories.ts`.

## Adding a real video (5 minutes)
1. **Export** the video vertical (9:16, e.g. 1080×1920), 15–60 seconds. Keep it under ~8 MB where you can.
   Make two files with the same base name:
   ```
   ffmpeg -i input.mov -vf "scale=720:-2" -c:v libx264 -crf 24 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k studio-visit.mp4
   ffmpeg -i input.mov -vf "scale=720:-2" -c:v libvpx-vp9 -crf 34 -b:v 0 -c:a libopus studio-visit.webm
   ffmpeg -i input.mov -ss 1 -frames:v 1 -vf "scale=720:-2" studio-visit-poster.jpg
   ```
2. **Put** `studio-visit.mp4`, `studio-visit.webm`, `studio-visit-poster.jpg` in `public/stories/`.
3. **Add an entry** in `STORIES` (`lib/videoStories.ts`):
   ```ts
   { video: "studio-visit", work: "denim-tide", hasAudio: true,
     alt: "Lenny at his easel, painting the wave on the pocket.",   // what a viewer who can't see it needs to know
     caption: "Recorded in the studio.",                             // optional
     captions: "/stories/studio-visit.en.vtt" }                       // optional subtitles (WebVTT)
   ```
   Set `hasAudio: true` only if the clip has sound — that's what shows the sound button.
4. To make a **new story**, add a `{ slug, title, kicker, items: [...] }` block. `slug` is the share link (`/stories#slug`).

An item that points at a missing artwork is skipped rather than breaking the page.

## Making an "artwork in motion" clip from a still
`python scripts/make_story_videos.py lenny/denim-tide.jpg lenny-denim-tide` (needs Python 3, `opencv-python`,
`numpy` and `ffmpeg`). It writes the `.mp4`, `.webm` and poster to `public/stories/`. The clips that ship with the
site were made this way — they are **not** filmed footage, and the page calls them "Artwork in motion".

## How the player behaves
- Tap the right side = next, left = back, press and hold = pause. Keys: ← → move, Space pauses, M mutes, Esc closes.
- Clips play muted and inline; image items hold for 6 seconds with a slow push-in.
- **Reduced motion:** nothing starts on its own — clips wait for Play, images wait for a tap.
- The open story is in the URL hash, so it can be shared, Back closes it, and refresh returns to it.
- Focus is kept inside the player; the page behind is locked while it's open.

## Ideas for later (not built, not promised — for planning)
- **Real video hosting** (Mux / Cloudflare Stream / YouTube unlisted) so large files don't live in the repo:
  add `type: "embed"` items and stream instead of `<source>` files.
- **Formats worth filming:** studio visits, process time-lapses, artist voices over a work, exhibition walk-throughs.
- **A story per artwork**, linked from the artwork page ("Watch the story").
- **Share links per item** (`/stories#slug/2`) and Open Graph previews so shared stories look right on WhatsApp.
- **View counts / analytics** to see which stories people finish.
- **A simple upload form / CMS** so artists can add stories without touching code.
- **Captions and transcripts** on every clip (the player already supports a WebVTT track).
