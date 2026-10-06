export type InputType = "url" | "sms" | "image" | "document";

export type RiskLabel = "safe" | "suspicious" | "likely_phishing" | "confirmed_phishing";

export interface ArtifactResult {
  kind: "qr" | "url" | "text";
  value: string;
}

export interface LinguisticSignal {
  stream: "linguistic";
  score: number | null; // 0-100 or null if unavailable
  unavailable?: string;
  payload: {
    urgencyMatches: string[];
    brandMatches: string[];
    credentialMatches: string[];
    shortenedUrlMatches: string[];
    profanityOrThreatMatches: string[];
    rawScore: number;
    details: string;
  };
}

export interface InfrastructureSignal {
  stream: "infrastructure";
  score: number | null; // 0-100 or null if unavailable
  unavailable?: string;
  payload: {
    domain?: string;
    sourceUrl?: string;
    redirectedUrl?: string;
    tld?: string;
    ipAddress?: string;
    country?: string;
    countryCode?: string;
    countryFlagEmoji?: string;
    city?: string;
    latitude?: number | null;
    longitude?: number | null;
    hostingProvider?: string;
    asn?: string | number | null;
    certificateDetails?: string;
    brandDetected?: string | null;
    isHttps?: boolean;
    dnsResolved?: boolean;
    dnsRecords?: string[];
    redirectCount?: number;
    threatFeedMatch?: boolean;
    threatDetails?: string;
    domainAgeDays?: number | null;
    rawScore: number;
    reasons: string[];
  };
}

export interface VisualSignal {
  stream: "visual";
  score: number | null; // 0-100 or null if unavailable
  unavailable?: string;
  payload: {
    sessionId?: string;
    sessionUrl?: string;
    screenshotUrl?: string;
    formDetected?: boolean;
    passwordInputDetected?: boolean;
    brandImpersonationDetected?: boolean;
    impersonatedBrand?: string | null;
    visualFindings?: string[];
    rawScore: number;
  };
}

export interface QRSignal {
  stream: "qr";
  score: number | null; // 0-100 or null if unavailable
  unavailable?: string;
  payload: {
    detected: boolean;
    payloadText?: string;
    isSuspiciousUrl?: boolean;
    bonusPenaltyApplied?: number;
    details?: string;
  };
}

export type AnySignal = LinguisticSignal | InfrastructureSignal | VisualSignal | QRSignal;

export interface FusionResult {
  score: number; // 0 - 100
  label: RiskLabel;
  weightsVersion: string;
  breakdown: {
    linguisticContribution: number;
    infrastructureContribution: number;
    visualContribution: number;
    qrBonus: number;
  };
}

export interface ExplanationResult {
  explanation: string;
}

export interface AnalysisPipelineResult {
  artifacts: ArtifactResult[];
  signals: AnySignal[];
  fusion: FusionResult;
  explanation: string;
  screenshotUrl?: string;
  browserbaseSessionId?: string;
}
