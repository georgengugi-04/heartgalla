"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { selectPalette, type Swatch } from "@/lib/borrowedpalette/extract";
import { ArtworkStore, AUTOSAVE_ID, type SavedRecord } from "@/lib/borrowedpalette/persist";
import type { StudioArtist } from "@/lib/borrowedpalette/artworks";
import { analyseUrl } from "./browser";

export type Start = { kind: "new"; artistId: string } | { kind: "resume"; record: SavedRecord };

export default function ArtistGate({ artists, onStart }: { artists: StudioArtist[]; onStart: (s: Start) => void }) {
  const [previews, setPreviews] = useState<Record<string, Swatch[] | "error">>({});
  const [last, setLast] = useState<{ rec: SavedRecord; url: string | null } | null>(null);

  // read each artist's colours (one after another, so a slow phone isn't asked to do three at once)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const a of artists) {
        const w = a.works[0];
        if (!w) continue;
        try { const an = await analyseUrl(w.image, null, true); if (!cancelled) setPreviews((p) => ({ ...p, [a.id]: selectPalette(an.pool, 8) })); }
        catch { if (!cancelled) setPreviews((p) => ({ ...p, [a.id]: "error" })); }
      }
    })();
    return () => { cancelled = true; };
  }, [artists]);

  // is there a session to continue?
  useEffect(() => {
    let url: string | null = null, cancelled = false;
    new ArtworkStore().get(AUTOSAVE_ID).then((rec) => {
      if (cancelled || !rec) return;
      url = rec.thumb ? URL.createObjectURL(rec.thumb) : null;
      setLast({ rec, url });
    }).catch(() => {});
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, []);

  return (
    <section className="border-t border-ivory/10 pb-8 md:py-16" aria-labelledby="bp-title">
      <div className="mb-10 px-6 text-center md:mb-14 md:px-10">
        <div className="label-mono mb-5 flex flex-wrap items-center justify-center gap-3 text-ivory/50"><span className="text-electric">EXPERIMENT 11</span><span>·</span><span>CREATE</span><span>·</span><span>EARTGALLA ART LAB</span></div>
        <h2 id="bp-title" className="font-editorial text-5xl leading-[0.95] md:text-7xl">THE BORROWED PALETTE</h2>
        <p className="font-editorial mx-auto mt-5 max-w-xl text-xl italic text-ivory/75 md:text-3xl">Every artist sees the world differently. Borrow their colours. Create your own world.</p>
      </div>

      {last && (
        <div className="bp-enter mx-auto mb-10 flex max-w-4xl flex-wrap items-center gap-5 border border-gold/40 p-4 md:mx-10 md:max-w-none lg:mx-auto lg:max-w-4xl">
          {last.url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={last.url} alt="Your last drawing" className="h-20 w-28 flex-none bg-[#F4F0E6] object-contain" />}
          <div className="min-w-0 flex-1"><p className="font-editorial text-xl">Continue where you left off</p><p className="label-mono text-[0.65rem] text-ivory/50">AUTOSAVED {new Date(last.rec.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }).toUpperCase()}</p></div>
          <button type="button" onClick={() => onStart({ kind: "resume", record: last.rec })} className="label-mono min-h-12 rounded-full bg-gold px-7 text-charcoal hover:bg-ivory">CONTINUE</button>
        </div>
      )}

      <ul className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3 md:px-10">
        {artists.map((a, i) => {
          const w = a.works[0], pv = previews[a.id];
          return (
            <li key={a.id} className="bp-enter flex flex-col border border-ivory/15 bg-gallery-dark" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="relative aspect-[4/3] bg-black/40">
                {w && <Image src={w.image} alt={`${w.title}, by ${a.name}`} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-contain" priority={i === 0} />}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-editorial text-2xl">{a.name}</h3>
                {w && <p className="label-mono mt-1 text-[0.65rem] text-ivory/55">{w.title.toUpperCase()}</p>}
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ivory/70">{a.about}</p>
                {a.status === "pending" && <p className="mt-2 text-xs text-ivory/45">Profile and attribution still being confirmed with EARTGALLA.</p>}
                <div className="mt-4 flex h-10 overflow-hidden" aria-label={`${a.name}'s palette`} role="img">
                  {pv === undefined && <div className="h-full w-full animate-pulse bg-ivory/10" />}
                  {pv === "error" && <p className="self-center text-xs text-ivory/45">Colours load when you open the studio.</p>}
                  {Array.isArray(pv) && pv.map((s) => <span key={s.hex} className="bp-enter h-full flex-1" style={{ background: s.hex }} title={s.hex} />)}
                </div>
                <button type="button" onClick={() => onStart({ kind: "new", artistId: a.id })} className="label-mono mt-5 min-h-12 w-full rounded-full border border-gold text-gold transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">BORROW THIS PALETTE</button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mx-auto mt-8 max-w-xl px-6 text-center text-xs leading-relaxed text-ivory/45">The colours are read from real artworks on this site, right here in your browser. Borrowing a palette doesn’t give anyone permission to copy or sell the original work.</p>
    </section>
  );
}
