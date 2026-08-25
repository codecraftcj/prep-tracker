"use client";
import { Fragment, useMemo, useState, useTransition } from "react";
import { deleteAttempt } from "@/app/actions/attempts";
import { NativeSelect, PageTitle } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fmtDateTime, fmtDuration } from "@/lib/dates";
import type { ProblemStatus } from "@/lib/logic";
import { DIFFICULTIES, OUTCOMES, PATTERNS, label } from "@/lib/types";

type Mastery = { pattern: string; total: number; mastered: number; pct: number };

export function ProblemsTable({ statuses, mastery }: { statuses: ProblemStatus[]; mastery: Mastery[] }) {
  const [pattern, setPattern] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [open, setOpen] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const rows = useMemo(() => statuses.filter((p) =>
    (pattern === "all" || p.pattern === pattern) &&
    (difficulty === "all" || p.difficulty === difficulty) &&
    (outcome === "all" || p.last.outcome === outcome)), [statuses, pattern, difficulty, outcome]);

  return (
    <div className="space-y-4">
      <PageTitle>Problems <span className="text-muted-foreground text-base font-normal">({statuses.length}, {statuses.filter((s) => s.mastered).length} mastered)</span></PageTitle>
      <div className="flex gap-1 flex-wrap">
        {mastery.map((m) => <Badge key={m.pattern} variant={m.pct === 100 ? "default" : "outline"}>{label(m.pattern)} {m.mastered}/{m.total}</Badge>)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <NativeSelect options={["all", ...PATTERNS]} value={pattern} onChange={(e) => setPattern(e.target.value)} />
        <NativeSelect options={["all", ...DIFFICULTIES]} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} />
        <NativeSelect options={["all", ...OUTCOMES]} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>Problem</TableHead><TableHead>Pattern</TableHead><TableHead>Diff</TableHead><TableHead>Last</TableHead><TableHead>Mastery</TableHead><TableHead>#</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((p) => (
              <Fragment key={p.slug}>
                <TableRow className="cursor-pointer" onClick={() => setOpen(open === p.slug ? null : p.slug)}>
                  <TableCell className="font-medium">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline" onClick={(e) => e.stopPropagation()}>{p.title}</a> : p.title}</TableCell>
                  <TableCell>{label(p.pattern)}</TableCell>
                  <TableCell>{p.difficulty}</TableCell>
                  <TableCell className="whitespace-nowrap">{fmtDuration(p.last.duration_seconds)} · {label(p.last.outcome)}</TableCell>
                  <TableCell>{p.mastered ? <Badge>mastered</Badge> : <Badge variant="outline">{p.stage === 0 ? "+3d" : "+14d"} due {p.due}</Badge>}</TableCell>
                  <TableCell>{p.attempts.length}</TableCell>
                </TableRow>
                {open === p.slug && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/40">
                      <div className="space-y-1 text-xs">
                        {[...p.attempts].reverse().map((a) => (
                          <div key={a.id} className="flex gap-2 items-start">
                            <span className="w-36 shrink-0 text-muted-foreground">{fmtDateTime(a.attempted_at)}</span>
                            <span className="w-12 shrink-0">{fmtDuration(a.duration_seconds)}</span>
                            <span className="w-36 shrink-0">{label(a.outcome)}{a.talked_aloud ? "" : " · silent"}</span>
                            <span className="flex-1">{a.blocker && <span className="text-destructive">{a.blocker} </span>}{a.notes}</span>
                            <Button size="sm" variant="ghost" className="h-6 px-1" disabled={pending} onClick={() => { if (confirm("Delete this attempt?")) start(() => deleteAttempt(a.id)); }}>✕</Button>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
            {rows.length === 0 && <TableRow><TableCell colSpan={6} className="text-muted-foreground">No problems match.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
