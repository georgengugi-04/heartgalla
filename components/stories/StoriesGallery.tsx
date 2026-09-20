"use client";
import { useCallback, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/videoStories";
import StoryViewer from "./StoryViewer";

// The open story lives in the URL hash (/stories#lenny-kariuki): it can be shared, Back closes the viewer,
// and a refresh comes back to the same story. Server / hydrating render: nothing open.
function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
  };
}
const readHash = () => decodeURIComponent(window.location.hash.slice(1));
const notify = () => window.dispatchEvent(new Event("hashchange"));

export default function StoriesGallery({ stories }: { stories: Story[] }) {
  const openSlug = useSyncExternalStore(subscribe, readHash, () => "");
  const index = stories.findIndex((s) => s.slug === openSlug);

  const open = useCallback((slug: string) => {
    window.history.pushState(null, "", `#${slug}`);
    notify();
  }, []);
  const change = useCallback((slug: string) => {
    window.history.replaceState(null, "", `#${slug}`); // moving between stories doesn't pile up history
    notify();
  }, []);
  const close = useCallback(() => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    notify();
  }, []);

  if (stories.length === 0) {
    return <p className="font-editorial text-xl text-ivory/60">Stories are on their way — check back soon.</p>;
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {stories.map((s) => {
          const parts = [
            s.videos ? `${s.videos} video${s.videos === 1 ? "" : "s"}` : null,
            s.images ? `${s.images} work${s.images === 1 ? "" : "s"}` : null,
          ].filter(Boolean);
          return (
            <li key={s.slug}>
              <button
                type="button"
                onClick={() => open(s.slug)}
                data-cursor="view"
                aria-label={`Watch ${s.title} — ${s.kicker}, ${parts.join(" and ")}`}
                className="group relative block aspect-[9/16] w-full overflow-hidden bg-black/30 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <Image
                  src={s.cover}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-20">
                  <span className="label-mono block !text-[0.7rem] text-gold">{s.kicker}</span>
                  <span className="mt-1 block font-editorial text-2xl leading-tight text-ivory">{s.title}</span>
                  <span className="label-mono mt-2 block !text-[0.7rem] text-ivory/60">{parts.join(" · ")}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-sm text-ivory backdrop-blur-sm"
                >
                  ▶
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* crawlable, screen-reader-friendly index of everything in the stories */}
      <nav aria-label="Everything in the stories" className="sr-only">
        {stories.map((s) => (
          <ul key={s.slug}>
            <li>{s.title}</li>
            {s.items.flatMap((it) => (it.work ? [it.work] : [])).map((w) => (
              <li key={`${s.slug}-${w.slug}`}>
                <Link href={w.href}>
                  {w.title} — {w.artist}
                </Link>
              </li>
            ))}
          </ul>
        ))}
      </nav>

      {index >= 0 && <StoryViewer key="viewer" stories={stories} startIndex={index} onClose={close} onStoryChange={change} />}
    </>
  );
}
