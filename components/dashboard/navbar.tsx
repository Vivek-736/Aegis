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
  Menu,
  ScanSearch,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "New Analysis", icon: ScanSearch, exact: true },
  { href: "/dashboard/history", label: "My History", icon: ClipboardList },
  { href: "/dashboard/quiz", label: "Phishing Detective", icon: GraduationCap },
  { href: "/dashboard/stats", label: "Live Statistics", icon: BarChart3 },
];

export function DashboardNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.05] bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-85">
          <span
            className="flex size-9 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "rgb(249, 249, 249)",
              boxShadow: "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a",
            }}
          >
            <Image src="/logo.svg" alt="PhishCatcher" width={22} height={22} priority />
          </span>
          <span
            className="text-lg font-medium tracking-tight"
            style={{ color: "rgb(26, 11, 84)" }}
          >
            PhishCatcher
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center gap-1.5 rounded-full p-1.5"
          style={{ backgroundColor: "rgb(249, 249, 249)" }}
        >
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all"
                )}
                style={{
                  backgroundColor: active ? "rgb(26, 11, 84)" : "transparent",
                  color: active ? "#ffffff" : "rgb(131, 121, 158)",
                  boxShadow: active ? "0 2px 10px rgba(26, 11, 84, 0.15)" : "none",
                }}
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions / User Profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            <span>Workspace Active</span>
          </div>
          <UserButton afterSignOutUrl="/" />

          {/* Mobile menu hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden flex size-9 items-center justify-center rounded-xl border border-black/[0.08] bg-white text-[#1A0B54]"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-black/[0.05] bg-white px-6 py-4 space-y-2">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-medium transition-all"
                style={{
                  backgroundColor: active ? "rgb(26, 11, 84)" : "rgb(249, 249, 249)",
                  color: active ? "#ffffff" : "rgb(26, 11, 84)",
                }}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
