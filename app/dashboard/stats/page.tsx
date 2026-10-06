import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-accent">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">Live Statistics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aggregate totals and the threat-label breakdown chart arrive in Phase 4.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
        <BarChart3 className="mx-auto mb-4 size-8 text-blue-accent" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Statistics are still being wired up. Run an analysis and check your history in the meantime.
        </p>
      </div>
    </div>
  );
}