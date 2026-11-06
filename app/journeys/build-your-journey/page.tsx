import type { Metadata } from "next";
import InquiryForm from "@/components/journeys/InquiryForm";

export const metadata: Metadata = { title: "Build your own Kenya journey | EARTGALLA Journeys", description: "Request a personalised Kenya itinerary and quotation." };

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono text-gold">Build your own Kenya journey</p>
      <h1 className="font-editorial mt-4 text-5xl md:text-6xl">Tell us how you’d like to travel.</h1>
      <p className="mt-5 max-w-2xl text-ivory/70">Share your dates, destinations and budget. We’ll respond with a proposed itinerary and quotation. This is a request, not a booking.</p>
      <div className="mt-12 max-w-4xl"><InquiryForm /></div>
    </div>
  );
}
