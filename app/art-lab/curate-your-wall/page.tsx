import type { Metadata } from "next";
import ExperimentShell from "@/components/artlab/ExperimentShell";
import CurateWall from "@/components/curatewall/CurateWall";
import { GATEWAYS } from "@/lib/artlabPages";

const g = GATEWAYS["curate-your-wall"];
export const metadata: Metadata = { title: `${g.title} | EARTGALLA Art Lab`, description: g.blurb };

export default function Page() {
  return (
    <ExperimentShell slug="curate-your-wall">
      <CurateWall />
    </ExperimentShell>
  );
}
