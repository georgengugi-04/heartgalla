"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/** A dialog using the browser's own <dialog>: it traps focus, closes on Esc and returns focus when it closes. */
export default function Modal({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby="bp-modal-title"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className={`m-auto max-h-[90svh] ${wide ? "w-[min(94vw,56rem)]" : "w-[min(94vw,34rem)]"} overflow-y-auto border border-ivory/15 bg-charcoal p-0 text-ivory backdrop:bg-black/70`}
      data-theme="dark"
    >
      {open && (
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2 id="bp-modal-title" className="font-editorial text-3xl">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="label-mono -mr-2 -mt-1 min-h-11 min-w-11 text-ivory/60 hover:text-ivory">✕</button>
          </div>
          <div className="mt-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

/** `const [confirm, dialog] = useConfirm()` then `if (await confirm("…", "Clear")) …` and render `{dialog}` once. */
export function useConfirm(): [(message: string, ok: string) => Promise<boolean>, ReactNode] {
  const [state, setState] = useState<{ message: string; ok: string; resolve: (v: boolean) => void } | null>(null);
  const confirm = useCallback((message: string, ok: string) => new Promise<boolean>((resolve) => setState({ message, ok, resolve })), []);
  const done = (v: boolean) => { state?.resolve(v); setState(null); };
  const dialog = (
    <Modal open={!!state} onClose={() => done(false)} title="Are you sure?">
      <p className="text-ivory/80">{state?.message}</p>
      <div className="mt-8 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => done(false)} className="label-mono min-h-12 rounded-full border border-ivory/30 px-7 hover:border-ivory">Cancel</button>
        <button type="button" onClick={() => done(true)} className="label-mono min-h-12 rounded-full bg-gold px-7 text-charcoal hover:bg-ivory">{state?.ok}</button>
      </div>
    </Modal>
  );
  return [confirm, dialog];
}
