import React from "react";

const HIGHLIGHT_TERMS = [
  "CONFIRMED PHISHING",
  "LIKELY PHISHING",
  "SUSPICIOUS",
  "SAFE",
  "collabstr",
  "typosquatting",
  "brand spoofing",
  "NXDOMAIN",
  "nameservers refused",
  "refused query",
  "inactive/suspended",
  "credential",
  "password",
  "urgency",
  "malware",
  "unreachable",
  "phishing",
  "URLhaus",
  "Let's Encrypt",
];

interface FormattedTextProps {
  text: string;
}

export function HighlightedSummary({ text }: FormattedTextProps) {
  // Clean raw AI scratchpad or numbered prompt artifact headers
  let cleanText = text
    .replace(/^Here'?s a thinking process:[\s\S]*?(?=\n\n(?:This|Based|The|According)|\n\n[A-Z]|$)/i, "")
    .replace(/^(?:\d+\.\s+\*\*[\s\S]*?\n\n)+/gi, "")
    .trim();

  if (!cleanText) cleanText = text;

  // Split paragraphs
  const paragraphs = cleanText.split(/\n+/).filter((p) => p.trim().length > 0);

  // Helper to highlight security keywords inside paragraph text
  const renderParagraph = (paragraph: string, pIdx: number) => {
    // Regex matching any highlight term case-insensitively
    const regex = new RegExp(`\\b(${HIGHLIGHT_TERMS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "gi");
    const parts = paragraph.split(regex);

    return (
      <p key={pIdx} className="leading-relaxed text-foreground">
        {parts.map((part, i) => {
          const isMatch = HIGHLIGHT_TERMS.some((term) => term.toLowerCase() === part.toLowerCase());
          if (isMatch) {
            return (
              <mark
                key={i}
                className="rounded bg-blue-accent/15 px-1 py-0.5 font-medium text-foreground dark:text-blue-200"
              >
                {part}
              </mark>
            );
          }
          return <React.Fragment key={i}>{part}</React.Fragment>;
        })}
      </p>
    );
  };

  return (
    <div className="space-y-2.5 text-xs sm:text-sm">
      {paragraphs.map((para, idx) => renderParagraph(para, idx))}
    </div>
  );
}
