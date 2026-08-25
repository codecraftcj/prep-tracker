"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Briefcase, CalendarDays, CheckSquare, CircleHelp, Compass, ListChecks, Menu, Mic, Settings, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export const ITEMS = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/problems", label: "Problems", icon: ListChecks },
  { href: "/review", label: "Review", icon: Compass },
  { href: "/applications", label: "Applications", icon: Briefcase },
  { href: "/curriculum", label: "Curriculum", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/mocks", label: "Mocks & Design", icon: Mic },
  { href: "/artifacts", label: "Artifacts", icon: CheckSquare },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: CircleHelp },
];
const MOBILE = [...ITEMS.slice(0, 4), { href: "/more", label: "More", icon: Menu }];

export function Nav() {
  const path = usePathname();
  const moreActive = ITEMS.slice(4).some((i) => i.href === path) || path === "/more";
  return (
    <>
      <header className="hidden md:block border-b bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-1 px-4 h-13">
          <span className="font-semibold tracking-tight mr-6">prep-tracker</span>
          {ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={cn("px-3 py-1.5 rounded-md text-sm transition-colors", path === href ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/60")}>{label}</Link>
          ))}
        </div>
      </header>
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur z-10 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
        {MOBILE.map(({ href, label, icon: Icon }) => {
          const active = href === "/more" ? moreActive : path === href;
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
