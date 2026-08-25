"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteApplication, saveApplication } from "@/app/actions/misc";
import { Field, NativeSelect, PageTitle } from "@/components/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { todayManila } from "@/lib/dates";
import { googleWarnings } from "@/lib/logic";
import { APP_STATUSES, AppStatus, Application, TIERS, label } from "@/lib/types";

const blank = (): Omit<Application, "id"> => ({ company: "", role: "Software Engineer", tier: "practice", applied_at: null, referral: false, status: "planned", next_action: "", next_action_date: null, notes: "" });

export function ApplicationsBoard({ apps }: { apps: Application[] }) {
  const [editing, setEditing] = useState<(Omit<Application, "id"> & { id?: string }) | null>(null);
  const [pending, start] = useTransition();
  const warnings = useMemo(() => editing?.tier === "google" ? googleWarnings(apps, editing) : [], [apps, editing]);
  const set = <K extends keyof Application>(k: K, v: Application[K]) => setEditing((e) => e && { ...e, [k]: v });

  function move(app: Application, status: AppStatus) {
    const applied_at = app.applied_at ?? (status !== "planned" ? todayManila() : null);
    start(() => saveApplication({ ...app, status, applied_at }));
  }

  return (
    <div className="space-y-4">
      <PageTitle right={<Button size="sm" onClick={() => setEditing(blank())}>New</Button>}>Applications ({apps.length})</PageTitle>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {APP_STATUSES.map((status) => {
          const col = apps.filter((a) => a.status === status);
          return (
            <div key={status} className="w-56 shrink-0 space-y-2">
              <div className="text-xs font-medium uppercase text-muted-foreground">{label(status)} · {col.length}</div>
              {col.map((a) => (
                <div key={a.id} className="border rounded-md p-2 text-sm space-y-1 cursor-pointer hover:bg-muted/40" onClick={() => setEditing(a)}>
                  <div className="flex justify-between gap-1"><span className="font-medium truncate">{a.company}</span><Badge variant={a.tier === "google" ? "default" : "outline"} className="text-[10px]">{a.tier}</Badge></div>
                  <div className="text-xs text-muted-foreground truncate">{a.role}{a.referral ? " · ref" : ""}{a.applied_at ? ` · ${a.applied_at}` : ""}</div>
                  {a.next_action && <div className="text-xs">→ {a.next_action}{a.next_action_date ? ` (${a.next_action_date})` : ""}</div>}
                  <NativeSelect className="h-7 text-xs" options={APP_STATUSES} value={a.status} onClick={(e) => e.stopPropagation()} onChange={(e) => move(a, e.target.value as AppStatus)} />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit application" : "New application"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="grid grid-cols-2 gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { await saveApplication(editing); toast.success("Saved"); setEditing(null); }); }}>
              <Field label="Company"><Input value={editing.company} onChange={(e) => set("company", e.target.value)} required /></Field>
              <Field label="Role"><Input value={editing.role} onChange={(e) => set("role", e.target.value)} required /></Field>
              <Field label="Tier"><NativeSelect options={TIERS} value={editing.tier} onChange={(e) => set("tier", e.target.value as Application["tier"])} /></Field>
              <Field label="Status"><NativeSelect options={APP_STATUSES} value={editing.status} onChange={(e) => set("status", e.target.value as AppStatus)} /></Field>
              <Field label="Applied at"><Input type="date" value={editing.applied_at ?? ""} onChange={(e) => set("applied_at", e.target.value || null)} /></Field>
              <label className="flex items-center gap-2 text-sm self-end pb-2"><Switch checked={editing.referral} onCheckedChange={(v) => set("referral", v)} /> Referral</label>
              <Field label="Next action"><Input value={editing.next_action} onChange={(e) => set("next_action", e.target.value)} /></Field>
              <Field label="Next action date"><Input type="date" value={editing.next_action_date ?? ""} onChange={(e) => set("next_action_date", e.target.value || null)} /></Field>
              <Field label="Notes" className="col-span-2"><Textarea rows={3} value={editing.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
              {warnings.map((w) => <p key={w} className="col-span-2 text-sm text-amber-600 dark:text-amber-400">⚠ {w}</p>)}
              <Button type="submit" className="col-span-2" disabled={pending}>Save</Button>
              {editing.id && <Button type="button" variant="ghost" className="col-span-2 text-destructive" onClick={() => { if (confirm("Delete?")) start(async () => { await deleteApplication(editing.id!); setEditing(null); }); }}>Delete</Button>}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
