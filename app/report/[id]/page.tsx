import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { analyses, reports, signals, artifacts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Shield,
  ShieldX,
  ArrowLeft,
  ExternalLink,
  Eye,
  AlertTriangle,
  Globe2,
} from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { GeoMap } from "@/components/ui/geo-map";
import { HighlightedSummary } from "@/components/ui/highlighted-summary";

const LABEL_CONFIG = {
  safe: {
    label: "Safe",
    badge: "border-border bg-card text-foreground",
    icon: ShieldCheck,
    description: "No significant malicious indicators or credential-harvesting patterns found.",
  },
  suspicious: {
    label: "Suspicious",
    badge: "border-blue-accent/30 bg-blue-accent/10 text-blue-accent",
    icon: Shield,
    description: "Anomalous attributes detected. Exercise heightened vigilance.",
  },
  likely_phishing: {
    label: "Likely Phishing",
    badge: "border-border bg-card text-foreground font-semibold",
    icon: ShieldAlert,
    description: "High volume of phishing indicators, urgency language, or infrastructure red flags.",
  },
  confirmed_phishing: {
    label: "Confirmed Phishing",
    badge: "border-border bg-foreground text-background font-bold",
    icon: ShieldX,
    description: "Confirmed active phishing campaign, threat-feed match, or known attack signature.",
  },
} as const;

