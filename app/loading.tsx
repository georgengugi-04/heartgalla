/** A quiet loading state: a label and a hairline. (Reduced-motion users get it without the pulse — see globals.css.) */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] flex-col items-center justify-center gap-5 pt-32">
      <p className="label-mono text-ivory/60">Loading</p>
      <span aria-hidden="true" className="block h-px w-24 animate-pulse bg-gold/70" />
    </div>
  );
}
