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
        "sticky top-0 flex h-screen flex-col border-r border-black/[0.05] bg-white transition-[width] duration-200 z-30",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Collapse handle sitting on the right border */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        className="absolute -right-3 top-12 z-10 flex size-6 items-center justify-center rounded-full border border-black/[0.08] bg-white shadow-xs transition-colors hover:text-[#1A0B54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CA45FF]"
        style={{ color: "rgb(131, 121, 158)" }}
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
          "flex items-center gap-3 border-b border-black/[0.05] px-5 py-4 transition-opacity hover:opacity-85",
          collapsed && "justify-center px-0"
        )}
      >
        <span
          className="flex size-8 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "rgb(249, 249, 249)",
            boxShadow: "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a",
          }}
        >
          <Image src="/logo.svg" alt="PhishCatcher" width={20} height={20} priority />
        </span>
        {!collapsed && (
          <span className="font-medium tracking-tight text-base" style={{ color: "rgb(26, 11, 84)" }}>
            PhishCatcher
          </span>
        )}
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 p-3 pt-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-label={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-[14px] py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center px-0" : "px-4"
              )}
              style={{
                backgroundColor: active ? "rgb(26, 11, 84)" : "transparent",
                color: active ? "#ffffff" : "rgb(131, 121, 158)",
                boxShadow: active ? "0 4px 14px rgba(26, 11, 84, 0.15)" : "none",
              }}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className={cn("border-t border-black/[0.05] p-4", collapsed && "flex justify-center p-3")}>
        <div className={cn("flex items-center gap-3", collapsed && "gap-0")}>
          <UserButton afterSignOutUrl="/" />
          {!collapsed && (
            <span className="text-xs font-medium" style={{ color: "rgb(131, 121, 158)" }}>
              Account Settings
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}