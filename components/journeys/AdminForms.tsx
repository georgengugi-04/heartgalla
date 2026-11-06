"use client";
import { useActionState } from "react";
import { createQuotation, signIn, updateInquiryStatus, type FormState } from "@/app/journeys/admin/actions";

const field = "mt-2 block min-h-12 w-full border border-ivory/20 bg-transparent px-4 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
const primary = "label-mono min-h-12 rounded-full bg-gold px-8 text-charcoal transition-colors hover:bg-ivory disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
const Msg = ({ s }: { s: FormState }) => (s?.error ? <p role="alert" className="border border-kenya-red p-3 text-sm">{s.error}</p> : s?.ok ? <p role="status" className="border border-gold/50 p-3 text-sm">{s.ok}</p> : null);

export function SignInForm() {
  const [s, action, pending] = useActionState(signIn, undefined);
  return (
    <form action={action} className="grid max-w-md gap-5">
      <Msg s={s} />
      <label>Email<input name="email" type="email" autoComplete="username" required className={field} /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required className={field} /></label>
      <button type="submit" disabled={pending} className={primary}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function StatusForm({ id, current, statuses }: { id: string; current: string; statuses: readonly string[] }) {
  const [s, action, pending] = useActionState(updateInquiryStatus, undefined);
  return (
    <form action={action} className="grid max-w-sm gap-3">
      <Msg s={s} />
      <input type="hidden" name="id" value={id} />
      <label>Status<select name="status" defaultValue={current} className={field}>{statuses.map((x) => <option key={x} value={x} className="bg-charcoal">{x.replace("_", " ")}</option>)}</select></label>
      <button type="submit" disabled={pending} className={primary}>{pending ? "Saving…" : "Update status"}</button>
    </form>
  );
}

export function QuotationForm({ id }: { id: string }) {
  const [s, action, pending] = useActionState(createQuotation, undefined);
  return (
    <form action={action} className="grid max-w-2xl gap-4 sm:grid-cols-3">
      <div className="sm:col-span-3"><Msg s={s} /></div>
      <input type="hidden" name="id" value={id} />
      <label className="sm:col-span-3">Proposal message<textarea name="message" rows={8} required minLength={10} maxLength={6000} className={`${field} py-3`} placeholder="Itinerary summary, inclusions, exclusions, who delivers each part…" /></label>
      <label>Total (optional)<input name="total" inputMode="decimal" className={field} /></label>
      <label>Currency<input name="currency" maxLength={3} placeholder="USD" className={`${field} uppercase`} /></label>
      <label>Valid until<input name="validUntil" type="date" className={field} /></label>
      <div className="sm:col-span-3"><button type="submit" disabled={pending} className={primary}>{pending ? "Saving…" : "Save quotation"}</button></div>
    </form>
  );
}
