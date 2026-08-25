"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addDesignRep, addMock, deleteDesignRep, deleteMock } from "@/app/actions/misc";
import { Field, NativeSelect } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fmtDate, todayManila } from "@/lib/dates";
import { DESIGN_TOPICS, DesignRep, MOCK_PLATFORMS, MOCK_TYPES, Mock } from "@/lib/types";

export function MockList({ mocks }: { mocks: Mock[] }) {
  const [f, setF] = useState<Omit<Mock, "id">>({ mocked_at: todayManila(), platform: "pramp", type: "coding", self_score: 3, interviewer_feedback: "", what_to_fix: "" });
  const [pending, start] = useTransition();
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v });
  return (
    <Card>
      <CardHeader><CardTitle>Mocks ({mocks.length})</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form className="grid grid-cols-2 gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { await addMock(f); toast.success("Mock logged"); setF({ ...f, interviewer_feedback: "", what_to_fix: "" }); }); }}>
          <Field label="Date"><Input type="date" value={f.mocked_at} onChange={(e) => set("mocked_at", e.target.value)} required /></Field>
          <Field label="Self score (1–5)"><Input type="number" min={1} max={5} value={f.self_score} onChange={(e) => set("self_score", Number(e.target.value))} /></Field>
          <Field label="Platform"><NativeSelect options={MOCK_PLATFORMS} value={f.platform} onChange={(e) => set("platform", e.target.value as Mock["platform"])} /></Field>
          <Field label="Type"><NativeSelect options={MOCK_TYPES} value={f.type} onChange={(e) => set("type", e.target.value as Mock["type"])} /></Field>
          <Field label="Interviewer feedback" className="col-span-2"><Textarea rows={2} value={f.interviewer_feedback} onChange={(e) => set("interviewer_feedback", e.target.value)} /></Field>
          <Field label="What to fix" className="col-span-2"><Textarea rows={2} value={f.what_to_fix} onChange={(e) => set("what_to_fix", e.target.value)} /></Field>
          <Button type="submit" className="col-span-2" disabled={pending}>Add mock</Button>
        </form>
        <div className="space-y-2 text-sm">
          {[...mocks].sort((a, b) => b.mocked_at.localeCompare(a.mocked_at)).map((m) => (
            <div key={m.id} className="border rounded-md p-2 space-y-1">
              <div className="flex justify-between"><span className="font-medium">{fmtDate(m.mocked_at)} · {m.platform} · {m.type} · {m.self_score}/5</span>
                <button className="text-muted-foreground" onClick={() => confirm("Delete?") && start(() => deleteMock(m.id))}>✕</button></div>
              {m.interviewer_feedback && <p className="text-muted-foreground">{m.interviewer_feedback}</p>}
              {m.what_to_fix && <p>Fix: {m.what_to_fix}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DesignList({ reps }: { reps: DesignRep[] }) {
  const [f, setF] = useState<Omit<DesignRep, "id">>({ topic: "rate limiter", date: todayManila(), duration_minutes: 45, notes: "", weak_areas: "" });
  const [pending, start] = useTransition();
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v });
  return (
    <Card>
      <CardHeader><CardTitle>System design reps ({reps.length})</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form className="grid grid-cols-2 gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { await addDesignRep(f); toast.success("Rep logged"); setF({ ...f, notes: "", weak_areas: "" }); }); }}>
          <Field label="Topic" className="col-span-2"><NativeSelect options={DESIGN_TOPICS} value={f.topic} onChange={(e) => set("topic", e.target.value as DesignRep["topic"])} /></Field>
          <Field label="Date"><Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} required /></Field>
          <Field label="Minutes"><Input type="number" min={1} value={f.duration_minutes} onChange={(e) => set("duration_minutes", Number(e.target.value))} /></Field>
          <Field label="Notes" className="col-span-2"><Textarea rows={2} value={f.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
          <Field label="Weak areas" className="col-span-2"><Textarea rows={2} value={f.weak_areas} onChange={(e) => set("weak_areas", e.target.value)} /></Field>
          <Button type="submit" className="col-span-2" disabled={pending}>Add rep</Button>
        </form>
        <div className="space-y-2 text-sm">
          {[...reps].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
            <div key={r.id} className="border rounded-md p-2 space-y-1">
              <div className="flex justify-between"><span className="font-medium">{fmtDate(r.date)} · {r.topic} · {r.duration_minutes} min</span>
                <button className="text-muted-foreground" onClick={() => confirm("Delete?") && start(() => deleteDesignRep(r.id))}>✕</button></div>
              {r.notes && <p className="text-muted-foreground">{r.notes}</p>}
              {r.weak_areas && <p>Weak: {r.weak_areas}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
