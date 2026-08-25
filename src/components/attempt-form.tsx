"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addAttempt } from "@/app/actions/attempts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, NativeSelect } from "@/components/form";
import { fmtDuration } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { DIFFICULTIES, Difficulty, OUTCOMES, Outcome, PATTERNS, Pattern, SOURCES, Source } from "@/lib/types";

type Prefill = { title: string; url: string; pattern: Pattern; difficulty: Difficulty; source?: Source };

export function AttemptForm({ prefill }: { prefill?: Prefill | null }) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<Source>("neetcode");
  const [pattern, setPattern] = useState<Pattern>("arrays");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [outcome, setOutcome] = useState<Outcome>("solved_clean");
  const [blocker, setBlocker] = useState("");
  const [talked, setTalked] = useState(true);
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();

  // Adopt a new prefill (from "Re-solve") by adjusting state during render.
  const [seenPrefill, setSeenPrefill] = useState(prefill);
  if (prefill !== seenPrefill) {
    setSeenPrefill(prefill);
    if (prefill) {
      setTitle(prefill.title); setUrl(prefill.url); setPattern(prefill.pattern); setDifficulty(prefill.difficulty);
      if (prefill.source) setSource(prefill.source);
    }
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000)), 250);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (running) { setRunning(false); return; }
    startRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }
  function reset() { setRunning(false); setElapsed(0); startRef.current = null; }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (outcome !== "solved_clean" && !blocker.trim()) { toast.error("What stopped you? Blocker is required."); return; }
    start(async () => {
      try {
        await addAttempt({
          problem_title: title.trim(), url: url.trim(), source, pattern, difficulty, outcome,
          attempted_at: new Date().toISOString(), duration_seconds: elapsed, blocker: blocker.trim(), talked_aloud: talked, notes: notes.trim(),
        });
        toast.success(`Logged ${title} (${fmtDuration(elapsed)})`);
        setTitle(""); setUrl(""); setBlocker(""); setNotes(""); setOutcome("solved_clean"); reset();
      } catch (err) { toast.error((err as Error).message); }
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
        <span className={cn("font-mono text-4xl tabular-nums flex-1 pl-1", running && "text-foreground", !running && elapsed === 0 && "text-muted-foreground")}>{fmtDuration(elapsed)}</span>
        <Button type="button" variant={running ? "secondary" : "default"} onClick={toggle} className="min-w-20">{running ? "Pause" : elapsed ? "Resume" : "Start"}</Button>
        <Button type="button" variant="ghost" onClick={reset} disabled={!elapsed && !running}>Reset</Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Problem" className="col-span-2"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Two Sum" required /></Field>
        <Field label="URL" className="col-span-2"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://leetcode.com/problems/two-sum/" inputMode="url" /></Field>
        <Field label="Pattern"><NativeSelect options={PATTERNS} value={pattern} onChange={(e) => setPattern(e.target.value as Pattern)} /></Field>
        <Field label="Difficulty"><NativeSelect options={DIFFICULTIES} value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} /></Field>
        <Field label="Outcome"><NativeSelect options={OUTCOMES} value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)} /></Field>
        <Field label="Source"><NativeSelect options={SOURCES} value={source} onChange={(e) => setSource(e.target.value as Source)} /></Field>
        {outcome !== "solved_clean" && (
          <Field label="What stopped me (required)" className="col-span-2"><Textarea value={blocker} onChange={(e) => setBlocker(e.target.value)} rows={2} /></Field>
        )}
        <Field label="Notes" className="col-span-2"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></Field>
        <label className="col-span-2 flex items-center gap-2 text-sm"><Switch checked={talked} onCheckedChange={setTalked} /> Talked aloud</label>
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending || !title.trim()}>{pending ? "Saving…" : "Log attempt"}</Button>
    </form>
  );
}
