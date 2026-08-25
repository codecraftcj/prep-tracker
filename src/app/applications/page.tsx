import { ApplicationsBoard } from "@/components/applications";
import { getState } from "@/lib/store";

export default async function ApplicationsPage() {
  const state = await getState();
  return <ApplicationsBoard apps={state.applications} />;
}
