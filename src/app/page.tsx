import { Today } from "@/components/today";
import { todayManila } from "@/lib/dates";
import { attemptsOn, dueResolves, problemStatuses, streak } from "@/lib/logic";
import { getState } from "@/lib/store";

export default async function TodayPage() {
  const state = await getState();
  const today = todayManila();
  const statuses = problemStatuses(state.attempts);
  return <Today due={dueResolves(statuses, today)} todays={attemptsOn(state.attempts, today).reverse()} streak={streak(state.attempts, today)} today={today} />;
}
