"use client";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { parseHex, rgbToHex, sameRgb, type RGB } from "@/lib/borrowedpalette/color";
import { StudioDoc } from "@/lib/borrowedpalette/doc";
import { BRUSH_DEFAULTS, isPaintTool, type BrushSettings, type PaintTool, type ToolId } from "@/lib/borrowedpalette/engine";
import { selectPalette, swatchFromHex } from "@/lib/borrowedpalette/extract";
import { emptyModel, LIMITED_COUNT, paletteReducer, type PaletteModel } from "@/lib/borrowedpalette/paletteModel";
import { ArtworkStore, AUTOSAVE_ID, debounce, restoreDoc, serializeDoc, StorageError, type SavedRecord } from "@/lib/borrowedpalette/persist";
import type { StudioArtist } from "@/lib/borrowedpalette/artworks";
import { analyseUrl, domCodec, domFactory, type Crop } from "./browser";
import type { Start } from "./ArtistGate";
import DrawingStage, { type StageHandle } from "./DrawingStage";
import { canvasSize, ExportDialog, MyStudioDialog, NewCanvasDialog, SaveDialog, type CanvasSpec } from "./Dialogs";
import { BrushPanel, CanvasPanel, ColourInspector, EvolutionControls, LayerPanel } from "./Inspector";
import { useConfirm } from "./Modal";
import PalettePanel from "./PalettePanel";
import ToolBar, { type Panel } from "./ToolBar";
import { MODES, type Mode, type StudioSnapshot } from "./types";

const DEFAULT_SPEC: CanvasSpec = { orientation: "landscape", quality: "standard" };
const defaultTools = (): Record<PaintTool, BrushSettings> => Object.fromEntries((Object.keys(BRUSH_DEFAULTS) as PaintTool[]).map((k) => { const { min: _a, max: _b, ...s } = BRUSH_DEFAULTS[k]; void _a; void _b; return [k, s]; })) as Record<PaintTool, BrushSettings>;
const KEY = "eg-bp-palettes";
type SavedPalette = { id: string; name: string; colors: string[] };
const readPalettes = (): SavedPalette[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; } };
const writePalettes = (p: SavedPalette[]) => { try { localStorage.setItem(KEY, JSON.stringify(p)); return true; } catch { return false; } };

