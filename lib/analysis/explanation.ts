import type { AnySignal, FusionResult } from "./types";

const OPENROUTER_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
] as const;

export async function generateExplanation(
  fusion: FusionResult,
  signals: readonly AnySignal[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_KEY;
  if (!apiKey) {
    return generateFallbackExplanation(fusion, signals);
  }

  // Format the deterministic signal evidence for Nemotron to explain in plain language
  const signalSummary: string[] = [];

  for (const sig of signals) {
    if (sig.stream === "linguistic") {
      const p = sig.payload;
      signalSummary.push(
        `- Linguistic Stream: Score ${sig.score ?? "N/A"}/100. Matches: urgency=[${p.urgencyMatches.join(", ")}], brands=[${p.brandMatches.join(", ")}], credentialHarvest=[${p.credentialMatches.join(", ")}], shortenedLinks=[${p.shortenedUrlMatches.join(", ")}], flaggedWords=[${p.profanityOrThreatMatches.join(", ")}]. Details: ${p.details}`
      );
    } else if (sig.stream === "infrastructure") {
      const p = sig.payload;
      signalSummary.push(
        `- Infrastructure Stream: Score ${sig.score ?? "N/A"}/100. Domain: ${p.domain ?? "N/A"}, HTTPS: ${p.isHttps ? "yes" : "no"}, DNS resolved: ${p.dnsResolved ? "yes" : "no"}, URLhaus threat match: ${p.threatFeedMatch ? "yes (" + p.threatDetails + ")" : "no"}. Findings: ${p.reasons.join(", ") || "clean"}`
      );
    } else if (sig.stream === "visual") {
      const p = sig.payload;
      signalSummary.push(
        `- Visual Stream: Score ${sig.score ?? "N/A"}/100. Form detected: ${p.formDetected ? "yes" : "no"}, Password input: ${p.passwordInputDetected ? "yes" : "no"}, Impersonation: ${p.brandImpersonationDetected ? "yes (" + p.impersonatedBrand + ")" : "none"}. Findings: ${(p.visualFindings ?? []).join(", ") || "clean"}`
      );
    } else if (sig.stream === "qr") {
      const p = sig.payload;
      signalSummary.push(
        `- QR Code Stream: Detected: ${p.detected ? "yes" : "no"}. Payload: ${p.payloadText ?? "none"}. Suspicious URL: ${p.isSuspiciousUrl ? "yes" : "no"}`
      );
    }
  }

  const prompt = `You are PhishCatcher's security analysis explainer.
Based ONLY on the following deterministic security analysis findings, generate a concise, objective, 2 to 3 paragraph plain-language explanation for an end-user explaining why this item was classified as "${fusion.label.toUpperCase()}" with a composite risk score of ${fusion.score}/100.

Rules:
1. Do not invent any new facts, technical scores, or infrastructure records.
2. Directly reference the concrete evidence provided below (e.g. urgent wording, credential prompts, suspicious domains, unencrypted HTTP, or URLhaus hits).
3. Provide actionable security guidance for the user in the final sentence.
4. Keep the tone calm, professional, and clear.

Analysis Findings:
Overall Score: ${fusion.score} / 100
Classification: ${fusion.label}
Signal Streams:
${signalSummary.join("\n")}
`;

  for (const model of OPENROUTER_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://phishcatcher.local",
          "X-Title": "PhishCatcher",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an explainability module for PhishCatcher. Output ONLY the final plain-language explanation in 2 to 3 cohesive paragraphs. Absolutely DO NOT include internal reasoning, thinking processes, outlines, scratchpads, or bullet points.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim().length > 0) {
          // Strip any residual thinking tags or preamble
          let clean = content
            .replace(/<think>[\s\S]*?<\/think>/gi, "")
            .replace(/Here'?s a thinking process:[\s\S]*?(?=\n\n[A-Z]|$)/gi, "")
            .trim();

          if (clean.length > 50) {
            return clean;
          }
        }
      }
    } catch {
      // Try next model if timeout or error
      continue;
    }
  }

  return generateFallbackExplanation(fusion, signals);
}

function generateFallbackExplanation(
  fusion: FusionResult,
  signals: readonly AnySignal[]
): string {
  const parts: string[] = [];

  parts.push(
    `This submission was assessed with a composite risk score of ${fusion.score}/100 and classified as ${fusion.label.replace("_", " ").toUpperCase()}.`
  );

  const findings: string[] = [];
  for (const sig of signals) {
    if (sig.stream === "linguistic" && sig.score && sig.score > 20) {
      findings.push(`linguistic patterns such as ${sig.payload.details}`);
    }
    if (sig.stream === "infrastructure" && sig.payload.reasons.length > 0) {
      findings.push(`infrastructure anomalies including ${sig.payload.reasons.join(", ")}`);
    }
    if (sig.stream === "qr" && sig.payload.detected) {
      findings.push(`an embedded QR code payload pointing to ${sig.payload.payloadText}`);
    }
  }

  if (findings.length > 0) {
    parts.push(`The classification was driven by ${findings.join("; ")}.`);
  } else {
    parts.push("No significant suspicious indicators or active threats were found across the analysed signal streams.");
  }

  if (fusion.score >= 55) {
    parts.push("Recommendation: Do not click any links, open attachments, or input personal credentials or payment details.");
  } else {
    parts.push("Recommendation: Always verify the sender address and domain spelling before interacting with unexpected requests.");
  }

  return parts.join(" ");
}
