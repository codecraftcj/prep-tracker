import { PageTitle } from "@/components/form";
import { DesignList, MockList } from "@/components/mocks";
import { getState } from "@/lib/store";

export default async function MocksPage() {
  const state = await getState();
  return (
    <div className="space-y-4">
      <PageTitle>Mocks &amp; Design</PageTitle>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <MockList mocks={state.mocks} />
        <DesignList reps={state.design_reps} />
      </div>
    </div>
  );
}
