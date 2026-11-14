import { ctxOf, img, StudioDoc, type CanvasFactory, type CanvasLike } from "./doc";

export type SavedMeta = {
  id: string;
  kind: "manual" | "autosave";
  title: string;
  artistId: string;
  artworkSlug: string | null;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
  thumb: Blob | null;
};
export type SavedLayer = { name: string; visible: boolean; opacity: number; locked: boolean; png: Blob };
export type SavedRecord = SavedMeta & {
  background: string | null;
  layers: SavedLayer[];
  activeIndex: number;
  /** palette, tool and experiment state: plain JSON owned by the UI */
  studio: unknown;
};

export class StorageError extends Error {
  constructor(public code: "unavailable" | "quota" | "failed", message: string) { super(message); }
}

const DB = "eartgalla-borrowed-palette", STORE = "artworks", VERSION = 1;
export const AUTOSAVE_ID = "autosave";

const wrap = (e: unknown): StorageError => {
  if (e instanceof StorageError) return e;
  const name = (e as { name?: string })?.name;
  if (name === "QuotaExceededError") return new StorageError("quota", "Your browser has no space left for more saved artwork. Delete one from My Studio, or download this one.");
  return new StorageError("failed", "Saving did not work this time. Your drawing is still on screen — try again, or download it.");
};

/** Local, on-device storage (IndexedDB). Nothing is uploaded. */
export class ArtworkStore {
  private db: Promise<IDBDatabase> | null = null;
  constructor(private idb: IDBFactory | undefined = typeof indexedDB === "undefined" ? undefined : indexedDB) {}

  private open(): Promise<IDBDatabase> {
    if (!this.idb) return Promise.reject(new StorageError("unavailable", "Saving inside the browser isn't available here (private browsing can switch it off). Use Download instead."));
    this.db ??= new Promise((resolve, reject) => {
      const req = this.idb!.open(DB, VERSION);
      req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: "id" }); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => { this.db = null; reject(new StorageError("unavailable", "Saving inside the browser isn't available here. Use Download instead.")); };
      req.onblocked = () => reject(new StorageError("failed", "Close other EARTGALLA tabs and try again."));
    });
    return this.db;
  }

  private async tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      try {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(wrap(t.error));
        t.onabort = () => reject(wrap(t.error));
      } catch (e) { reject(wrap(e)); }
    });
  }

  put(record: SavedRecord) { return this.tx("readwrite", (s) => s.put(record)).then(() => undefined).catch((e) => { throw wrap(e); }); }
  get(id: string): Promise<SavedRecord | null> { return this.tx("readonly", (s) => s.get(id)).then((r) => (r as SavedRecord | undefined) ?? null).catch((e) => { throw wrap(e); }); }
  delete(id: string) { return this.tx("readwrite", (s) => s.delete(id)).then(() => undefined).catch((e) => { throw wrap(e); }); }
  /** Newest first. Includes the autosave, so the UI can offer "continue where you left off". */
  async list(): Promise<SavedRecord[]> {
    const all = (await this.tx("readonly", (s) => s.getAll()).catch((e) => { throw wrap(e); })) as SavedRecord[];
    return all.sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export type Codec = { toBlob: (c: CanvasLike) => Promise<Blob>; decode: (b: Blob) => Promise<CanvasImageSource> };

export async function serializeDoc(doc: StudioDoc, codec: Codec): Promise<Pick<SavedRecord, "layers" | "background" | "activeIndex" | "width" | "height" | "thumb">> {
  const layers = await Promise.all(doc.layers.map(async (l) => ({ name: l.name, visible: l.visible, opacity: l.opacity, locked: l.locked, png: await codec.toBlob(l.canvas) })));
  const t = Math.min(1, 320 / Math.max(doc.width, doc.height));
  const thumb = doc.factory(Math.round(doc.width * t), Math.round(doc.height * t));
  const tc = ctxOf(thumb);
  tc.fillStyle = "#F4F0E6"; tc.fillRect(0, 0, thumb.width, thumb.height); // thumbnails always have a visible ground
  doc.renderTo(tc, t, doc.background ?? "#F4F0E6");
  return { layers, background: doc.background, activeIndex: Math.max(0, doc.layers.indexOf(doc.active)), width: doc.width, height: doc.height, thumb: await codec.toBlob(thumb) };
}

export async function restoreDoc(factory: CanvasFactory, rec: Pick<SavedRecord, "layers" | "background" | "activeIndex" | "width" | "height">, codec: Codec, onHistory?: () => void): Promise<StudioDoc> {
  const doc = new StudioDoc(factory, rec.width, rec.height, onHistory);
  doc.layers = [];
  for (const sl of rec.layers) {
    const canvas = factory(rec.width, rec.height);
    ctxOf(canvas).drawImage(await codec.decode(sl.png), 0, 0);
    doc.layers.push({ id: `r${doc.layers.length}${Date.now().toString(36)}`, name: sl.name, canvas, visible: sl.visible, opacity: sl.opacity, locked: sl.locked });
  }
  if (doc.layers.length === 0) doc.addLayer("Layer 1", false);
  doc.activeId = doc.layers[Math.min(rec.activeIndex, doc.layers.length - 1)].id;
  doc.background = rec.background;
  doc.history.clear();
  return doc;
}

/** Calls `fn` once things have been quiet for `ms`. `flush()` runs a pending call now (e.g. when the tab is closing). */
export function debounce(fn: () => void, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  const d = () => { if (t) clearTimeout(t); t = setTimeout(() => { t = null; fn(); }, ms); };
  d.flush = () => { if (t) { clearTimeout(t); t = null; fn(); } };
  d.cancel = () => { if (t) { clearTimeout(t); t = null; } };
  return d;
}
export { img };
