"use client";
import { useState } from "react";
import { AttemptForm } from "@/components/attempt-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDuration } from "@/lib/dates";
import type { ProblemStatus } from "@/lib/logic";
import { Attempt, DAILY_TARGET_ATTEMPTS, label } from "@/lib/types";
import { cn } from "@/lib/utils";

function Stat({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div className={cn("rounded-xl border bg-card px-3 py-2", hot && "border-foreground/40")}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

type Props = { due: ProblemStatus[]; todays: Attempt[]; streak: number; today: string };

export function Today({ due, todays, streak, today }: Props) {
  const [prefill, setPrefill] = useState<{ title: string; url: string; pattern: ProblemStatus["pattern"]; difficulty: ProblemStatus["difficulty"] } | null>(null);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Today" value={today.slice(5)} />
          <Stat label="Target" value={`${todays.length}/${DAILY_TARGET_ATTEMPTS}`} hot={todays.length >= DAILY_TARGET_ATTEMPTS} />
          <Stat label="Streak" value={`${streak}d`} hot={streak > 0} />
        </div>
        <Card>
          <CardHeader><CardTitle>Log attempt</CardTitle></CardHeader>
          <CardContent><AttemptForm prefill={prefill} /></CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Due re-solves ({due.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {due.length === 0 && <p className="text-sm text-muted-foreground">Nothing due. Pick 2 new problems.</p>}
            {due.map((p) => (
              <div key={p.slug} className="flex items-center gap-2 text-sm rounded-lg border px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{label(p.pattern)} · {p.difficulty} · {p.stage === 0 ? "+3d" : "+14d"} · due {p.due}{p.due! < today ? " (overdue)" : ""}</div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setPrefill({ title: p.title, url: p.url, pattern: p.pattern, difficulty: p.difficulty }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Re-solve</Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Today&apos;s attempts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {todays.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
            {todays.map((a) => (
              <div key={a.id} className="text-sm flex justify-between gap-2 rounded-lg border px-3 py-2">
                <span className="truncate">{a.problem_title}</span>
                <span className="text-muted-foreground shrink-0">{fmtDuration(a.duration_seconds)} · {label(a.outcome)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
