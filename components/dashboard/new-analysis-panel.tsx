"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Globe2, MessageSquare, Upload, ArrowRight, Loader2, AlertCircle, UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing/client";

type Tab = "url" | "sms" | "upload";

export function NewAnalysisPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [urlInput, setUrlInput] = useState("");
  const [smsInput, setSmsInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ key: string; url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "url", label: "Paste URL", icon: Globe2 },
    { id: "sms", label: "SMS / Text", icon: MessageSquare },
    { id: "upload", label: "Upload File", icon: Upload },
  ];

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    let body: Record<string, string> = {};
    if (tab === "url") {
      if (!urlInput.trim()) { setError("Please enter a URL."); setLoading(false); return; }
      body = { inputType: "url", inputText: urlInput.trim() };
    } else if (tab === "sms") {
      if (!smsInput.trim()) { setError("Please enter some text."); setLoading(false); return; }
      body = { inputType: "sms", inputText: smsInput.trim() };
    } else {
      if (!uploadedFile) { setError("Please upload a file first."); setLoading(false); return; }
      body = { inputType: "image", fileKey: uploadedFile.key, fileUrl: uploadedFile.url };
    }

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json() as { id: string };
      router.push(`/report/${id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-2xl border border-border bg-muted/40 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setError(null); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              tab === id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        {tab === "url" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Suspicious URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="https://suspicious-site.example.com/login"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
            />
            <p className="text-xs text-muted-foreground">
              The URL will be analysed for infrastructure signals and rendered in an isolated browser.
            </p>
          </div>
        )}

        {tab === "sms" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              SMS or suspicious message
            </label>
            <textarea
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              rows={6}
              placeholder="Paste the suspicious message here…"
              className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-accent/50"
            />
            <p className="text-xs text-muted-foreground">
              Text is analysed for urgency cues, brand impersonation, and embedded URLs.
            </p>
          </div>
        )}

        {tab === "upload" && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Image or document
            </label>
            {uploadedFile ? (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm text-foreground">{uploadedFile.name}</span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ) : (
              <UploadDropzone
                endpoint="imageOrDocument"
                onClientUploadComplete={(res) => {
                  const f = res[0];
                  if (f) setUploadedFile({ key: f.key, url: f.ufsUrl, name: f.name });
                }}
                onUploadError={(err) => setError(err.message)}
                className="ut-label:text-foreground ut-allowed-content:text-muted-foreground ut-button:bg-foreground ut-button:text-background"
                content={{
                  uploadIcon: (
                    <UploadIcon className="w-10 h-10" />
                  ),
                }}
              />
            )}
            <p className="text-xs text-muted-foreground">
              PNG, JPG, WebP, GIF, or PDF — max 10 MB. QR codes inside images are automatically decoded.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
            <AlertCircle className="size-4 shrink-0 text-blue-accent" />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 w-full gap-2"
          )}
        >
          {loading ? (
            <><Loader2 className="size-4 animate-spin" /> Analysing…</>
          ) : (
            <>Analyse <ArrowRight className="size-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}