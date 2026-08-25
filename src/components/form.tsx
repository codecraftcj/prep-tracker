import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { label as humanize } from "@/lib/types";

/** Native select: best on phones and zero JS. */
export function NativeSelect({ className, options, ...props }: React.ComponentProps<"select"> & { options: readonly string[] }) {
  return (
    <select
      className={cn("h-9 w-full min-w-0 rounded-md border border-input bg-background px-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30", className)}
      {...props}
    >
      {options.map((o) => <option key={o} value={o}>{humanize(o)}</option>)}
    </select>
  );
}

export function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5 min-w-0", className)}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function PageTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold">{children}</h1>
      {right}
    </div>
  );
}
