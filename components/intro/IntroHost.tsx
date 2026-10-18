"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import IntroSplash from "./IntroSplash";
import { INTRO_HOME_ONLY } from "./introGuard";

// false until the app has finished its first render in the browser; later renders come from clicking through the site
let appHydrated = false;

/**
 * Mounts the homepage intro, and gives it a fresh start every time the route changes (`key={pathname}`), so with
 * INTRO_FREQUENCY = "always" it plays on a fresh visit, on refresh, AND when a click takes you back to Home.
 * The very first render still follows the <head> guard (URL, returning visit, bots, ?intro=1).
 */
export default function IntroHost() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    appHydrated = true;
  }, []);

  return <IntroSplash key={pathname} honourGuard={!appHydrated} playHere={!INTRO_HOME_ONLY || pathname === "/"} />;
}
