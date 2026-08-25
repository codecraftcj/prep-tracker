import { Today } from "@/components/today";
import { todayManila } from "@/lib/dates";
import { attemptsOn, dueResolves, problemStatuses, recommendNext, streak } from "@/lib/logic";
import { DIFFICULTIES, Difficulty, PATTERNS, Pattern } from "@/lib/types";
import { getState } from "@/lib/store";

export default async function TodayPage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
  const pattern = str(sp.pattern), difficulty = str(sp.difficulty);
  const prefill = str(sp.title) && PATTERNS.includes(pattern as Pattern) && DIFFICULTIES.includes(difficulty as Difficulty)
    ? { title: str(sp.title), url: str(sp.url), pattern: pattern as Pattern, difficulty: difficulty as Difficulty }
    : null;
  const state = await getState();
  const today = todayManila();
  const statuses = problemStatuses(state.attempts);
  return (
    <Today
      due={dueResolves(statuses, today)} todays={attemptsOn(state.attempts, today).reverse()} streak={streak(state.attempts, today)} today={today}
      next={recommendNext(state, 4, today)} initialPrefill={prefill}
    />
  );
}
