import type { Metadata } from "next";
import { NewAnalysisPanel } from "@/components/dashboard/new-analysis-panel";

export const metadata: Metadata = {
  title: "New Analysis — PhishCatcher",
  description: "Submit suspicious URLs, text, or QR artifacts for multimodal AI verification.",
};

export default function DashboardPage() {
  return (
    <div className="px-8 py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full text-xs font-medium uppercase tracking-wider"
          style={{
            backgroundColor: "rgb(249, 249, 249)",
            padding: "6px 14px",
            color: "rgb(26, 11, 84)",
            boxShadow: "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a",
          }}
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: "rgb(202, 69, 255)" }}
          />
          <span>Threat Scanner</span>
        </div>
        <h1
          className="text-3xl font-medium tracking-tight"
          style={{ color: "rgb(26, 11, 84)", margin: 0 }}
        >
          New Analysis
        </h1>
        <p className="mt-2 text-sm" style={{ color: "rgb(131, 121, 158)" }}>
          Submit a suspicious URL, message text, or QR artifact to launch the multimodal verification stream.
        </p>
      </div>

      <NewAnalysisPanel />
    </div>
  );
}