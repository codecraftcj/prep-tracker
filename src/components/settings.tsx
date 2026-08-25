"use client";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { exportState, importState, logout, setPlanStart } from "@/app/actions/misc";
import { Field } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Settings({ planStart, backend, authEnabled }: { planStart: string; backend: string; authEnabled: boolean }) {
  const [start, setStart] = useState(planStart);
  const [pending, run] = useTransition();
  const file = useRef<HTMLInputElement>(null);

  async function download() {
    const json = await exportState();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    a.download = `prep-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }
  async function upload(f: File) {
    if (!confirm("Replace ALL data with this file?")) return;
    run(async () => { try { await importState(await f.text()); toast.success("Imported"); } catch (e) { toast.error((e as Error).message); } });
  }

  return (
    <div className="space-y-4 max-w-md">
      <Card>
        <CardHeader><CardTitle>Plan</CardTitle></CardHeader>
        <CardContent className="flex gap-2 items-end">
          <Field label="Week 1 start (Monday)" className="flex-1"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Button disabled={pending || start === planStart} onClick={() => run(async () => { await setPlanStart(start); toast.success("Saved"); })}>Save</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Data</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">Storage: {backend}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={download}>Export JSON</Button>
            <Button variant="outline" onClick={() => file.current?.click()} disabled={pending}>Import JSON</Button>
            <input ref={file} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          </div>
        </CardContent>
      </Card>
      {authEnabled && <form action={logout}><Button variant="ghost" type="submit">Sign out</Button></form>}
    </div>
  );
}
