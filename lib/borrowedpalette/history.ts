/** Undo/redo as small reversible entries. Pixel entries hold only the changed rectangle, so long sessions stay cheap. */
export type HistoryEntry = { label: string; bytes: number; undo: () => void; redo: () => void };

export class History {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private bytes = 0;
  /** oldest entries are dropped once the stack holds more than this many bytes of pixels (or 200 entries) */
  constructor(private budgetBytes = 160 * 1024 * 1024, public onChange: () => void = () => {}) {}

  push(entry: HistoryEntry) {
    for (const e of this.redoStack) this.bytes -= e.bytes;
    this.redoStack = [];
    this.undoStack.push(entry);
    this.bytes += entry.bytes;
    while (this.undoStack.length > 1 && (this.bytes > this.budgetBytes || this.undoStack.length > 200)) this.bytes -= this.undoStack.shift()!.bytes;
    this.onChange();
  }
  undo(): string | null {
    const e = this.undoStack.pop();
    if (!e) return null;
    e.undo();
    this.redoStack.push(e);
    this.onChange();
    return e.label;
  }
  redo(): string | null {
    const e = this.redoStack.pop();
    if (!e) return null;
    e.redo();
    this.undoStack.push(e);
    this.onChange();
    return e.label;
  }
  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
  get size() { return this.undoStack.length; }
  get memory() { return this.bytes; }
  clear() { this.undoStack = []; this.redoStack = []; this.bytes = 0; this.onChange(); }
}
