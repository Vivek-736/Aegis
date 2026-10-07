import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { analyses, reports, signals } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Globe,
  MessageSquare,
  FileImage,
  ScanQrCode,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Live Statistics — PhishCatcher",
  description: "Real-time aggregated threat classifications, input vector breakdowns, and pipeline stream telemetry.",
};

const cardShadow = "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Fetch all analyses and reports for the user
  const userAnalyses = await db
    .select({
      id: analyses.id,
      inputType: analyses.inputType,
      inputText: analyses.inputText,
      fileUrl: analyses.fileUrl,
      status: analyses.status,
      createdAt: analyses.createdAt,
      score: reports.score,
      label: reports.label,
    })
    .from(analyses)
    .leftJoin(reports, eq(reports.analysisId, analyses.id))
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt));

  // Fetch recent signals
  const allSignals = await db
    .select({
      stream: signals.stream,
      score: signals.score,
      unavailable: signals.unavailable,
    })
    .from(signals);

  const total = userAnalyses.length;
  const completed = userAnalyses.filter((a) => a.status === "complete" && a.score !== null);
  
  // Counts by label
  const safeCount = completed.filter((a) => a.label === "safe").length;
  const suspiciousCount = completed.filter((a) => a.label === "suspicious").length;
  const likelyCount = completed.filter((a) => a.label === "likely_phishing").length;
  const confirmedCount = completed.filter((a) => a.label === "confirmed_phishing").length;
  const threatsCount = likelyCount + confirmedCount;

  // Average risk score
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((acc, curr) => acc + (curr.score || 0), 0) / completed.length)
    : 0;

  // Breakdown by channel
  const urlCount = userAnalyses.filter((a) => a.inputType === "url").length;
  const smsCount = userAnalyses.filter((a) => a.inputType === "sms").length;
  const fileCount = userAnalyses.filter((a) => a.inputType === "image" || a.inputType === "document").length;

  // Stream averages
  const getStreamAvg = (streamName: string) => {
    const valid = allSignals.filter((s) => s.stream === streamName && s.score !== null && !s.unavailable);
    if (valid.length === 0) return 0;
    return Math.round(valid.reduce((acc, s) => acc + (s.score || 0), 0) / valid.length);
  };

  const linguisticAvg = getStreamAvg("linguistic");
  const infraAvg = getStreamAvg("infrastructure");
  const visualAvg = getStreamAvg("visual");
  const qrAvg = getStreamAvg("qr");

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
          style={{
            backgroundColor: "rgb(249, 249, 249)",
            padding: "6px 14px",
            color: "rgb(26, 11, 84)",
            boxShadow: cardShadow,
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: "rgb(43, 167, 255)" }}
          />
          <span>Telemetry & Security Intelligence</span>
        </div>
        <h1
          className="text-3xl font-medium tracking-tight"
          style={{ color: "rgb(26, 11, 84)", margin: 0 }}
        >
          Live Telemetry & Statistics
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
          Real-time aggregates of multimodal threat classifications, input vectors, and pipeline stream telemetry.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div
          className="rounded-[18px] p-6 transition-all"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(131, 121, 158)" }}>
              Total Analyses
            </span>
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(43, 167, 255, 0.1)", color: "rgb(43, 167, 255)" }}
            >
              <BarChart3 className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)" }}>
              {total}
            </span>
            <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              submissions
            </span>
          </div>
          <p className="mt-2 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            Processed via multimodal pipeline
          </p>
        </div>

        {/* Metric 2 */}
        <div
          className="rounded-[18px] p-6 transition-all"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(131, 121, 158)" }}>
              Detected Threats
            </span>
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "rgb(239, 68, 68)" }}
            >
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight" style={{ color: "rgb(239, 68, 68)" }}>
              {threatsCount}
            </span>
            <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              ({completed.length > 0 ? Math.round((threatsCount / completed.length) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-2 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            Likely or confirmed phishing attacks
          </p>
        </div>

        {/* Metric 3 */}
        <div
          className="rounded-[18px] p-6 transition-all"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(131, 121, 158)" }}>
              Average Risk Score
            </span>
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(202, 69, 255, 0.1)", color: "rgb(202, 69, 255)" }}
            >
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight" style={{ color: "rgb(26, 11, 84)" }}>
              {avgScore}
            </span>
            <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              / 100
            </span>
          </div>
          <p className="mt-2 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            Weighted risk fusion index
          </p>
        </div>

        {/* Metric 4 */}
        <div
          className="rounded-[18px] p-6 transition-all"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(131, 121, 158)" }}>
              Clean Verifications
            </span>
            <div
              className="flex size-8 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(43, 167, 255, 0.1)", color: "rgb(43, 167, 255)" }}
            >
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight" style={{ color: "rgb(43, 167, 255)" }}>
              {safeCount}
            </span>
            <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              ({completed.length > 0 ? Math.round((safeCount / completed.length) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-2 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            Legitimate verified items
          </p>
        </div>
      </div>

      {/* Two Column Grid: Classification Breakdown + Channel Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Classification Breakdown */}
        <div
          className="rounded-[18px] p-7"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <h2 className="text-lg font-medium" style={{ color: "rgb(26, 11, 84)" }}>
            Threat Classification Distribution
          </h2>
          <p className="mt-1 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            Distribution of analyzed submissions across risk policy bands.
          </p>

          {/* Stacked Progress Bar */}
          <div className="mt-6 flex h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
            {completed.length > 0 ? (
              <>
                <div
                  style={{ width: `${(safeCount / completed.length) * 100}%`, backgroundColor: "rgb(43, 167, 255)" }}
                  title={`Safe: ${safeCount}`}
                />
                <div
                  style={{ width: `${(suspiciousCount / completed.length) * 100}%`, backgroundColor: "rgb(254, 136, 27)" }}
                  title={`Suspicious: ${suspiciousCount}`}
                />
                <div
                  style={{ width: `${(likelyCount / completed.length) * 100}%`, backgroundColor: "rgb(202, 69, 255)" }}
                  title={`Likely Phishing: ${likelyCount}`}
                />
                <div
                  style={{ width: `${(confirmedCount / completed.length) * 100}%`, backgroundColor: "rgb(239, 68, 68)" }}
                  title={`Confirmed Phishing: ${confirmedCount}`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-200" />
            )}
          </div>

          {/* Breakdown Items */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "rgb(43, 167, 255)" }} />
                <span style={{ color: "rgb(26, 11, 84)" }} className="font-medium">Safe (0–24)</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: "rgb(131, 121, 158)" }}>{safeCount} items</span>
                <span className="font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                  {completed.length > 0 ? Math.round((safeCount / completed.length) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "rgb(254, 136, 27)" }} />
                <span style={{ color: "rgb(26, 11, 84)" }} className="font-medium">Suspicious (25–54)</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: "rgb(131, 121, 158)" }}>{suspiciousCount} items</span>
                <span className="font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                  {completed.length > 0 ? Math.round((suspiciousCount / completed.length) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "rgb(202, 69, 255)" }} />
                <span style={{ color: "rgb(26, 11, 84)" }} className="font-medium">Likely Phishing (55–79)</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: "rgb(131, 121, 158)" }}>{likelyCount} items</span>
                <span className="font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                  {completed.length > 0 ? Math.round((likelyCount / completed.length) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: "rgb(239, 68, 68)" }} />
                <span style={{ color: "rgb(26, 11, 84)" }} className="font-medium">Confirmed Phishing (80–100)</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: "rgb(131, 121, 158)" }}>{confirmedCount} items</span>
                <span className="font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                  {completed.length > 0 ? Math.round((confirmedCount / completed.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Vectors Distribution */}
        <div
          className="rounded-[18px] p-7"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <h2 className="text-lg font-medium" style={{ color: "rgb(26, 11, 84)" }}>
            Input Channels & Attack Vectors
          </h2>
          <p className="mt-1 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
            Submission distribution across URLs, SMS/text content, and file attachments.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {/* URL Channel */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "rgb(249, 249, 249)" }}
            >
              <div
                className="mx-auto mb-2 flex size-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(43, 167, 255, 0.1)", color: "rgb(43, 167, 255)" }}
              >
                <Globe className="size-4" />
              </div>
              <span className="text-xs font-medium" style={{ color: "rgb(26, 11, 84)" }}>URLs</span>
              <p className="mt-1 text-xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{urlCount}</p>
              <span className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                {total > 0 ? Math.round((urlCount / total) * 100) : 0}% of scans
              </span>
            </div>

            {/* SMS Channel */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "rgb(249, 249, 249)" }}
            >
              <div
                className="mx-auto mb-2 flex size-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(202, 69, 255, 0.1)", color: "rgb(202, 69, 255)" }}
              >
                <MessageSquare className="size-4" />
              </div>
              <span className="text-xs font-medium" style={{ color: "rgb(26, 11, 84)" }}>SMS / Text</span>
              <p className="mt-1 text-xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{smsCount}</p>
              <span className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                {total > 0 ? Math.round((smsCount / total) * 100) : 0}% of scans
              </span>
            </div>

            {/* File Channel */}
            <div
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: "rgb(249, 249, 249)" }}
            >
              <div
                className="mx-auto mb-2 flex size-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(254, 136, 27, 0.1)", color: "rgb(254, 136, 27)" }}
              >
                <FileImage className="size-4" />
              </div>
              <span className="text-xs font-medium" style={{ color: "rgb(26, 11, 84)" }}>Image / PDF</span>
              <p className="mt-1 text-xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{fileCount}</p>
              <span className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                {total > 0 ? Math.round((fileCount / total) * 100) : 0}% of scans
              </span>
            </div>
          </div>

          <div
            className="mt-6 rounded-xl p-4 flex items-center justify-between"
            style={{ backgroundColor: "rgb(249, 249, 249)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: "rgba(43, 167, 255, 0.1)", color: "rgb(43, 167, 255)" }}
              >
                <ScanQrCode className="size-4" />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                  Quishing & Barcode Decodes
                </p>
                <p className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                  Deterministic ZXing decoder telemetry active
                </p>
              </div>
            </div>
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={{ backgroundColor: "rgba(43, 167, 255, 0.1)", color: "rgb(43, 167, 255)" }}
            >
              Real-time
            </span>
          </div>
        </div>
      </div>

      {/* Signal Stream Telemetry */}
      <div
        className="rounded-[18px] p-7"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: cardShadow,
          border: "1px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium" style={{ color: "rgb(26, 11, 84)" }}>
              Signal Stream Risk Contribution
            </h2>
            <p className="mt-1 text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              Average risk scores produced across independent analysis streams.
            </p>
          </div>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgb(131, 121, 158)" }}>
            Fusion Weights: Ling (30%) · Infra (35%) · Vis (25%) · QR (10%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stream 1 */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "rgb(249, 249, 249)" }}>
            <span className="text-xs font-medium" style={{ color: "rgb(131, 121, 158)" }}>Linguistic Stream</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{linguisticAvg}</span>
              <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>/ 100 avg</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${linguisticAvg}%`, backgroundColor: "rgb(202, 69, 255)" }} />
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>NLP urgency & brand spoofing</p>
          </div>

          {/* Stream 2 */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "rgb(249, 249, 249)" }}>
            <span className="text-xs font-medium" style={{ color: "rgb(131, 121, 158)" }}>Infrastructure Stream</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{infraAvg}</span>
              <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>/ 100 avg</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${infraAvg}%`, backgroundColor: "rgb(43, 167, 255)" }} />
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>WHOIS age, DNS, & SSL</p>
          </div>

          {/* Stream 3 */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "rgb(249, 249, 249)" }}>
            <span className="text-xs font-medium" style={{ color: "rgb(131, 121, 158)" }}>Visual Isolated Stream</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{visualAvg}</span>
              <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>/ 100 avg</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${visualAvg}%`, backgroundColor: "rgb(254, 136, 27)" }} />
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>Browserbase remote render</p>
          </div>

          {/* Stream 4 */}
          <div className="rounded-xl p-5" style={{ backgroundColor: "rgb(249, 249, 249)" }}>
            <span className="text-xs font-medium" style={{ color: "rgb(131, 121, 158)" }}>QR Quishing Stream</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-medium" style={{ color: "rgb(26, 11, 84)" }}>{qrAvg}</span>
              <span className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>/ 100 avg</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full" style={{ width: `${qrAvg}%`, backgroundColor: "rgb(239, 68, 68)" }} />
            </div>
            <p className="mt-2 text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>Payload destination audit</p>
          </div>
        </div>
      </div>

      {/* Quick Link to History */}
      <div className="flex justify-between items-center rounded-2xl p-6" style={{ backgroundColor: "rgb(249, 249, 249)", boxShadow: cardShadow }}>
        <div>
          <h3 className="text-base font-medium" style={{ color: "rgb(26, 11, 84)" }}>
            Need full forensic breakdowns?
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgb(131, 121, 158)" }}>
            Access all historical sessions, Browserbase recordings, and OpenRouter AI explanations in your History log.
          </p>
        </div>
        <Link
          href="/dashboard/history"
          className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "rgb(26, 11, 84)" }}
        >
          <span>View Detailed History</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}