"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Briefcase, CalendarDays, CheckSquare, ListChecks, Mic, Settings, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Today", icon: Sun },
  { href: "/problems", label: "Problems", icon: ListChecks },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/mocks", label: "Mocks", icon: Mic },
  { href: "/artifacts", label: "Artifacts", icon: CheckSquare },
  { href: "/applications", label: "Apps", icon: Briefcase },
  { href: "/plan", label: "Plan", icon: CalendarDays },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const path = usePathname();
  return (
    <>
      {/* desktop */}
      <header className="hidden md:flex items-center gap-1 border-b px-4 h-12 sticky top-0 bg-background z-10">
        <span className="font-semibold mr-4">prep-tracker</span>
        {ITEMS.map(({ href, label }) => (
          <Link key={href} href={href} className={cn("px-3 py-1.5 rounded-md text-sm", path === href ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")}>{label}</Link>
        ))}
      </header>
      {/* mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 border-t bg-background z-10 grid grid-cols-8 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={cn("flex flex-col items-center py-2 text-[10px] gap-0.5", path === href ? "text-foreground" : "text-muted-foreground")}>
            <Icon className="size-4" />{label}
          </Link>
        ))}
      </nav>
    </>
  );
}
