import type { Metadata } from "next";
import TripPlanner from "@/components/journeys/TripPlanner";

export const metadata: Metadata = { title: "Trip planner | EARTGALLA Journeys", description: "Choose towns, set nights at each stop and request your journey." };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono text-gold">Trip planner</p>
      <h1 className="font-editorial mt-4 text-5xl md:text-6xl">Build your route.</h1>
      <p className="mt-5 max-w-2xl text-ivory/70">Add towns, set your nights and reorder the stops. Your trip is saved in this browser.</p>
      <div className="mt-12"><TripPlanner /></div>
    </div>
  );
}
