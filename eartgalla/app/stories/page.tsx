import StoriesGallery from "@/components/stories/StoriesGallery";
import { getVideoStories } from "@/lib/videoStories";

export const metadata = {
  title: "Stories | EARTGALLA",
  description: "Short vertical stories about the work and the people making it.",
};

export default function StoriesPage() {
  const stories = getVideoStories();
  return (
    <div className="pt-32 pb-24">
      <div className="px-6 md:px-10">
        <p className="label-mono text-ivory/50 mb-3">EARTGALLA STORIES</p>
        <h1 className="font-editorial text-4xl md:text-6xl mb-6">Art, in motion</h1>
        <p className="text-ivory/60 max-w-xl mb-14">
          Short vertical stories about the work. Tap one to watch — tap the right side to move on, the left to go
          back, and hold to pause.
        </p>
        <StoriesGallery stories={stories} />
        <p className="text-ivory/40 label-mono mt-16">
          More stories are added here as they&apos;re made.
        </p>
      </div>
    </div>
  );
}
