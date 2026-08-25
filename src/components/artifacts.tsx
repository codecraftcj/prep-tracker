"use client";
import { useTransition } from "react";
import { updateArtifact } from "@/app/actions/misc";
import { NativeSelect } from "@/components/form";
import { Input } from "@/components/ui/input";
import { todayManila } from "@/lib/dates";
import { ARTIFACT_STATUSES, Artifact } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArtifactList({ artifacts }: { artifacts: Artifact[] }) {
  const [, start] = useTransition();
  return (
    <div className="space-y-2">
      {artifacts.map((a) => (
        <div key={a.id} className={cn("border rounded-md p-3 grid grid-cols-[1fr_auto] gap-2 items-center", a.status === "done" && "opacity-60")}>
          <div className={cn("font-medium text-sm", a.status === "done" && "line-through")}>{a.title}</div>
          <NativeSelect className="w-32" options={ARTIFACT_STATUSES} value={a.status}
            onChange={(e) => { const status = e.target.value as Artifact["status"]; start(() => updateArtifact(a.id, { status, completed_at: status === "done" ? (a.completed_at ?? todayManila()) : null })); }} />
          <Input className="col-span-2 h-8 text-xs" placeholder="Link" defaultValue={a.link} onBlur={(e) => { if (e.target.value !== a.link) start(() => updateArtifact(a.id, { link: e.target.value })); }} />
          {a.completed_at && <div className="col-span-2 text-xs text-muted-foreground">Done {a.completed_at}</div>}
        </div>
      ))}
    </div>
  );
}
