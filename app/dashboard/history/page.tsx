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

const LABEL_CONFIG = {
  safe: { label: "Safe", icon: ShieldCheck, className: "text-foreground" },
  suspicious: { label: "Suspicious", icon: Shield, className: "text-foreground" },
  likely_phishing: { label: "Likely Phishing", icon: ShieldAlert, className: "text-blue-accent" },
  confirmed_phishing: { label: "Confirmed Phishing", icon: ShieldX, className: "text-foreground" },
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
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-accent">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your last 50 analyses. Click any row to view the full report.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No analyses yet. Run your first one.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left font-semibold text-foreground">Input</th>
                <th className="px-5 py-3 text-left font-semibold text-foreground">Type</th>
                <th className="px-5 py-3 text-left font-semibold text-foreground">Result</th>
                <th className="px-5 py-3 text-left font-semibold text-foreground">Score</th>
                <th className="px-5 py-3 text-left font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const cfg = row.label ? LABEL_CONFIG[row.label] : null;
                const Icon = cfg?.icon;
                const summary = row.inputText
                  ? row.inputText.slice(0, 48) + (row.inputText.length > 48 ? "…" : "")
                  : row.fileUrl
                  ? "Uploaded file"
                  : "—";

                return (
                  <HistoryRow
                    key={row.id}
                    href={`/report/${row.id}`}
                    ariaLabel={`Open report: ${summary}`}
                  >
                    <td className="max-w-xs truncate px-5 py-3.5 font-mono text-xs text-foreground">
                      {summary}
                    </td>
                    <td className="px-5 py-3.5 capitalize text-muted-foreground">{row.inputType}</td>
                    <td className="px-5 py-3.5">
                      {cfg && Icon ? (
                        <span className={`flex items-center gap-1.5 font-medium ${cfg.className}`}>
                          <Icon className="size-3.5" />
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="text-muted-foreground capitalize">{row.status}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-foreground">
                      {row.score != null ? `${Math.round(row.score)}/100` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
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