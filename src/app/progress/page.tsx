import { ChartData, Charts } from "@/components/charts";
import { PageTitle } from "@/components/form";
import { addDays, toManilaDate, todayManila } from "@/lib/dates";
import { masteryByPattern, median, problemStatuses } from "@/lib/logic";
import { getState } from "@/lib/store";
import { DIFFICULTIES, OUTCOMES, label } from "@/lib/types";

export default async function ProgressPage() {
  const state = await getState();
  const today = todayManila();
  const attempts = state.attempts;

  const perDay = Array.from({ length: 30 }, (_, i) => addDays(today, i - 29)).map((day) => ({
    day, attempts: attempts.filter((a) => toManilaDate(a.attempted_at) === day).length,
  }));

  const weekOf = (ymd: string) => { const d = new Date(ymd); const dow = (d.getUTCDay() + 6) % 7; return addDays(ymd, -dow); };
  const weeks = [...new Set(attempts.map((a) => weekOf(toManilaDate(a.attempted_at))))].sort();
  const medianByDifficulty = weeks.map((week) => {
    const inWeek = attempts.filter((a) => weekOf(toManilaDate(a.attempted_at)) === week && a.outcome !== "failed");
    const m = (d: string) => { const v = median(inWeek.filter((a) => a.difficulty === d).map((a) => a.duration_seconds)); return v === null ? null : Math.round(v / 6) / 10; };
    return { week: week.slice(5), easy: m("easy"), medium: m("medium"), hard: m("hard") };
  });
  void DIFFICULTIES;

  const mastery = masteryByPattern(problemStatuses(attempts)).map((m) => ({ ...m, pattern: label(m.pattern) }));
  const outcomes = OUTCOMES.map((o) => ({ outcome: label(o).replace("solved ", ""), count: attempts.filter((a) => a.outcome === o).length }));

  const data: ChartData = { perDay, medianByDifficulty, mastery, outcomes };
  return (
    <div className="space-y-4">
      <PageTitle>Progress <span className="text-muted-foreground text-base font-normal">({attempts.length} attempts)</span></PageTitle>
      <Charts data={data} />
    </div>
  );
}
