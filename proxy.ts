import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Keeps the Supabase session cookie fresh for the Journeys admin area only. Access control happens in requireStaff(). */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();
  let response = NextResponse.next({ request });
  const sb = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await sb.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/journeys/admin/:path*"] };
