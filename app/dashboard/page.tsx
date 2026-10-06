import { NewAnalysisPanel } from "@/components/dashboard/new-analysis-panel";

export default function DashboardPage() {
  return (
    <div className="px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-accent">Dashboard</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">New Analysis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Submit a URL, message, or file to run a full phishing analysis.
        </p>
      </div>
      <NewAnalysisPanel />
    </div>
  );
}