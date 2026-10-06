"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  ClipboardList,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  ScanSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "New Analysis", icon: ScanSearch, exact: true },
  { href: "/dashboard/history", label: "My History", icon: ClipboardList },
  { href: "/dashboard/quiz", label: "Quiz Arena", icon: GraduationCap },
  { href: "/dashboard/stats", label: "Live Statistics", icon: BarChart3 },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-[width] duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Collapse handle sitting on the right border */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-12 z-10 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {collapsed ? (
          <PanelLeftOpen className="size-3.5" />
        ) : (
          <PanelLeftClose className="size-3.5" />
        )}
      </button>

      {/* Logo */}
      <Link
        href="/"
        title={collapsed ? "PhishCatcher home" : undefined}
        className={cn(
          "flex items-center gap-3 border-b border-border px-5 py-4 hover:opacity-80 transition-opacity",
          collapsed && "justify-center px-0"
        )}
      >
        <Image src="/logo.svg" alt="PhishCatcher" width={28} height={28} priority />
        {!collapsed && (
          <span className="font-bold tracking-tight text-foreground">PhishCatcher</span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 pt-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "px-4",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-border p-4", collapsed && "flex justify-center p-3")}>
        <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
          <UserButton afterSignOutUrl="/" />
          {!collapsed && <span className="text-xs text-muted-foreground">Account</span>}
        </div>
      </div>
    </aside>
  );
}