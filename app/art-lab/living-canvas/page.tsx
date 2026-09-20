import type { Metadata } from "next";
import ExperimentShell from "@/components/artlab/ExperimentShell";
import LivingCanvas from "@/components/livingcanvas/LivingCanvas";
import { GATEWAYS } from "@/lib/artlabPages";

const g = GATEWAYS["living-canvas"];
export const metadata: Metadata = { title: `${g.title} | EARTGALLA Art Lab`, description: g.blurb };

export default function Page() {
  return (
    <ExperimentShell slug="living-canvas">
      <LivingCanvas />
    </ExperimentShell>
  );
}
