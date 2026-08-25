import Link from "next/link";
import { PageTitle } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtDuration } from "@/lib/dates";
import { curriculumStatus, patternPriority, recommendNext } from "@/lib/logic";
import { getState } from "@/lib/store";
import { PATTERNS, label } from "@/lib/types";
import { cn } from "@/lib/utils";

export const logHref = (p: { title: string; url: string; pattern: string; difficulty: string }) =>
  `/?${new URLSearchParams({ title: p.title, url: p.url, pattern: p.pattern, difficulty: p.difficulty })}`;

const DIFF: Record<string, string> = { easy: "text-chart-2", medium: "text-chart-3", hard: "text-chart-5" };

export default async function CurriculumPage() {
  const state = await getState();
  const rows = curriculumStatus(state);
  const order = patternPriority(state);
  const next = new Set(recommendNext(state, 4).map((r) => r.slug));
  const done = rows.filter((r) => r.status).length;
  const mastered = rows.filter((r) => r.status?.mastered).length;

  return (
    <div className="space-y-4">
      <PageTitle>Curriculum <span className="text-muted-foreground text-base font-normal">{done}/{rows.length} attempted · {mastered} mastered</span></PageTitle>
      <p className="text-sm text-muted-foreground">NeetCode-150-based, one list per pattern in learning order. Patterns are sorted by what you should work on first; ★ marks the next recommended problems.</p>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        {order.map(({ pattern, week, reason }, i) => {
          const items = rows.filter((r) => r.pattern === pattern);
          const m = items.filter((r) => r.status?.mastered).length, a = items.filter((r) => r.status).length;
          return (
            <Card key={pattern} className={cn(i < 2 && "border-foreground/30")}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span>{label(pattern)} <span className="text-muted-foreground font-normal text-xs">W{week} · {reason}</span></span>
                  <Badge variant={m === items.length ? "default" : "outline"}>{m}/{items.length} mastered · {a} tried</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {items.map((r, idx) => (
                  <div key={r.slug} className={cn("flex items-center gap-2 text-sm rounded-md px-2 py-1.5", next.has(r.slug) && "bg-muted/60", r.status?.mastered && "opacity-60")}>
                    <span className="w-5 text-xs text-muted-foreground tabular-nums">{next.has(r.slug) ? "★" : idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <a href={r.url} target="_blank" rel="noreferrer" className={cn("truncate hover:underline underline-offset-2", r.status?.mastered && "line-through")}>{r.title}</a>
                        <span className={cn("text-[10px] uppercase", DIFF[r.difficulty])}>{r.difficulty}</span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{r.teaches}</div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right shrink-0 w-24">
                      {r.status ? (r.status.mastered ? "mastered" : <>{fmtDuration(r.status.last.duration_seconds)} · {label(r.status.last.outcome).replace("solved ", "")}<br />{r.status.stage === 0 ? "+3d" : "+14d"} {r.status.due}</>) : "new"}
                    </div>
                    <Link href={logHref(r)} className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "h-7 px-2")}>Log</Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">Patterns not in the plan: {PATTERNS.filter((p) => !order.some((o) => o.pattern === p)).map(label).join(", ") || "none"}.</p>
    </div>
  );
}
