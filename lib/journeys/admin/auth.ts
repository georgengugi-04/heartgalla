import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { adminConfigured, supabaseServer } from "../supabase/server";

export type StaffRole = "super_admin" | "destination_manager";
export type Staff = { id: string; email: string | undefined; role: StaffRole };

/**
 * Verifies the session with Supabase (getUser validates the JWT; getSession does not) and then checks the role
 * in journeys_profiles. Staff = super_admin | destination_manager. Partner roles get their own dashboard later.
 */
export const getStaff = cache(async (): Promise<Staff | null> => {
  if (!adminConfigured()) return null;
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data } = await sb.from("journeys_profiles").select("role").eq("user_id", user.id).maybeSingle();
  if (data?.role !== "super_admin" && data?.role !== "destination_manager") return null;
  return { id: user.id, email: user.email, role: data.role };
});

export async function requireStaff(): Promise<Staff> {
  const s = await getStaff();
  if (!s) redirect("/journeys/admin/login");
  return s;
}
