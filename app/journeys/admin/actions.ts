"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/journeys/admin/auth";
import { adminConfigured, supabaseServer } from "@/lib/journeys/supabase/server";

export type FormState = { error?: string; ok?: string } | undefined;
const STATUSES = ["new", "in_review", "quoted", "accepted", "declined", "closed"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const str = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  if (!adminConfigured()) return { error: "Admin sign-in isn’t configured on this deployment yet." };
  const email = str(form.get("email"), 254), password = str(form.get("password"), 200);
  if (!email || !password) return { error: "Enter your email and password." };
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "Those details didn’t work. Check them and try again." };
  redirect("/journeys/admin");
}

export async function signOut() {
  if (adminConfigured()) await (await supabaseServer()).auth.signOut();
  redirect("/journeys/admin/login");
}

export async function updateInquiryStatus(_: FormState, form: FormData): Promise<FormState> {
  await requireStaff();
  const id = str(form.get("id"), 40), status = str(form.get("status"), 20);
  if (!UUID.test(id) || !(STATUSES as readonly string[]).includes(status)) return { error: "That update isn’t valid." };
  const sb = await supabaseServer();
  const { error, count } = await sb.from("package_inquiries").update({ status }, { count: "exact" }).eq("id", id);
  if (error || !count) return { error: "Couldn’t update the status. You may not have permission." };
  revalidatePath("/journeys/admin/inquiries");
  revalidatePath(`/journeys/admin/inquiries/${id}`);
  return { ok: "Status updated." };
}

export async function createQuotation(_: FormState, form: FormData): Promise<FormState> {
  const staff = await requireStaff();
  const id = str(form.get("id"), 40), message = str(form.get("message"), 6000), currency = str(form.get("currency"), 3).toUpperCase();
  const totalRaw = str(form.get("total"), 20), validUntil = str(form.get("validUntil"), 10);
  if (!UUID.test(id)) return { error: "That update isn’t valid." };
  if (message.length < 10) return { error: "Write the proposal message first." };
  const total = totalRaw ? Number(totalRaw) : null;
  if (total !== null && (!Number.isFinite(total) || total < 0)) return { error: "Enter the total as a positive number." };
  if (total !== null && !/^[A-Z]{3}$/.test(currency)) return { error: "Add a 3-letter currency code, for example USD or KES." };
  if (validUntil && !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return { error: "Use a valid ‘valid until’ date." };

  const sb = await supabaseServer();
  const { data: inq } = await sb.from("package_inquiries").select("stops").eq("id", id).maybeSingle();
  if (!inq) return { error: "Inquiry not found." };
  const { error } = await sb.from("quotations").insert({
    inquiry_id: id, author_id: staff.id, itinerary: inq.stops ?? [], message,
    total_amount: total, currency: total === null ? null : currency, valid_until: validUntil || null,
  });
  if (error) return { error: "Couldn’t save the quotation." };
  await sb.from("package_inquiries").update({ status: "quoted" }).eq("id", id);
  revalidatePath("/journeys/admin/inquiries");
  revalidatePath(`/journeys/admin/inquiries/${id}`);
  return { ok: "Quotation saved and the inquiry marked as quoted. It has not been emailed to the visitor." };
}
