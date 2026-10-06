import { Filter } from "bad-words";
import {
  URGENCY_PHRASES,
  BRAND_IMPERSONATION_TOKENS,
  CREDENTIAL_HARVEST_PHRASES,
  SHORTENER_PATTERNS,
} from "./sms-corpus";
import type { LinguisticSignal } from "./types";

const badWordsFilter = new Filter();

export function analyzeLinguistic(text: string): LinguisticSignal {
  if (!text || text.trim().length === 0) {
    return {
      stream: "linguistic",
      score: null,
      unavailable: "Empty input text provided",
      payload: {
        urgencyMatches: [],
        brandMatches: [],
        credentialMatches: [],
        shortenedUrlMatches: [],
        profanityOrThreatMatches: [],
        rawScore: 0,
        details: "No content to evaluate.",
      },
    };
  }

  const normalized = text.toLowerCase();

  // 1. Check Urgency Phrases
  const urgencyMatches = URGENCY_PHRASES.filter((phrase) =>
    normalized.includes(phrase)
  );

  // 2. Check Brand Impersonation
  const brandMatches = BRAND_IMPERSONATION_TOKENS.filter((brand) =>
    new RegExp(`\\b${brand}\\b`, "i").test(text)
  );

  // 3. Check Credential Harvest Phrases
  const credentialMatches = CREDENTIAL_HARVEST_PHRASES.filter((harvest) =>
    normalized.includes(harvest)
  );

  // 4. Check Shortened URLs in text
  const shortenedUrlMatches: string[] = [];
  for (const regex of SHORTENER_PATTERNS) {
    const match = text.match(regex);
    if (match) {
      shortenedUrlMatches.push(match[0]);
    }
  }

  // 5. Check Profanity / Threat words using bad-words filter
  const words = text.split(/\s+/);
  const profanityOrThreatMatches: string[] = [];
  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, "");
    if (cleanWord.length > 2 && badWordsFilter.isProfane(cleanWord)) {
      profanityOrThreatMatches.push(cleanWord);
    }
  }

  // Calculate weighted linguistic score (0 - 100)
  // Each match category has an assigned risk weight
  let scoreAccumulator = 0;

  // Credential harvest is high severity
  scoreAccumulator += Math.min(credentialMatches.length * 30, 45);

  // Urgency phrases
  scoreAccumulator += Math.min(urgencyMatches.length * 20, 35);

  // Brand impersonation combined with urgency or credential asking
  if (brandMatches.length > 0) {
    const hasPressure = urgencyMatches.length > 0 || credentialMatches.length > 0;
    scoreAccumulator += hasPressure ? 25 : 10;
  }

  // Shortened URLs in SMS/text
  if (shortenedUrlMatches.length > 0) {
    scoreAccumulator += 20;
  }

  // Threat / aggressive language
  if (profanityOrThreatMatches.length > 0) {
    scoreAccumulator += 15;
  }

  const finalScore = Math.min(Math.round(scoreAccumulator), 100);

  const reasons: string[] = [];
  if (credentialMatches.length > 0) {
    reasons.push(`Contains credential-harvest terms (${credentialMatches.join(", ")})`);
  }
  if (urgencyMatches.length > 0) {
    reasons.push(`Contains urgency indicators (${urgencyMatches.join(", ")})`);
  }
  if (brandMatches.length > 0) {
    reasons.push(`Mentions known targets (${brandMatches.join(", ")})`);
  }
  if (shortenedUrlMatches.length > 0) {
    reasons.push(`Uses shortened URL redirect (${shortenedUrlMatches.join(", ")})`);
  }
  if (profanityOrThreatMatches.length > 0) {
    reasons.push(`Contains coercive or flagged language`);
  }

  const details = reasons.length > 0
    ? reasons.join("; ")
    : "No distinct linguistic indicators detected.";

  return {
    stream: "linguistic",
    score: finalScore,
    payload: {
      urgencyMatches,
      brandMatches,
      credentialMatches,
      shortenedUrlMatches,
      profanityOrThreatMatches,
      rawScore: finalScore,
      details,
    },
  };
}
