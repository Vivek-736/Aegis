import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { analyses, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { 
  Loader2, 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  ShieldX } from "lucide-react";

const LABEL_CONFIG = {
  safe: { label: "Safe", icon: ShieldCheck },
  suspicious: { label: "Suspicious", icon: Shield },
  likely_phishing: { label: "Likely Phishing", icon: ShieldAlert },
  confirmed_phishing: { label: "Confirmed Phishing", icon: ShieldX },
} as const;

function AnalysisSkeleton() {
  return (
    <div className="mx-auto max-w-2xl" role="status" aria-live="polite">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="size-5 animate-spin text-blue-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            Analysing your submission…
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Signals are being gathered from the linguistic, infrastructure, and visual streams.
        </p>
        <div className="mt-6 space-y-3" aria-hidden="true">
          <div className="h-4 w-3/4 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
      <p className="sr-only">Analysis in progress</p>
    </div>
  );
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const rows = await db
    .select({
      id: analyses.id,
      userId: analyses.userId,
      status: analyses.status,
      inputType: analyses.inputType,
      createdAt: analyses.createdAt,
      score: reports.score,
      label: reports.label,
    })
    .from(analyses)
    .leftJoin(reports, eq(reports.analysisId, analyses.id))
    .where(eq(analyses.id, id))
    .limit(1);

  const row = rows[0];
  if (!row || row.userId !== userId) notFound();

  const isRunning = row.status === "pending" || row.status === "running";

  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-accent">Report</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          {isRunning ? "Analysis running" : "Analysis report"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {row.inputType === "url" || row.inputType === "sms"
            ? `Submitted ${new Date(row.createdAt).toLocaleString()}`
            : `File submitted ${new Date(row.createdAt).toLocaleString()}`}
        </p>
      </div>

      {isRunning ? (
        <AnalysisSkeleton />
      ) : row.status === "failed" ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-foreground">We could not complete this analysis.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Something went wrong while processing the submission. Please try again.
          </p>
        </div>
      ) : row.label != null && row.score != null ? (
        (() => {
          const cfg = LABEL_CONFIG[row.label];
          const Icon = cfg.icon;
          return (
            <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                  {cfg.label}
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {Math.round(row.score)}
                  <span className="text-sm font-medium text-muted-foreground">/100</span>
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                The full signal breakdown and isolated page render are coming with the analysis engine.
              </p>
            </div>
          );
        })()
      ) : (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-foreground">Report is being assembled.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Refresh in a moment — the analysis has finished but the report is not ready yet.
          </p>
        </div>
      )}
    </div>
  );
}