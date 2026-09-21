import type { Metadata } from "next";
import ExperimentShell from "@/components/artlab/ExperimentShell";
import BorrowedPalette from "@/components/borrowedpalette/BorrowedPalette";
import { GATEWAYS } from "@/lib/artlabPages";

const g = GATEWAYS["borrowed-palette"];
export const metadata: Metadata = { title: `${g.title} | EARTGALLA Art Lab`, description: g.blurb };

export default function Page() {
  return (
    <ExperimentShell slug="borrowed-palette">
      <BorrowedPalette />
    </ExperimentShell>
  );
}
