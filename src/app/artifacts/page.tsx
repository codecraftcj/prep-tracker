import { ArtifactList } from "@/components/artifacts";
import { PageTitle } from "@/components/form";
import { getState } from "@/lib/store";

export default async function ArtifactsPage() {
  const state = await getState();
  const done = state.artifacts.filter((a) => a.status === "done").length;
  return (
    <div className="space-y-4 max-w-2xl">
      <PageTitle>Artifacts <span className="text-muted-foreground text-base font-normal">({done}/{state.artifacts.length})</span></PageTitle>
      <ArtifactList artifacts={state.artifacts} />
    </div>
  );
}
