import { ProblemsTable } from "@/components/problems-table";
import { masteryByPattern, problemStatuses } from "@/lib/logic";
import { getState } from "@/lib/store";

export default async function ProblemsPage() {
  const state = await getState();
  const statuses = problemStatuses(state.attempts);
  return <ProblemsTable statuses={statuses} mastery={masteryByPattern(statuses)} />;
}
