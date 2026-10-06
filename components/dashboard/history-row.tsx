"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface HistoryRowProps {
  href: string;
  ariaLabel: string;
  children: ReactNode;
}

export function HistoryRow({ href, ariaLabel, children }: HistoryRowProps) {
  const router = useRouter();
  const open = () => router.push(href);

  return (
    <tr
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className="cursor-pointer transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </tr>
  );
}