function formatDateTime(date: Date) {
  const d = new Date(date);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const day = d.getDate();
  const suffix = ["th", "st", "nd", "rd"][(day % 10 > 3 || Math.floor((day % 100) / 10) === 1) ? 0 : day % 10];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;

  return `${month} ${day}${suffix} ${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

function AnalysisSkeleton() {
  return (
    <div className="mx-auto max-w-5xl" role="status" aria-live="polite">
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="size-6 animate-spin text-blue-accent" aria-hidden="true" />
          <div>
            <p className="text-base font-semibold text-foreground">
              Executing Multimodal Analysis Pipeline…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Deconstructing input across linguistic heuristics, infrastructure records, and cloud-isolated visual render.
            </p>
          </div>
        </div>
        <div className="mt-8 space-y-4" aria-hidden="true">
          <div className="h-6 w-1/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-xl bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-44 rounded-xl bg-muted animate-pulse" />
            <div className="h-44 rounded-xl bg-muted animate-pulse" />
          </div>
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

  // Retrieve analysis row
  const analysisRows = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, id))
    .limit(1);

  const analysis = analysisRows[0];
  if (!analysis || analysis.userId !== userId) notFound();

  const isRunning = analysis.status === "pending" || analysis.status === "running";

  // Fetch associated report, signals, and artifacts if completed
  let reportData = null;
  let signalRows: (typeof signals.$inferSelect)[] = [];
  let artifactRows: (typeof artifacts.$inferSelect)[] = [];

  if (analysis.status === "complete") {
    const reportList = await db
      .select()
      .from(reports)
      .where(eq(reports.analysisId, id))
      .limit(1);
    reportData = reportList[0] || null;

    signalRows = await db
      .select()
      .from(signals)
      .where(eq(signals.analysisId, id));

    artifactRows = await db
      .select()
      .from(artifacts)
      .where(eq(artifacts.analysisId, id));
  }

  const infraSignal = signalRows.find((s) => s.stream === "infrastructure");
  const visualSignal = signalRows.find((s) => s.stream === "visual");

  // Extract infrastructure payload
  const infraPayload = (infraSignal?.payload as {
    sourceUrl?: string;
    redirectedUrl?: string;
    domain?: string;
    tld?: string;
    ipAddress?: string;
    country?: string;
    countryFlagEmoji?: string;
    city?: string;
    latitude?: number | null;
    longitude?: number | null;
    hostingProvider?: string;
    asn?: string | number | null;
    certificateDetails?: string;
    brandDetected?: string | null;
  }) || {};

  const sourceUrl =
    infraPayload.sourceUrl ||
    analysis.inputText ||
    artifactRows.find((a) => a.kind === "url")?.value ||
    "--";

  const redirectedUrl = infraPayload.redirectedUrl || sourceUrl;
  const brand = infraPayload.brandDetected || "--";
  const tld = infraPayload.tld || (sourceUrl.includes(".") ? sourceUrl.split(".").pop()?.split("/")[0] : "--");
  const ipAddress = infraPayload.ipAddress || "--";
  const locationText = infraPayload.country
    ? `${infraPayload.countryFlagEmoji ? infraPayload.countryFlagEmoji + " " : ""}${infraPayload.country}`
    : "--";
  const hostingProvider = infraPayload.hostingProvider || "--";
  const detectionDateFormatted = formatDateTime(analysis.completedAt || analysis.createdAt);
  const asnNumber = infraPayload.asn ? String(infraPayload.asn) : "--";
  const certificateDetails = infraPayload.certificateDetails || "--";

  // Browserbase session url
  const visualPayload = (visualSignal?.payload as {
    sessionUrl?: string;
    sessionId?: string;
    visualFindings?: string[];
  }) || {};
  const browserSessionUrl = reportData?.screenshotUrl || visualPayload.sessionUrl;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Dashboard
          </Link>
          <span className="text-xs font-mono text-muted-foreground">
            Analysis · {analysis.id.slice(0, 8)}
          </span>
        </div>

        {isRunning ? (
          <AnalysisSkeleton />
        ) : analysis.status === "failed" ? (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="size-6 text-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Analysis Could Not Complete</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
              We encountered an issue processing this submission. The destination might be unreachable or unresponsive.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
            >
              Analyze Another Link
            </Link>
          </div>
        ) : reportData ? (
          (() => {
            const cfg = LABEL_CONFIG[reportData.label];
            const Icon = cfg.icon;

            return (
              <div className="space-y-6">
                {/* 1. Header & Verdict Banner with Highlighted Executive Summary */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs uppercase tracking-wider font-semibold ${cfg.badge}`}>
                          <Icon className="size-3.5" aria-hidden="true" />
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Score {Math.round(reportData.score)} / 100
                        </span>
                      </div>
                      <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {cfg.description}
                      </h1>
                    </div>

                    <div className="flex items-baseline gap-2 rounded-xl border border-border bg-muted/40 px-5 py-3">
                      <span className="text-3xl font-extrabold tracking-tight text-foreground">
                        {Math.round(reportData.score)}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>

                  {/* Cleaned Executive Summary with Highlights */}
                  {reportData.explanation && (
                    <div className="mt-5 rounded-xl border border-border bg-muted/30 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Executive Summary
                      </p>
                      <HighlightedSummary text={reportData.explanation} />
                    </div>
                  )}
                </div>

                {/* 2. Unified Grid Layout: Scan Results + Geo Map (Left) & Isolated Browser Preview (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column (7 cols): Scan Results + Geographic Location */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Scan Results Card */}
                    <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-sm">
                      <h2 className="text-base font-bold tracking-tight text-foreground mb-6">
                        Scan Results
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
                        {/* Source URL & Brand */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Source URL:</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-foreground break-all">
                              {sourceUrl}
                            </span>
                            {sourceUrl !== "--" && <CopyButton text={sourceUrl} />}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Brand:</p>
                          <p className="text-foreground">{brand}</p>
                        </div>

                        {/* Redirected URL & TLD */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Redirected URL:</p>
                          <p className="font-mono text-xs text-foreground break-all">
                            {redirectedUrl}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">TLD:</p>
                          <p className="font-mono text-foreground">{tld}</p>
                        </div>

                        {/* IP Address & Location */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">IP Address:</p>
                          <p className="font-mono text-sm text-blue-accent font-medium">
                            {ipAddress}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Location:</p>
                          <p className="text-foreground font-medium">{locationText}</p>
                        </div>

                        {/* Social Media & Hosting Provider */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Insight Social Media Finding:
                          </p>
                          <p className="text-foreground">--</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Hosting Provider:</p>
                          <p className="text-foreground font-medium">{hostingProvider}</p>
                        </div>

                        {/* Detection Date & ASN */}
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">Detection Date:</p>
                          <p className="text-foreground">{detectionDateFormatted}</p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">ASN:</p>
                          <p className="font-mono text-foreground">{asnNumber}</p>
                        </div>

                        {/* Job ID */}
                        <div className="space-y-1 sm:col-span-2">
                          <p className="text-xs font-medium text-muted-foreground">Job ID:</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-foreground">
                              {analysis.id}
                            </span>
                            <CopyButton text={analysis.id} />
                          </div>
                        </div>

                        {/* Certificate Details */}
                        <div className="space-y-1 sm:col-span-2 border-t border-border pt-4">
                          <p className="text-xs font-medium text-muted-foreground">Certificate Details:</p>
                          <p className="font-mono text-xs text-foreground break-all">
                            {certificateDetails}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Server Geographic Location */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe2 className="size-4 text-blue-accent" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Server Geographic Location
                        </h3>
                      </div>
                      <GeoMap
                        latitude={infraPayload.latitude ?? null}
                        longitude={infraPayload.longitude ?? null}
                        city={infraPayload.city}
                        country={infraPayload.country}
                        ipAddress={infraPayload.ipAddress}
                      />
                    </div>
                  </div>

                  {/* Right Column (5 cols): Isolated Browser Live Preview */}
                  <div className="lg:col-span-5">
                    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm sticky top-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="size-4 text-blue-accent" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Isolated Browser Preview
                          </h3>
                        </div>
                        {browserSessionUrl && (
                          <a
                            href={browserSessionUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-accent hover:underline font-medium"
                          >
                            Inspect <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>

                      {browserSessionUrl ? (
                        <div className="aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-background">
                          <iframe
                            src={browserSessionUrl}
                            title="Isolated Browserbase Render"
                            className="size-full border-0"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                          />
                        </div>
                      ) : (
                        <div className="aspect-4/3 w-full flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 p-6 text-center">
                          <Eye className="size-8 text-muted-foreground/40 mb-2" />
                          <p className="text-xs font-medium text-foreground">Browser Preview Inactive</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Remote sandbox session not initialized for this submission.
                          </p>
                        </div>
                      )}

                      <div className="mt-4 rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span>SANDBOX ISOLATION</span>
                          <span className="text-blue-accent font-semibold">ACTIVE</span>
                        </div>
                        <p>
                          Executed in a remote cloud container via Browserbase. Untrusted JavaScript, cookies, and network payloads are safely isolated from your client machine.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
            <p className="text-sm font-medium text-foreground">Report assembling…</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Please refresh shortly to view the computed results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}