import { PageTitle } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { fmtDate, todayManila } from "@/lib/dates";
import { attemptsInWeek, currentWeek, weekRange } from "@/lib/logic";
import { getState } from "@/lib/store";
import { DAILY_TARGET_ATTEMPTS } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function PlanPage() {
  const state = await getState();
  const today = todayManila();
  const cur = currentWeek(state, today);
  const target = DAILY_TARGET_ATTEMPTS * 7;
  return (
    <div className="space-y-4 max-w-2xl">
      <PageTitle>Plan <span className="text-muted-foreground text-base font-normal">{cur ? `· week ${cur} of ${state.weeks.length}` : "· not in program window"}</span></PageTitle>
      <div className="space-y-2">
        {state.weeks.map((w) => {
          const { start, end } = weekRange(state, w.number);
          const n = attemptsInWeek(state, w.number).length;
          const past = end < today;
          return (
            <div key={w.number} className={cn("border rounded-md p-3 space-y-1", w.number === cur && "border-foreground bg-muted/40", past && "opacity-70")}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">W{w.number} <span className="text-muted-foreground font-normal">{fmtDate(start)} – {fmtDate(end)}</span></span>
                {(past || w.number === cur) && <Badge variant={n >= target ? "default" : "outline"}>{n}/{target} attempts</Badge>}
              </div>
              <p className="text-sm">{w.target}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
