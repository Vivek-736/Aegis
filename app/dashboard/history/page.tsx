import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { analyses, reports } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { HistoryRow } from "@/components/dashboard/history-row";
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Shield 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Analysis History — PhishCatcher",
  description: "Inspect historical threat analyses, evidence streams, and isolated browser session recordings.",
};

const cardShadow = "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a";

const LABEL_CONFIG = {
  safe: { label: "Safe", icon: ShieldCheck, color: "rgb(43, 167, 255)" },
  suspicious: { label: "Suspicious", icon: Shield, color: "rgb(254, 136, 27)" },
  likely_phishing: { label: "Likely Phishing", icon: ShieldAlert, color: "rgb(202, 69, 255)" },
  confirmed_phishing: { label: "Confirmed Phishing", icon: ShieldX, color: "rgb(239, 68, 68)" },
} as const;

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await db
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
    .orderBy(desc(analyses.createdAt))
    .limit(50);

  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8">
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
          <span>Telemetry History</span>
        </div>
        <h1
          className="text-3xl font-medium tracking-tight"
          style={{ color: "rgb(26, 11, 84)", margin: 0 }}
        >
          Analysis History
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
          Your latest 50 security analyses. Select any entry to inspect evidence streams and live session playback.
        </p>
      </div>

      {rows.length === 0 ? (
        <div
          className="rounded-[18px] p-12 text-center"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <p className="text-sm font-medium" style={{ color: "rgb(131, 121, 158)" }}>
            No analyses logged yet. Run your first submission from the New Analysis panel.
          </p>
        </div>
      ) : (
        <div
          className="rounded-[18px] overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            boxShadow: cardShadow,
            border: "1px solid rgba(0, 0, 0, 0.04)",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "rgb(249, 249, 249)", borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                <th className="px-6 py-4 text-left font-medium" style={{ color: "rgb(26, 11, 84)" }}>Artifact / Target</th>
                <th className="px-6 py-4 text-left font-medium" style={{ color: "rgb(26, 11, 84)" }}>Type</th>
                <th className="px-6 py-4 text-left font-medium" style={{ color: "rgb(26, 11, 84)" }}>Classification</th>
                <th className="px-6 py-4 text-left font-medium" style={{ color: "rgb(26, 11, 84)" }}>Score</th>
                <th className="px-6 py-4 text-left font-medium" style={{ color: "rgb(26, 11, 84)" }}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {rows.map((row) => {
                const cfg = row.label ? LABEL_CONFIG[row.label] : null;
                const Icon = cfg?.icon;
                const summary = row.inputText
                  ? row.inputText.slice(0, 48) + (row.inputText.length > 48 ? "…" : "")
                  : row.fileUrl
                  ? "Uploaded file artifact"
                  : "—";

                return (
                  <HistoryRow
                    key={row.id}
                    href={`/report/${row.id}`}
                    ariaLabel={`Open report: ${summary}`}
                  >
                    <td className="max-w-xs truncate px-6 py-4 font-mono text-xs" style={{ color: "rgb(26, 11, 84)" }}>
                      {summary}
                    </td>
                    <td className="px-6 py-4 capitalize" style={{ color: "rgb(131, 121, 158)" }}>
                      {row.inputType}
                    </td>
                    <td className="px-6 py-4">
                      {cfg && Icon ? (
                        <span className="flex items-center gap-1.5 font-medium" style={{ color: cfg.color }}>
                          <Icon className="size-3.5" />
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="capitalize" style={{ color: "rgb(131, 121, 158)" }}>{row.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                      {row.score != null ? `${Math.round(row.score)}/100` : "—"}
                    </td>
                    <td className="px-6 py-4" style={{ color: "rgb(131, 121, 158)" }}>
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </HistoryRow>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}