"use client";
import { useEffect, useState } from "react";
import type { StudioDoc } from "@/lib/borrowedpalette/doc";
import { canvasToBlob, exportFilename, renderExport, type ExportBackground } from "@/lib/borrowedpalette/export";
import type { SavedRecord } from "@/lib/borrowedpalette/persist";
import { downloadBlob } from "./browser";
import Modal from "./Modal";

const field = "min-h-11 w-full border border-ivory/25 bg-transparent px-3 text-sm focus:border-gold focus:outline-none";
const primary = "label-mono min-h-12 rounded-full bg-gold px-7 text-charcoal hover:bg-ivory disabled:opacity-40";
const ghost = "label-mono min-h-12 rounded-full border border-ivory/30 px-7 hover:border-ivory";

/* ───────────── Export ───────────── */
export function ExportDialog({ open, onClose, doc, title, creator, onTitle, onCreator, artistName, artworkTitle, palette, notify }: {
  open: boolean; onClose: () => void; doc: StudioDoc; title: string; creator: string; onTitle: (v: string) => void; onCreator: (v: string) => void;
  artistName: string; artworkTitle: string | null; palette: string[]; notify: (m: string) => void;
}) {
  const [scale, setScale] = useState<1 | 2>(1);
  const [bg, setBg] = useState<ExportBackground>("current");
  const [card, setCard] = useState(false);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canShareFiles = typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] });
  const opts = { scale, background: bg, card: card ? { title: title || "Untitled", creator: creator || "Anonymous", artistName, artworkTitle, palette, date: new Date() } : null };
  const filename = exportFilename(title || "untitled", opts);
  const px = `${doc.width * scale} × ${doc.height * scale + (card ? Math.round(doc.width * scale * 0.2) : 0)}`;

  const make = async () => canvasToBlob(renderExport(doc, opts));
  const download = async () => {
    setBusy("download"); setError(null);
    try { downloadBlob(await make(), filename); notify("Exported. Check your downloads."); onClose(); }
    catch (e) { setError(`${(e as Error).message} Try the standard size or a smaller canvas.`); }
    finally { setBusy(null); }
  };
  const share = async () => {
    setBusy("share"); setError(null);
    try {
      const blob = await make();
      await navigator.share({ files: [new File([blob], filename, { type: "image/png" })], title: title || "My Borrowed Palette artwork", text: `Made in the EARTGALLA Art Lab with colours borrowed from ${artistName}.` });
      onClose();
    } catch (e) { if ((e as Error).name !== "AbortError") setError("Sharing didn’t work here. Use Download instead."); }
    finally { setBusy(null); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Export your artwork">
      <div className="space-y-5">
        <fieldset><legend className="label-mono mb-2 text-[0.65rem] text-ivory/60">BACKGROUND</legend>
          <div className="flex flex-wrap gap-2">{([["current", "As on canvas"], ["white", "White"], ["transparent", "Transparent"]] as const).map(([v, l]) => (
            <label key={v} className={`label-mono flex min-h-11 cursor-pointer items-center border px-4 text-[0.7rem] ${bg === v ? "border-gold text-gold" : "border-ivory/25 text-ivory/75"}`}><input type="radio" name="bp-bg" className="sr-only" checked={bg === v} onChange={() => setBg(v)} />{l.toUpperCase()}</label>
          ))}</div>
        </fieldset>
        <fieldset><legend className="label-mono mb-2 text-[0.65rem] text-ivory/60">SIZE</legend>
          <div className="flex flex-wrap gap-2">{([[1, "Standard"], [2, "Large (2×)"]] as const).map(([v, l]) => (
            <label key={v} className={`label-mono flex min-h-11 cursor-pointer items-center border px-4 text-[0.7rem] ${scale === v ? "border-gold text-gold" : "border-ivory/25 text-ivory/75"}`}><input type="radio" name="bp-scale" className="sr-only" checked={scale === v} onChange={() => setScale(v)} />{l.toUpperCase()}</label>
          ))}</div>
          <p className="mt-2 text-xs text-ivory/50">{px} px. “Large” enlarges smoothly; it can’t add detail you didn’t draw. For more detail, start a High-quality canvas.</p>
        </fieldset>
        <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={card} onChange={(e) => setCard(e.target.checked)} className="h-5 w-5 accent-[var(--color-gold)]" /> Add an information card under the picture</label>
        {card && (
          <div className="grid gap-3 border border-ivory/15 p-4 sm:grid-cols-2">
            <div><label htmlFor="bp-t" className="label-mono text-[0.65rem] text-ivory/50">TITLE</label><input id="bp-t" value={title} maxLength={60} onChange={(e) => onTitle(e.target.value)} placeholder="Untitled" className={field} /></div>
            <div><label htmlFor="bp-c" className="label-mono text-[0.65rem] text-ivory/50">YOUR NAME (OPTIONAL)</label><input id="bp-c" value={creator} maxLength={40} onChange={(e) => onCreator(e.target.value)} placeholder="Anonymous" className={field} /></div>
            <p className="text-xs text-ivory/55 sm:col-span-2">The card credits {artistName} for the colours, shows your palette and the date, and carries the EARTGALLA name. It doesn’t say {artistName.split(" ")[0]} made your picture.</p>
          </div>
        )}
        {error && <p role="alert" className="border border-kenya-red/60 p-3 text-sm">{error}</p>}
        <div className="flex flex-wrap justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className={ghost}>Cancel</button>
          {canShareFiles && <button type="button" onClick={share} disabled={!!busy} className={ghost}>{busy === "share" ? "Preparing…" : "Share…"}</button>}
          <button type="button" onClick={download} disabled={!!busy} className={primary}>{busy === "download" ? "Preparing…" : "Download PNG"}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ───────────── Save to My Studio ───────────── */
export function SaveDialog({ open, onClose, title, onTitle, onSave, saving, error }: { open: boolean; onClose: () => void; title: string; onTitle: (v: string) => void; onSave: () => void; saving: boolean; error: string | null }) {
  return (
    <Modal open={open} onClose={onClose} title="Save to My Studio">
      <p className="text-sm text-ivory/70">Saved on this device only, so you can come back to it. To keep a copy anywhere else, use Export.</p>
      <label htmlFor="bp-st" className="label-mono mt-5 block text-[0.65rem] text-ivory/50">TITLE</label>
      <input id="bp-st" value={title} maxLength={60} onChange={(e) => onTitle(e.target.value)} placeholder="Untitled" className={field} autoFocus />
      {error && <p role="alert" className="mt-4 border border-kenya-red/60 p-3 text-sm">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className={ghost}>Cancel</button>
        <button type="button" onClick={onSave} disabled={saving} className={primary}>{saving ? "Saving…" : error ? "Try again" : "Save"}</button>
      </div>
    </Modal>
  );
}

/* ───────────── My Studio (saved list) ───────────── */
export function MyStudioDialog({ open, onClose, items, onOpen, onDelete, loading, error, onRetry }: {
  open: boolean; onClose: () => void; items: SavedRecord[]; onOpen: (r: SavedRecord) => void; onDelete: (r: SavedRecord) => void; loading: boolean; error: string | null; onRetry: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="My Studio" wide>
      {loading && <p role="status" className="text-ivory/60">Looking through your saved work…</p>}
      {error && <div role="alert" className="border border-kenya-red/60 p-4 text-sm"><p>{error}</p><button type="button" onClick={onRetry} className="label-mono mt-3 min-h-11 border border-ivory/40 px-5 hover:border-gold">TRY AGAIN</button></div>}
      {!loading && !error && items.length === 0 && <p className="text-ivory/65">Nothing saved yet. Press Save in the toolbar and your picture will appear here.</p>}
      <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((r) => (
          <li key={r.id} className="border border-ivory/15">
            <button type="button" onClick={() => onOpen(r)} className="block w-full text-left hover:bg-ivory/5" aria-label={`Open ${r.kind === "autosave" ? "your last session" : r.title || "Untitled"}`}>
              <span className="relative block aspect-[4/3] bg-[#F4F0E6]">{r.thumb && <Thumb key={`${r.id}-${r.updatedAt}`} blob={r.thumb} />}</span>
              <span className="block p-3"><span className="block truncate font-editorial text-lg">{r.kind === "autosave" ? "Last session (autosave)" : r.title || "Untitled"}</span>
                <span className="label-mono block text-[0.6rem] text-ivory/50">{new Date(r.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }).toUpperCase()}</span></span>
            </button>
            {r.kind !== "autosave" && <button type="button" onClick={() => onDelete(r)} className="label-mono min-h-11 w-full border-t border-ivory/10 text-[0.65rem] text-ivory/55 hover:text-kenya-red" aria-label={`Delete ${r.title || "Untitled"}`}>DELETE</button>}
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/** A saved picture's thumbnail. Owns its temporary image address and releases it when it goes away. */
function Thumb({ blob }: { blob: Blob }) {
  const [url] = useState(() => URL.createObjectURL(blob));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-full w-full object-contain" />;
}

/* ───────────── New canvas ───────────── */
export type CanvasSpec = { orientation: "landscape" | "portrait" | "square"; quality: "standard" | "high" };
export const canvasSize = (s: CanvasSpec): [number, number] => {
  const long = s.quality === "high" ? 2400 : 1600;
  if (s.orientation === "square") { const n = Math.round(long * 0.8); return [n, n]; }
  const short = Math.round(long * 0.75);
  return s.orientation === "landscape" ? [long, short] : [short, long];
};
export function NewCanvasDialog({ open, onClose, onCreate, current }: { open: boolean; onClose: () => void; onCreate: (s: CanvasSpec) => void; current: CanvasSpec }) {
  const [spec, setSpec] = useState<CanvasSpec>(current);
  const opt = <T extends string>(name: string, value: T, cur: T, label: string, set: (v: T) => void) => (
    <label key={value} className={`label-mono flex min-h-11 cursor-pointer items-center border px-4 text-[0.7rem] ${cur === value ? "border-gold text-gold" : "border-ivory/25 text-ivory/75"}`}><input type="radio" name={name} className="sr-only" checked={cur === value} onChange={() => set(value)} />{label.toUpperCase()}</label>
  );
  const [w, h] = canvasSize(spec);
  return (
    <Modal open={open} onClose={onClose} title="New canvas">
      <p className="text-sm text-ivory/70">This starts a fresh, empty picture. Your palette stays. If the current drawing hasn’t been saved, it will be replaced.</p>
      <fieldset className="mt-5"><legend className="label-mono mb-2 text-[0.65rem] text-ivory/60">SHAPE</legend>
        <div className="flex flex-wrap gap-2">{(["landscape", "portrait", "square"] as const).map((o) => opt("bp-o", o, spec.orientation, o, (v) => setSpec({ ...spec, orientation: v })))}</div></fieldset>
      <fieldset className="mt-4"><legend className="label-mono mb-2 text-[0.65rem] text-ivory/60">QUALITY</legend>
        <div className="flex flex-wrap gap-2">{(["standard", "high"] as const).map((o) => opt("bp-q", o, spec.quality, o, (v) => setSpec({ ...spec, quality: v })))}</div>
        <p className="mt-2 text-xs text-ivory/50">{w} × {h} px. High has more detail but uses more memory, so it can be slow on older phones.</p></fieldset>
      <div className="mt-8 flex justify-end gap-3"><button type="button" onClick={onClose} className={ghost}>Cancel</button><button type="button" onClick={() => onCreate(spec)} className={primary}>Create</button></div>
    </Modal>
  );
}