export default function Studio({ start, artists, onExit }: { start: Start; artists: StudioArtist[]; onExit: () => void }) {
  const resume = start.kind === "resume" ? start.record : null;
  const snapIn = (resume?.studio ?? null) as StudioSnapshot | null;
  const artistId = snapIn?.artistId ?? (start.kind === "new" ? start.artistId : artists[0].id);
  const artist = artists.find((a) => a.id === artistId) ?? artists[0];

  const [, bump] = useReducer((n: number) => n + 1, 0);
  const [doc, setDoc] = useState<StudioDoc | null>(() => (start.kind === "new" ? new StudioDoc(domFactory, ...canvasSize(DEFAULT_SPEC), bump) : null));
  const [spec, setSpec] = useState<CanvasSpec>(DEFAULT_SPEC);
  const [workSlug, setWorkSlug] = useState(snapIn?.workSlug ?? artist.defaultSlug);
  const work = artist.works.find((w) => w.slug === workSlug) ?? artist.works[0];
  const [crop, setCrop] = useState<Crop | null>(snapIn?.crop ?? null);
  const [ignoreBg, setIgnoreBg] = useState(snapIn?.ignoreBg ?? true);
  const [model, dispatch] = useReducer(paletteReducer, undefined, () => snapIn?.model ?? emptyModel());
  const [mode, setMode] = useState<Mode>(snapIn?.mode ?? "free");
  const [color, setColor] = useState<RGB>(snapIn?.color ?? { r: 184, g: 151, b: 79 });
  const [tool, setTool] = useState<ToolId>(snapIn?.tool ?? "brush");
  const [tools, setTools] = useState<Record<PaintTool, BrushSettings>>(snapIn?.tools ?? defaultTools());
  const [title, setTitle] = useState(snapIn?.title ?? "");
  const [creator, setCreator] = useState(snapIn?.creator ?? "");
  const [grid, setGrid] = useState(snapIn?.grid ?? false);
  const [zoom, setZoom] = useState(100);
  const [panel, setPanel] = useState<Panel>(null);
  const [showRef, setShowRef] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dialog, setDialog] = useState<"export" | "save" | "studio" | "new" | null>(null);
  const [saveState, setSaveState] = useState<{ kind: "idle" | "saving" | "saved" | "error"; message?: string; at?: number }>({ kind: "idle" });
  const [items, setItems] = useState<SavedRecord[]>([]);
  const [listState, setListState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>(() => readPalettes());
  const [started, setStarted] = useState(!!resume);
  const [retry, setRetry] = useState(0);
  const [done, setDone] = useState<{ key: string; error?: string; bg: string | null } | null>(resume ? { key: "resume", bg: null } : null);
  const [confirm, confirmDialog] = useConfirm();

  const stage = useRef<StageHandle>(null);
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const store = useMemo(() => new ArtworkStore(), []);
  const touched = useRef(false); // has the person made anything yet?
  const dirty = useRef(false);   // anything since the last manual save?
  const savedId = useRef<string | null>(resume && resume.kind === "manual" ? resume.id : null);
  const [createdAt0] = useState(() => resume?.createdAt ?? Date.now());
  const createdAt = useRef<number>(createdAt0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doneRef = useRef(done); useEffect(() => { doneRef.current = done; });
  const modelRef = useRef<PaletteModel>(model); useEffect(() => { modelRef.current = model; });

  const notify = useCallback((m: string) => {
    setToast(m);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  /* ── restoring a saved session ── */
  const applySnapshot = useCallback((s: StudioSnapshot | null) => {
    if (!s) return;
    setWorkSlug(s.workSlug); setCrop(s.crop); setIgnoreBg(s.ignoreBg); setMode(s.mode); setColor(s.color); setTool(s.tool); setTools(s.tools); setTitle(s.title); setCreator(s.creator); setGrid(s.grid);
    dispatch({ type: "hydrate", model: s.model });
    setDone({ key: "resume", bg: null });
  }, []);
  useEffect(() => {
    if (!resume) return;
    let cancelled = false;
    restoreDoc(domFactory, resume, domCodec, bump).then((d) => { if (!cancelled) { setDoc(d); touched.current = true; setStarted(true); } }).catch(() => { if (!cancelled) { notify("That drawing couldn’t be opened. Starting fresh."); setDoc(new StudioDoc(domFactory, ...canvasSize(DEFAULT_SPEC), bump)); } });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => doc?.subscribe(bump), [doc]);

  /* ── reading the artwork's colours ── */
  const key = `${work.image}|${crop ? [crop.x, crop.y, crop.w, crop.h].map((n) => n.toFixed(3)).join(",") : "all"}|${ignoreBg}|${retry}`;
  useEffect(() => {
    if (doneRef.current && (doneRef.current.key === key || doneRef.current.key === "resume")) { if (doneRef.current.key === "resume") setDone({ key, bg: null }); return; }
    let cancelled = false;
    analyseUrl(work.image, crop, ignoreBg).then((a) => {
      if (cancelled) return;
      if (a.pool.length === 0) { setDone({ key, error: "No colours could be found in that area. Try a larger area.", bg: null }); return; }
      dispatch({ type: "load", pool: a.pool, size: modelRef.current.size });
      const first = selectPalette(a.pool, modelRef.current.size)[0];
      if (first) setColor(first.rgb);
      setDone({ key, bg: a.background?.hex ?? null });
    }).catch((e: Error) => { if (!cancelled) setDone({ key, error: e.message, bg: null }); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const status: "loading" | "ready" | "error" = done?.key === key ? (done.error ? "error" : "ready") : done?.key === "resume" ? "ready" : "loading";

  /* ── what colours may be used right now ── */
  const allowed: RGB[] | null = mode === "translate" ? model.entries.map((e) => e.rgb) : mode === "limited" ? model.entries.filter((e) => model.limited.includes(e.id)).map((e) => e.rgb) : null;
  const paintColor = allowed && allowed.length > 0 && !allowed.some((a) => sameRgb(a, color)) ? allowed[0] : color;
  const blockedReason = mode === "limited" && model.limited.length === 0 ? `Choose up to ${LIMITED_COUNT} colours from the palette to begin.` : allowed && allowed.length === 0 ? "The palette isn’t ready yet." : null;
  const chooseColor = (c: RGB) => { if (allowed && !allowed.some((a) => sameRgb(a, c))) { notify(mode === "limited" ? "In this challenge you stay inside your three colours." : "In Colour Translation you stay inside the palette."); return; } setColor(c); };
  const changeMode = (m: Mode) => { setMode(m); setShowRef(false); if (m === "translate" && model.entries[0] && !model.entries.some((e) => sameRgb(e.rgb, color))) setColor(model.entries[0].rgb); };
  const toolForPick: ToolId = (mode === "translate" || mode === "limited") && tool === "picker" ? "brush" : tool;

  /* ── saving ── */
  const snapshot: StudioSnapshot = { artistId: artist.id, workSlug: work.slug, crop, ignoreBg, model, mode, color, tool, tools, title, creator, grid };
  const snapRef = useRef(snapshot); useEffect(() => { snapRef.current = snapshot; });
  const docRef = useRef(doc); useEffect(() => { docRef.current = doc; });
  const writeAutosave = useCallback(async () => {
    const d = docRef.current; if (!d || !touched.current) return;
    setSaveState({ kind: "saving" });
    try {
      const ser = await serializeDoc(d, domCodec);
      const s = snapRef.current;
      await store.put({ id: AUTOSAVE_ID, kind: "autosave", title: s.title, artistId: s.artistId, artworkSlug: s.workSlug, createdAt: createdAt.current, updatedAt: Date.now(), studio: s, ...ser });
      setSaveState({ kind: "saved", at: Date.now() });
    } catch (e) { setSaveState({ kind: "error", message: e instanceof StorageError ? e.message : "Autosave didn’t work." }); }
  }, [store]);
  const writeRef = useRef(writeAutosave); useEffect(() => { writeRef.current = writeAutosave; });
  const autosaveRef = useRef<ReturnType<typeof debounce> | null>(null);
  useEffect(() => { const d = debounce(() => void writeRef.current(), 2500); autosaveRef.current = d; return () => { d.flush(); autosaveRef.current = null; }; }, []);
  const autosave = useCallback(() => autosaveRef.current?.(), []);
  useEffect(() => doc?.subscribe(() => { touched.current = true; dirty.current = true; setStarted(true); autosave(); }), [doc, autosave]);
  useEffect(() => { if (touched.current) autosave(); }, [model, mode, color, tool, tools, title, creator, grid, crop, ignoreBg, workSlug, autosave]);
  useEffect(() => {
    const flush = () => { if (document.visibilityState === "hidden") autosaveRef.current?.flush(); };
    const flushNow = () => autosaveRef.current?.flush();
    document.addEventListener("visibilitychange", flush); window.addEventListener("pagehide", flushNow);
    return () => { document.removeEventListener("visibilitychange", flush); window.removeEventListener("pagehide", flushNow); };
  }, []);

  const saveManual = async (name = title, asCopy = false) => {
    if (!doc) return false;
    setSaveState({ kind: "saving" });
    try {
      const ser = await serializeDoc(doc, domCodec);
      const id = asCopy || !savedId.current ? `art-${Date.now().toString(36)}` : savedId.current;
      const rec: SavedRecord = { id, kind: "manual", title: name || "Untitled", artistId: artist.id, artworkSlug: work.slug, createdAt: asCopy ? Date.now() : createdAt.current, updatedAt: Date.now(), studio: snapshot, ...ser };
      await store.put(rec);
      if (!asCopy) { savedId.current = id; dirty.current = false; }
      setSaveState({ kind: "saved", at: Date.now() });
      return true;
    } catch (e) { const m = e instanceof StorageError ? e.message : "Saving didn’t work."; setSaveState({ kind: "error", message: m }); return false; }
  };
  const [saving, setSaving] = useState(false);
  const doSave = async () => { setSaving(true); const ok = await saveManual(); setSaving(false); if (ok) { setDialog(null); notify("Saved to My Studio."); } };

  const loadList = useCallback(async () => {
    setListState({ loading: true, error: null });
    try { setItems(await store.list()); setListState({ loading: false, error: null }); }
    catch (e) { setListState({ loading: false, error: e instanceof StorageError ? e.message : "Couldn’t read your saved work." }); }
  }, [store]);
  const openStudio = () => { setDialog("studio"); void loadList(); };
  const openRecord = async (r: SavedRecord) => {
    if (dirty.current && touched.current && !(await confirm("Opening another drawing replaces this one. Anything you haven’t saved to My Studio will be lost.", "Open it"))) return;
    try {
      const d = await restoreDoc(domFactory, r, domCodec, bump);
      setDoc(d); applySnapshot(r.studio as StudioSnapshot);
      savedId.current = r.kind === "manual" ? r.id : null; createdAt.current = r.createdAt; dirty.current = false; touched.current = true;
      setDialog(null); notify("Opened.");
    } catch { notify("That drawing couldn’t be opened."); }
  };
  const deleteRecord = async (r: SavedRecord) => {
    if (!(await confirm(`Delete “${r.title || "Untitled"}” from My Studio? This can’t be undone.`, "Delete"))) return;
    try { await store.delete(r.id); if (savedId.current === r.id) savedId.current = null; await loadList(); } catch { notify("Couldn’t delete that one. Try again."); }
  };
  const newCanvas = async (s: CanvasSpec) => {
    if (dirty.current && touched.current && !(await confirm("A new canvas replaces this drawing. Anything you haven’t saved to My Studio will be lost.", "Start new"))) return;
    setSpec(s); setDoc(new StudioDoc(domFactory, ...canvasSize(s), bump));
    savedId.current = null; createdAt.current = Date.now(); dirty.current = false; touched.current = false; setStarted(false); setDialog(null); setZoom(100);
  };
  const clearAll = async () => { if (doc && (await confirm("Clear every layer? You can still undo this straight afterwards.", "Clear canvas"))) doc.clearAll(); };
  const duplicateArtwork = async () => { if (await saveManual(`${title || "Untitled"} copy`, true)) notify("A copy was saved to My Studio."); };

  /* ── my palettes ── */
  const savePalette = () => {
    const colors = model.entries.map((e) => rgbToHex(e.rgb));
    const next = [{ id: `p${Date.now().toString(36)}`, name: `${artist.name.split(" ")[0]} · ${work.title}`, colors }, ...savedPalettes].slice(0, 12);
    setSavedPalettes(next); notify(writePalettes(next) ? "Palette saved on this device." : "Couldn’t save the palette (storage is blocked).");
  };
  const applySaved = (colors: string[]) => {
    const rgbs = colors.map((c) => parseHex(c)).filter((c): c is RGB => !!c);
    const pool = rgbs.map((c, i) => swatchFromHex(rgbToHex(c), 1 / rgbs.length - i * 1e-6)!).filter(Boolean);
    if (pool.length === 0) return;
    dispatch({ type: "load", pool, size: Math.min(16, pool.length) }); setColor(pool[0].rgb); notify("Saved palette loaded.");
  };

  /* ── drawing helpers ── */
  const undo = () => { doc?.history.undo(); };
  const redo = () => { doc?.history.redo(); };
  const setBrush = (t: PaintTool, v: Partial<BrushSettings>) => setTools((p) => ({ ...p, [t]: { ...p[t], ...v } }));
  const settings = isPaintTool(toolForPick) ? tools[toolForPick] : tools.brush;
  const onStrokeEnd = useCallback(() => { touched.current = true; dirty.current = true; setStarted(true); bump(); }, []);

  useEffect(() => {
    const keys: Record<string, ToolId> = { b: "brush", s: "soft", p: "pencil", m: "marker", l: "liner", e: "eraser", g: "fill", i: "picker", h: "hand" };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest?.("input, textarea, select, [contenteditable], dialog")) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) docRef.current?.history.redo(); else docRef.current?.history.undo(); return; }
      if (mod && e.key.toLowerCase() === "y") { e.preventDefault(); docRef.current?.history.redo(); return; }
      if (mod || e.altKey) return;
      const k = e.key.toLowerCase();
      if (keys[k]) { setTool(keys[k]); return; }
      if (k === "0") stage.current?.fit();
      else if (k === "=" || k === "+") stage.current?.zoomBy(1.25);
      else if (k === "-") stage.current?.zoomBy(0.8);
      else if (k === "[" || k === "]") setTools((p) => { const cur = isPaintTool(tool) ? tool : "brush"; const d = BRUSH_DEFAULTS[cur]; const step = Math.max(1, Math.round(p[cur].size * 0.15)); return { ...p, [cur]: { ...p[cur], size: Math.min(d.max, Math.max(d.min, p[cur].size + (k === "]" ? step : -step))) } }; });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool]);

  useEffect(() => {
    root.current?.scrollIntoView({ block: "start", behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, []);
  useEffect(() => {
    const el = bar.current, host = root.current;
    if (!el || !host || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => host.style.setProperty("--bp-bar", `${el.getBoundingClientRect().height}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc]);

  if (!doc) return <div role="status" className="py-32 text-center text-ivory/60">Opening your drawing…</div>;

  const hasWork = doc.history.size > 0;
  const modeInfo = MODES.find((m) => m.id === mode)!;
  const restricted = mode === "translate" || mode === "limited";
  const aside = (open: boolean, extra = "") => `${open ? "fixed" : "hidden"} inset-x-0 bottom-[var(--bp-bar,7rem)] z-40 max-h-[62svh] overflow-y-auto overscroll-contain border-t border-gold/40 bg-charcoal p-5 shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.7)] lg:static lg:z-auto lg:block lg:max-h-[calc(100svh-18.5rem)] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none ${extra}`;

  return (
    <section ref={root} className="bp-enter scroll-mt-20 border-t border-ivory/10" aria-label="The Borrowed Palette studio">
      {/* header */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 md:px-10">
        <button type="button" onClick={async () => { if (touched.current && dirty.current && !(await confirm("Go back to the artists? Your drawing is autosaved on this device, and you can continue it later.", "Go back"))) return; autosaveRef.current?.flush(); onExit(); }} className="label-mono min-h-11 text-ivory/60 hover:text-ivory">← ARTISTS</button>
        <div className="min-w-0 flex-1">
          <label htmlFor="bp-title-in" className="sr-only">Artwork title</label>
          <input id="bp-title-in" value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled artwork" className="font-editorial w-full min-w-0 bg-transparent text-xl placeholder:text-ivory/35 focus:outline-none md:text-2xl" />
          <p className="label-mono truncate text-[0.65rem] text-ivory/50">COLOURS BORROWED FROM {artist.name.toUpperCase()} · {work.title.toUpperCase()}</p>
        </div>
        <SaveBadge state={saveState} onRetry={() => void writeAutosave()} />
      </div>

      {/* experiments */}
      <div className="border-y border-ivory/10 px-4 py-3 md:px-10">
        <div className="flex items-center gap-2 overflow-x-auto md:flex-wrap" role="group" aria-label="Creative experiments">
          {MODES.map((m) => <button key={m.id} type="button" onClick={() => changeMode(m.id)} aria-pressed={mode === m.id} className={`label-mono min-h-11 flex-none border px-4 text-[0.7rem] transition-colors ${mode === m.id ? "border-gold bg-gold/10 text-gold" : "border-ivory/20 text-ivory/65 hover:border-ivory/50"}`}>{m.label.toUpperCase()}</button>)}
          <p className="hidden min-w-[14rem] flex-1 text-sm text-ivory/65 md:block"><span className="font-editorial text-ivory">{modeInfo.title}.</span> {modeInfo.how}</p>
        </div>
        <p className="mt-2 text-sm text-ivory/65 md:hidden"><span className="font-editorial text-ivory">{modeInfo.title}.</span> {modeInfo.how}</p>
        {mode === "evolve" && <div className="mt-3 max-w-xl"><EvolutionControls model={model} dispatch={dispatch} /></div>}
        {mode === "limited" && <p className="label-mono mt-2 text-[0.65rem] text-gold">{model.limited.length < LIMITED_COUNT ? `CHOSEN ${model.limited.length} OF ${LIMITED_COUNT} — TAP COLOURS IN THE PALETTE` : "YOUR THREE ARE CHOSEN — NOW MAKE SOMETHING WITH ONLY THESE. TAP A CHOSEN COLOUR TO SWAP IT."}</p>}
        {mode === "translate" && <button type="button" onClick={() => setShowRef((v) => !v)} className="label-mono mt-2 min-h-11 text-[0.7rem] text-gold hover:underline lg:hidden">{showRef ? "HIDE THE ORIGINAL" : "SHOW THE ORIGINAL"}</button>}
      </div>

      <div className="grid gap-0 lg:grid-cols-[17.5rem_minmax(0,1fr)_19rem] lg:gap-6 lg:px-6 lg:py-5">
        {/* left: artist + palette */}
        <aside className={aside(panel === "palette", "lg:overflow-y-auto lg:pr-2")} aria-label="Artist and palette">
          <PalettePanel artist={artist} work={work} onWork={(s) => { setWorkSlug(s); setCrop(null); }} crop={crop} onCrop={setCrop} ignoreBg={ignoreBg} onIgnoreBg={setIgnoreBg}
            status={status} error={done?.error ?? null} onRetry={() => setRetry((n) => n + 1)} backgroundFound={done?.bg ?? null}
            model={model} dispatch={dispatch} color={paintColor} onColor={mode === "limited" ? setColor : chooseColor} mode={mode}
            savedPalettes={savedPalettes} onSavePalette={savePalette} onApplySaved={applySaved} onDeleteSaved={(id) => { const n = savedPalettes.filter((p) => p.id !== id); setSavedPalettes(n); writePalettes(n); }} />
        </aside>

        {/* centre: canvas (+ original beside it in Colour Translation) */}
        <div className={`min-w-0 ${mode === "translate" ? "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2.3fr)] lg:gap-4" : ""}`}>
          {mode === "translate" && (
            <figure className={`${showRef ? "fixed inset-x-3 top-24 z-40 max-h-[70svh]" : "hidden"} overflow-auto border border-gold/40 bg-charcoal p-3 lg:static lg:block lg:max-h-none lg:border-ivory/15`}>
              <div className="relative aspect-[4/5] w-full bg-black/40"><Image src={work.image} alt={`The original: ${work.title} by ${artist.name}`} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-contain" /></div>
              <figcaption className="label-mono mt-2 text-[0.65rem] text-ivory/60">THE ORIGINAL · {artist.name.toUpperCase()} · {work.title.toUpperCase()}</figcaption>
              {showRef && <button type="button" onClick={() => setShowRef(false)} className="label-mono mt-2 min-h-11 w-full border border-ivory/30 lg:hidden">CLOSE</button>}
            </figure>
          )}
          <div className="relative h-[58svh] min-h-[22rem] bg-[#1b1b1b] lg:h-[calc(100svh-18.5rem)] lg:min-h-[30rem]">
            <DrawingStage ref={stage} doc={doc} tool={toolForPick} settings={settings} color={paintColor} grid={grid} blockedReason={restricted ? blockedReason : null}
              onStrokeEnd={onStrokeEnd} onPicked={(c) => { setColor(c); notify(`Picked ${rgbToHex(c)}`); }} onNotice={notify} onScale={setZoom} />
            {!hasWork && !started && status !== "loading" && (
              <p aria-hidden className="bp-enter pointer-events-none absolute inset-x-0 top-5 text-center font-editorial text-lg italic text-ivory/45">Pick a colour. Start anywhere.</p>
            )}
            <div role="status" aria-live="polite" className={`pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4 transition-opacity ${toast ? "opacity-100" : "opacity-0"}`}>
              {toast && <p className="bp-pop max-w-md border border-gold/60 bg-charcoal px-4 py-2 text-center text-sm text-ivory">{toast}</p>}
            </div>
          </div>
        </div>

        {/* right: colour, brush, layers, canvas */}
        <div className="min-w-0 lg:max-h-[calc(100svh-18.5rem)] lg:space-y-8 lg:overflow-y-auto lg:pl-2">
          <aside className={`${aside(panel === "brush")} space-y-8`} aria-label="Colour and brush">
            <ColourInspector model={model} dispatch={dispatch} color={paintColor} onColor={chooseColor} mode={mode} notify={notify} />
            <BrushPanel tool={toolForPick} tools={tools} onChange={setBrush} />
            <CanvasPanel doc={doc} grid={grid} onGrid={setGrid} onClear={clearAll} onDuplicate={duplicateArtwork} onNew={() => setDialog("new")} />
          </aside>
          <aside className={aside(panel === "layers")} aria-label="Layers"><LayerPanel doc={doc} notify={notify} /></aside>
        </div>
      </div>

      {panel && <button type="button" aria-label="Close panel" onClick={() => setPanel(null)} className="fixed inset-0 z-30 bg-black/50 lg:hidden" />}

      <ToolBar ref={bar} tool={toolForPick} onTool={(t) => { if (restricted && t === "picker") { notify("The picker is off in this challenge: you stay inside the palette."); return; } setTool(t); }}
        canUndo={doc.history.canUndo} canRedo={doc.history.canRedo} onUndo={undo} onRedo={redo}
        zoom={zoom} onZoomIn={() => stage.current?.zoomBy(1.25)} onZoomOut={() => stage.current?.zoomBy(0.8)} onFit={() => stage.current?.fit()} onReset={() => stage.current?.reset()}
        onSave={() => setDialog("save")} onExport={() => setDialog("export")} onMyStudio={openStudio}
        panel={panel} onPanel={setPanel} color={rgbToHex(paintColor)}
        swatches={(mode === "limited" ? model.entries.filter((e) => model.limited.includes(e.id)) : model.entries).map((e) => ({ hex: rgbToHex(e.rgb), active: sameRgb(e.rgb, paintColor), onPick: () => chooseColor(e.rgb) }))}
        swatchHint={mode === "limited" ? "Open PALETTE and choose 3 colours" : null} referenceButton={mode === "translate" ? { shown: showRef, onClick: () => setShowRef((v) => !v) } : null} />

      <ExportDialog open={dialog === "export"} onClose={() => setDialog(null)} doc={doc} title={title} creator={creator} onTitle={setTitle} onCreator={setCreator}
        artistName={artist.name} artworkTitle={work.title} palette={model.entries.map((e) => rgbToHex(e.rgb))} notify={notify} />
      <SaveDialog open={dialog === "save"} onClose={() => setDialog(null)} title={title} onTitle={setTitle} onSave={doSave} saving={saving} error={saveState.kind === "error" ? saveState.message ?? null : null} />
      <MyStudioDialog open={dialog === "studio"} onClose={() => setDialog(null)} items={items} onOpen={openRecord} onDelete={deleteRecord} loading={listState.loading} error={listState.error} onRetry={loadList} />
      <NewCanvasDialog key={dialog === "new" ? "open" : "closed"} open={dialog === "new"} onClose={() => setDialog(null)} onCreate={newCanvas} current={spec} />
      {confirmDialog}
    </section>
  );
}

function SaveBadge({ state, onRetry }: { state: { kind: string; message?: string }; onRetry: () => void }) {
  if (state.kind === "idle") return null;
  return (
    <p role="status" className={`label-mono flex items-center gap-2 text-[0.65rem] ${state.kind === "error" ? "text-kenya-red" : "text-ivory/50"}`}>
      {state.kind === "saving" && "SAVING…"}{state.kind === "saved" && "AUTOSAVED ON THIS DEVICE"}
      {state.kind === "error" && <><span>{state.message?.toUpperCase()}</span><button type="button" onClick={onRetry} className="min-h-11 px-2 underline">RETRY</button></>}
    </p>
  );
}
