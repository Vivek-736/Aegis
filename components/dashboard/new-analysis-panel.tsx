"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, MessageSquare, Upload, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing/client";

type Tab = "url" | "sms" | "upload";

const cardShadow = "0 3px 9.1px #3f4a7e0d, 0 1px 29px #3f4a7e1a";

export function NewAnalysisPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("url");
  const [urlInput, setUrlInput] = useState("");
  const [smsInput, setSmsInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<{ key: string; url: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("imageOrDocument", {
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      if (res && res[0]) {
        setUploadedFile({
          key: res[0].key,
          url: res[0].url || res[0].ufsUrl || `https://utfs.io/f/${res[0].key}`,
          name: res[0].name,
        });
      }
    },
    onUploadError: (err: Error) => {
      setIsUploading(false);
      setError(err.message || "File upload failed. Max size is 10 MB.");
    },
  });

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "url", label: "Inspect URL", icon: Globe2 },
    { id: "sms", label: "SMS / Message", icon: MessageSquare },
    { id: "upload", label: "Upload Image / PDF", icon: Upload },
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
      const isPdf = uploadedFile.name.toLowerCase().endsWith(".pdf");
      body = {
        inputType: isPdf ? "document" : "image",
        fileKey: uploadedFile.key,
        fileUrl: uploadedFile.url,
      };
    }

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error occurred");
      }
      const { id } = await res.json() as { id: string };
      router.push(`/report/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Tab switcher */}
      <div
        className="mb-6 flex gap-1 rounded-full p-1.5"
        style={{
          backgroundColor: "rgb(249, 249, 249)",
          boxShadow: cardShadow,
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setError(null); }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all"
            )}
            style={{
              backgroundColor: tab === id ? "rgb(26, 11, 84)" : "transparent",
              color: tab === id ? "#ffffff" : "rgb(131, 121, 158)",
              boxShadow: tab === id ? "0 2px 8px rgba(26, 11, 84, 0.15)" : "none",
            }}
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        className="rounded-[18px] p-7"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: cardShadow,
          border: "1px solid rgba(0, 0, 0, 0.04)",
        }}
      >
        {tab === "url" && (
          <div className="space-y-3">
            <label
              className="block text-sm font-medium"
              style={{ color: "rgb(26, 11, 84)" }}
            >
              Target Web Address
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://suspicious-domain.com/login"
              className="w-full rounded-xl px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#CA45FF]"
              style={{
                backgroundColor: "rgb(249, 249, 249)",
                color: "rgb(26, 11, 84)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSubmit(); }}
            />
            <p className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              PhishCatcher isolates this URL in a sandboxed Browserbase session and evaluates DNS/WHOIS signals.
            </p>
          </div>
        )}

        {tab === "sms" && (
          <div className="space-y-3">
            <label
              className="block text-sm font-medium"
              style={{ color: "rgb(26, 11, 84)" }}
            >
              Message / Email Body Text
            </label>
            <textarea
              rows={5}
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              placeholder="Paste the suspicious SMS, WhatsApp, or email content here..."
              className="w-full rounded-xl p-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#CA45FF]"
              style={{
                backgroundColor: "rgb(249, 249, 249)",
                color: "rgb(26, 11, 84)",
                border: "1px solid rgba(0, 0, 0, 0.05)",
              }}
            />
            <p className="text-xs" style={{ color: "rgb(131, 121, 158)" }}>
              NLP heuristics check for artificial urgency, monetary fraud, impersonation cues, and embedded links.
            </p>
          </div>
        )}

        {tab === "upload" && (
          <div className="space-y-3">
            <label
              className="block text-sm font-medium"
              style={{ color: "rgb(26, 11, 84)" }}
            >
              Image, Flyer, or Document (with QR code)
            </label>
            {uploadedFile ? (
              <div
                className="flex items-center justify-between rounded-xl p-3.5"
                style={{
                  backgroundColor: "rgb(249, 249, 249)",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-8 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: "rgba(202, 69, 255, 0.12)",
                      color: "rgb(202, 69, 255)",
                    }}
                  >
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium" style={{ color: "rgb(26, 11, 84)" }}>
                      {uploadedFile.name}
                    </p>
                    <p className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                      Staged for OCR & QR decoding
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="text-xs font-medium hover:underline cursor-pointer"
                  style={{ color: "rgb(202, 69, 255)" }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div
                className="rounded-xl border border-dashed border-black/[0.12] p-4 text-center transition-all"
                style={{ backgroundColor: "rgb(249, 249, 249)" }}
              >
                <input
                  id="direct-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setError(null);
                    setIsUploading(true);
                    try {
                      const res = await startUpload([file]);
                      if (res && res[0]) {
                        setUploadedFile({
                          key: res[0].key,
                          url: res[0].url || res[0].ufsUrl || `https://utfs.io/f/${res[0].key}`,
                          name: res[0].name,
                        });
                      } else {
                        throw new Error("No upload response received");
                      }
                    } catch (err: unknown) {
                      const msg = err instanceof Error ? err.message : "File upload failed. Max size is 10 MB.";
                      setError(msg);
                    } finally {
                      setIsUploading(false);
                      // Reset input value
                      e.target.value = "";
                    }
                  }}
                />

                <div className="flex flex-col items-center justify-center gap-2 py-2">
                  <div
                    className="flex size-9 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "rgba(202, 69, 255, 0.1)",
                      color: "rgb(202, 69, 255)",
                    }}
                  >
                    <Upload className="size-4" />
                  </div>
                  <div>
                    <label
                      htmlFor="direct-file-input"
                      className="cursor-pointer inline-block rounded-full px-4 py-1.5 text-xs font-medium text-white shadow-xs transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "rgb(26, 11, 84)" }}
                    >
                      {isUploading ? "Uploading..." : "Choose Image or PDF"}
                    </label>
                  </div>
                  <span className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
                    or drag & drop file here
                  </span>
                </div>
              </div>
            )}
            <p className="text-[11px]" style={{ color: "rgb(131, 121, 158)" }}>
              Supported: JPEG, PNG, WebP, GIF, PDF (max 10 MB).
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            className="mt-4 flex items-center gap-2 rounded-xl p-3 text-xs"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              color: "rgb(185, 28, 28)",
            }}
          >
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit action */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading || isUploading}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "rgb(26, 11, 84)",
              boxShadow: "0 4px 14px rgba(26, 11, 84, 0.2)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Running Pipeline Telemetry...</span>
              </>
            ) : isUploading ? (
              <span>Uploading File...</span>
            ) : (
              <>
                <span>Launch Analysis</span>
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}