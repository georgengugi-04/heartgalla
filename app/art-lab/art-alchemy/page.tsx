import type { Metadata } from "next";
import ExperimentShell from "@/components/artlab/ExperimentShell";
import ArtAlchemy from "@/components/alchemy/ArtAlchemy";
import { GATEWAYS } from "@/lib/artlabPages";

const g = GATEWAYS["art-alchemy"];
export const metadata: Metadata = { title: `${g.title} | EARTGALLA Art Lab`, description: g.blurb };

export default function Page() {
  return (
    <ExperimentShell slug="art-alchemy">
      <ArtAlchemy />
    </ExperimentShell>
  );
}
