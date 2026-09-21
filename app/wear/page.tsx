import type { Metadata } from "next";
import WearClient from "@/components/wear/WearClient";

export const metadata: Metadata = {
  title: "Wear the Art | EARTGALLA",
  description:
    "An early interaction preview of taking a Kenyan artwork from canvas to clothing — a concept, not a live product yet.",
  openGraph: {
    title: "Wear the Art | EARTGALLA",
    description: "From canvas to clothing — an early concept preview.",
  },
};

export default function WearPage() {
  return <WearClient />;
}
