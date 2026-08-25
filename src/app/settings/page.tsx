import { PageTitle } from "@/components/form";
import { Settings } from "@/components/settings";
import { authEnabled } from "@/lib/auth";
import { getState, storageBackend } from "@/lib/store";

export default async function SettingsPage() {
  const state = await getState();
  return (
    <div className="space-y-4">
      <PageTitle>Settings</PageTitle>
      <Settings planStart={state.plan_start} backend={storageBackend()} authEnabled={authEnabled()} />
    </div>
  );
}
