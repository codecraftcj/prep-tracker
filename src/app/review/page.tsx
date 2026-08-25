import { PageTitle } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDuration } from "@/lib/dates";
import { buildReview, type Focus } from "@/lib/logic";
import { getState } from "@/lib/store";
import { TARGET_SECONDS, WEEKS, label } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stat({ label, value, sub, warn }: { label: string; value: string; sub?: string; warn?: boolean }) {
  return (
    <div className={cn("rounded-xl border bg-card px-3 py-2", warn && "border-destructive/50")}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

const LEVEL: Record<Focus["level"], string> = { now: "border-destructive/60 bg-destructive/5", soon: "border-chart-3/60 bg-chart-3/5", ok: "border-chart-2/60 bg-chart-2/5" };
const LEVEL_LABEL: Record<Focus["level"], string> = { now: "Now", soon: "This week", ok: "OK" };
const STATUS: Record<string, string> = { untouched: "bg-muted text-muted-foreground", weak: "bg-destructive/15 text-destructive", building: "bg-chart-3/20", solid: "bg-chart-2/20" };

export default async function ReviewPage() {
  const state = await getState();
  const r = buildReview(state);
  const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);

  return (
    <div className="space-y-6">
      <PageTitle right={<Badge variant="outline">{r.today}</Badge>}>Review</PageTitle>

      {/* Where am I */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Stat label="Program" value={r.week ? `Week ${r.week}/${WEEKS.length}` : r.daysIntoProgram < 0 ? "Not started" : "Finished"} sub={r.week ? `day ${r.daysIntoProgram + 1} of 70` : undefined} />
        <Stat label="Apply · practice tier" value={r.daysToPracticeApply > 0 ? `${r.daysToPracticeApply}d` : "open"} sub="week 9" />
        <Stat label="Apply · target tier" value={r.daysToTargetApply > 0 ? `${r.daysToTargetApply}d` : "open"} sub="week 10" />
        <Stat label="Mastered" value={`${r.attempts.mastered}/${r.attempts.problems}`} sub={`${r.attempts.total} attempts total`} />
      </div>

      {/* Focus */}
      <Card>
        <CardHeader><CardTitle>Focus now</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {r.focus.map((f, i) => (
            <div key={i} className={cn("rounded-lg border px-3 py-2", LEVEL[f.level])}>
              <div className="flex items-center gap-2 text-sm font-medium"><Badge variant="outline" className="text-[10px]">{LEVEL_LABEL[f.level]}</Badge>{f.title}</div>
              <p className="text-xs text-muted-foreground mt-1">{f.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* Coding */}
        <Card>
          <CardHeader><CardTitle>Coding</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="This week" value={`${r.attempts.thisWeek}/${r.attempts.weekTarget}`} sub={r.week ? `${r.attempts.expectedByToday} expected by today` : undefined} warn={r.week !== null && r.attempts.thisWeek < r.attempts.expectedByToday} />
              <Stat label="Re-solves" value={`${r.attempts.overdue} overdue`} sub={`${r.attempts.dueToday} due today`} warn={r.attempts.overdue > 0} />
              <Stat label="Solved clean" value={r.attempts.cleanRate === null ? "—" : `${r.attempts.cleanRate}%`} sub="all time" />
              <Stat label="Talk-aloud" value={r.attempts.talkAloudRate === null ? "—" : `${r.attempts.talkAloudRate}%`} sub="all time" warn={r.attempts.talkAloudRate !== null && r.attempts.talkAloudRate < 80} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Median time, last 14 days (target)</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {(["easy", "medium", "hard"] as const).map((d) => {
                  const m = r.attempts.medianRecent[d];
                  return <div key={d} className={cn("rounded-lg border px-3 py-1.5", m !== null && m > TARGET_SECONDS[d] && "border-destructive/50")}><span className="text-muted-foreground">{d}</span> <span className="font-medium tabular-nums">{m === null ? "—" : fmtDuration(Math.round(m))}</span> <span className="text-xs text-muted-foreground">({TARGET_SECONDS[d] / 60}m)</span></div>;
                })}
              </div>
            </div>
            {r.attempts.perWeek.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-1">Attempts per week vs target</div>
                <div className="space-y-1">
                  {r.attempts.perWeek.map((w) => (
                    <div key={w.week} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-muted-foreground">W{w.week}</span>
                      <div className="flex-1 h-2 rounded bg-muted overflow-hidden"><div className={cn("h-full", w.attempts >= w.target ? "bg-chart-2" : "bg-chart-1")} style={{ width: `${Math.min(100, pct(w.attempts, w.target))}%` }} /></div>
                      <span className="w-12 text-right tabular-nums">{w.attempts}/{w.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patterns */}
        <Card>
          <CardHeader><CardTitle>Patterns introduced so far</CardTitle></CardHeader>
          <CardContent>
            {r.patterns.length === 0 && <p className="text-sm text-muted-foreground">Program not started.</p>}
            <div className="space-y-1">
              {r.patterns.map((p) => (
                <div key={p.pattern} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-xs text-muted-foreground">W{p.week}</span>
                  <span className="flex-1">{label(p.pattern)}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{p.problems} · {p.mastered}✓ · {p.cleanRate === null ? "—" : `${p.cleanRate}%`}</span>
                  <span className={cn("text-[10px] uppercase rounded px-1.5 py-0.5 w-20 text-center", STATUS[p.status])}>{p.status}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-3">problems · mastered · clean rate. Solid = 3 mastered or 4+ problems at ≥70% clean.</p>
          </CardContent>
        </Card>

        {/* Mocks & design */}
        <Card>
          <CardHeader><CardTitle>Mocks &amp; system design</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Stat label="Mocks this week" value={`${r.mocks.thisWeek}/${r.mocks.weekTarget}`} sub={`${r.mocks.total} total · ${r.mocks.expectedToDate} expected to date`} warn={r.mocks.total < r.mocks.expectedToDate} />
            <Stat label="Self-score (last 3)" value={r.mocks.avgScoreRecent === null ? "—" : `${r.mocks.avgScoreRecent}/5`} sub={r.mocks.lastFix ? `fix: ${r.mocks.lastFix}` : undefined} />
            <Stat label="Design this week" value={`${r.design.thisWeek}/${r.design.weekTarget}`} sub={`${r.design.total} total · ${r.design.expectedToDate} expected to date`} warn={r.design.total < r.design.expectedToDate} />
            <Stat label="Design topics" value={`${r.design.topicsCovered}/${r.design.topicsTotal}`} sub="distinct topics covered" />
          </CardContent>
        </Card>

        {/* Portfolio & applications */}
        <Card>
          <CardHeader><CardTitle>Portfolio &amp; applications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Artifacts" value={`${r.artifacts.done}/${r.artifacts.total}`} sub={`${r.artifacts.inProgress} in progress`} />
              <Stat label="Applications" value={`${r.applications.active} active`} sub={`${r.applications.total} total`} warn={r.applications.overdueActions > 0} />
            </div>
            <div className="space-y-1">
              {state.artifacts.map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-xs">
                  <span className={cn("size-2 rounded-full shrink-0", a.status === "done" ? "bg-chart-2" : a.status === "in_progress" ? "bg-chart-3" : "bg-muted-foreground/40")} />
                  <span className={cn("truncate", a.status === "done" && "line-through text-muted-foreground")}>{a.title}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
