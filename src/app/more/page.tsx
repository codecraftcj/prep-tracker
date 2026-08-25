import Link from "next/link";
import { ITEMS } from "@/components/nav";
import { PageTitle } from "@/components/form";
import { ChevronRight } from "lucide-react";

export default function MorePage() {
  return (
    <div className="space-y-4">
      <PageTitle>More</PageTitle>
      <div className="rounded-xl border bg-card divide-y">
        {ITEMS.slice(4).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 text-sm">
            <Icon className="size-4 text-muted-foreground" /><span className="flex-1">{label}</span><ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
