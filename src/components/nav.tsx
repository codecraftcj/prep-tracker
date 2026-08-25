"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Briefcase, CalendarDays, CheckSquare, ChevronDown, CircleHelp, Compass, ListChecks, Menu, Mic, Settings, Sun } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Primary destinations: the daily loop. Everything else lives under More. */
export const PRIMARY = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/curriculum", label: "Curriculum", icon: BookOpen },
  { href: "/review", label: "Review", icon: Compass },
  { href: "/applications", label: "Applications", icon: Briefcase },
];
export const SECONDARY = [
  { href: "/problems", label: "Problems", icon: ListChecks },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/mocks", label: "Mocks & Design", icon: Mic },
  { href: "/artifacts", label: "Artifacts", icon: CheckSquare },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: CircleHelp },
];

export function Nav() {
  const path = usePathname();
  const inMore = SECONDARY.some((i) => i.href === path) || path === "/more";
  const current = SECONDARY.find((i) => i.href === path);
  return (
    <>
      <header className="hidden md:block border-b bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-1 px-4 h-13">
          <span className="font-semibold tracking-tight mr-6">prep-tracker</span>
          {PRIMARY.map(({ href, label }) => (
            <Link key={href} href={href} className={cn("px-3 py-1.5 rounded-md text-sm transition-colors", path === href ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}>{label}</Link>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger className={cn("flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors", inMore ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
              {current?.label ?? "More"} <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {SECONDARY.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem key={href} render={<Link href={href} />} className={cn(path === href && "bg-muted")}>
                  <Icon className="size-4 text-muted-foreground" /> {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur z-10 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {[...PRIMARY, { href: "/more", label: "More", icon: Menu }].map(({ href, label, icon: Icon }) => {
          const active = href === "/more" ? inMore : path === href;
          return (
            <Link key={href} href={href} className={cn("flex flex-col items-center py-2 text-[11px] gap-1", active ? "text-foreground font-medium" : "text-muted-foreground")}>
              <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />{label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
