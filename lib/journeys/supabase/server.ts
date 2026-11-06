import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client acting AS THE SIGNED-IN USER, so Row Level Security applies. Never uses the service role. */
export const adminConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        // Server Components can't set cookies; the proxy refreshes the session, and actions/handlers can set them.
        try { list.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* read-only context */ }
      },
    },
  });
}
