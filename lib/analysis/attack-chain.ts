import type {
  InputType,
  ArtifactResult,
  AnySignal,
  LinguisticSignal,
  InfrastructureSignal,
  VisualSignal,
  QRSignal,
  AttackChain,
  AttackStage,
} from "./types";

interface ReconstructionInput {
  inputType: InputType;
  inputText?: string | null;
  fileUrl?: string | null;
  artifacts: ArtifactResult[];
  signals: AnySignal[];
}

/**
 * Deterministic Attack Chain Reconstruction Engine
 * Constructs a step-by-step narrative of an attack based strictly on verified signal telemetry.
 * Does not modify risk scores or fabricate unsubstantiated attack stages.
 */
export function reconstructAttackChain(input: ReconstructionInput): AttackChain {
  const stages: AttackStage[] = [];
  const detectedTechniques: string[] = [];

  // Extract individual typed signals
  const lingSig = input.signals.find((s): s is LinguisticSignal => s.stream === "linguistic");
  const infraSig = input.signals.find((s): s is InfrastructureSignal => s.stream === "infrastructure");
  const visSig = input.signals.find((s): s is VisualSignal => s.stream === "visual");
  const qrSig = input.signals.find((s): s is QRSignal => s.stream === "qr");

  // Track summary details
  let deliveryMethod = "Direct URL Submission";
  let primaryDeception: string | undefined;
  const destinationDomain: string | undefined = infraSig?.payload.domain;
  let credentialCollectionDetected = false;
  let qrInvolvementDetected = false;

  // ── Stage 1: Input & Delivery Vector ──────────────────────────────────────────
  if (input.inputType === "sms") {
    deliveryMethod = "SMS / Text Message";
    stages.push({
      id: "stage-input",
      type: "input",
      title: "Delivery Vector: Mobile SMS / Message",
      description: "The attack was delivered as a text message directly to the target's mobile device.",
      educationalContext: "Smishing (SMS phishing) exploits high open rates and smaller mobile screens where URLs are harder to inspect.",
      severity: "neutral",
      evidence: [
        `Message length: ${input.inputText?.length ?? 0} characters`,
        ...(input.inputText ? [`Snippet: "${input.inputText.slice(0, 70)}${input.inputText.length > 70 ? "..." : ""}"`] : []),
      ],
      sourceSignalIds: ["input.sms"],
    });
  } else if (input.inputType === "image" || input.inputType === "document") {
    deliveryMethod = input.inputType === "document" ? "PDF Document Attachment" : "Image Flyer / QR Graphic";
    stages.push({
      id: "stage-input",
      type: "input",
      title: `Delivery Vector: ${input.inputType === "document" ? "Document Attachment" : "Digital Graphic"}`,
      description: "The target received an image or document containing embedded visual lures or matrix barcodes.",
      educationalContext: "Attackers embed lures in images and PDFs to evade perimeter email text and link security filters.",
      severity: "neutral",
      evidence: [
        `Ingested artifact: ${input.fileUrl ? "Uploaded media file" : "Direct binary"}`,
        `Extracted artifacts count: ${input.artifacts.length}`,
      ],
      sourceSignalIds: ["input.file"],
    });
  } else {
    deliveryMethod = "Web Link / Direct URL";
    stages.push({
      id: "stage-input",
      type: "input",
      title: "Delivery Vector: Web Link / Direct URL",
      description: "The target was directed to follow a web hyperlink.",
      educationalContext: "Hyperlink lures are distributed via email, social networks, or ad campaigns.",
      severity: "neutral",
      evidence: [
        `Submitted URL: ${input.inputText || "—"}`,
      ],
      sourceSignalIds: ["input.url"],
    });
  }

  // ── Stage 2: QR Matrix Code (Quishing) ─────────────────────────────────────────
  if (qrSig && qrSig.payload.detected && !qrSig.unavailable) {
    qrInvolvementDetected = true;
    detectedTechniques.push("QR Matrix Code (Quishing)");
    const isSuspicious = qrSig.payload.isSuspiciousUrl;

    stages.push({
      id: "stage-qr",
      type: "qr",
      title: "Matrix Code Vector (Quishing)",
      description: `Decoded QR payload directs to destination: ${qrSig.payload.payloadText || "Embedded URL"}`,
      educationalContext: "Quishing tricks victims into scanning a QR code using personal phones, bypassing enterprise workstation endpoint protections.",
      severity: isSuspicious ? "high" : "medium",
      evidence: [
        `QR Matrix Detected: Yes`,
        `Decoded Destination: ${qrSig.payload.payloadText || "—"}`,
        ...(isSuspicious ? ["Payload destination matches suspicious threat profile"] : []),
      ],
      sourceSignalIds: ["qr.detected", "qr.payloadText"],
    });
  }

  // ── Stage 3: Social Engineering & Psychological Urgency ───────────────────────
  if (lingSig && !lingSig.unavailable && (lingSig.payload.urgencyMatches.length > 0 || lingSig.payload.profanityOrThreatMatches.length > 0)) {
    detectedTechniques.push("Urgency & Psychological Coercion");
    primaryDeception = "Urgency / Threat Coercion";

    stages.push({
      id: "stage-urgency",
      type: "social-engineering",
      title: "Psychological Pressure & Urgency",
      description: `Attacker manufactures false urgency: "${lingSig.payload.urgencyMatches.join('", "')}".`,
      educationalContext: "Attackers manufacture artificial time limits to bypass critical thinking and provoke panicked compliance.",
      severity: "high",
      evidence: [
        ...lingSig.payload.urgencyMatches.map((m) => `Urgency phrase: "${m}"`),
        ...lingSig.payload.profanityOrThreatMatches.map((t) => `Coercive/threat token: "${t}"`),
      ],
      sourceSignalIds: ["linguistic.urgencyMatches", "linguistic.profanityOrThreatMatches"],
    });
  }

  // ── Stage 4: Brand Impersonation & Spoofing ───────────────────────────────────
  const brandList: string[] = [];
  if (lingSig && !lingSig.unavailable && lingSig.payload.brandMatches.length > 0) {
    brandList.push(...lingSig.payload.brandMatches);
  }
  if (infraSig && !infraSig.unavailable && infraSig.payload.brandDetected) {
    brandList.push(infraSig.payload.brandDetected);
  }
  if (visSig && !visSig.unavailable && visSig.payload.impersonatedBrand) {
    brandList.push(visSig.payload.impersonatedBrand);
  }

  const uniqueBrands = Array.from(new Set(brandList));
  if (uniqueBrands.length > 0) {
    detectedTechniques.push("Brand Impersonation");
    primaryDeception = `Impersonation of ${uniqueBrands.join(", ")}`;

    stages.push({
      id: "stage-brand",
      type: "brand-impersonation",
      title: `Brand Impersonation: ${uniqueBrands.join(", ")}`,
      description: `The attack masquerades as legitimate communications from ${uniqueBrands.join(", ")}.`,
      educationalContext: "Brand impersonation leverages established customer trust to make requests for passwords or billing updates appear legitimate.",
      severity: "high",
      evidence: uniqueBrands.map((b) => `Spoofed Brand Identifier: "${b}"`),
      sourceSignalIds: [
        ...(lingSig?.payload.brandMatches.length ? ["linguistic.brandMatches"] : []),
        ...(infraSig?.payload.brandDetected ? ["infrastructure.brandDetected"] : []),
        ...(visSig?.payload.impersonatedBrand ? ["visual.impersonatedBrand"] : []),
      ],
    });
  }

  // ── Stage 5: URL Shortening & Link Obfuscation ────────────────────────────────
  if (lingSig && !lingSig.unavailable && lingSig.payload.shortenedUrlMatches.length > 0) {
    detectedTechniques.push("URL Obfuscation");

    stages.push({
      id: "stage-url-shortener",
      type: "url",
      title: "URL Shortening & Domain Masking",
      description: `Link is wrapped using URL shorteners: ${lingSig.payload.shortenedUrlMatches.join(", ")}.`,
      educationalContext: "Shorteners obscure the genuine hostname and destination parameters from basic inspection.",
      severity: "medium",
      evidence: lingSig.payload.shortenedUrlMatches.map((m) => `Shortened URL pattern: ${m}`),
      sourceSignalIds: ["linguistic.shortenedUrlMatches"],
    });
  }

  // ── Stage 6: Multi-Hop Redirection ────────────────────────────────────────────
  if (infraSig && !infraSig.unavailable && (infraSig.payload.redirectCount || 0) > 0) {
    detectedTechniques.push("Multi-Hop Redirection");

    stages.push({
      id: "stage-redirect",
      type: "redirect",
      title: `Multi-Hop Redirection (${infraSig.payload.redirectCount} hop${infraSig.payload.redirectCount === 1 ? "" : "s"})`,
      description: `The initial URL bounces through intermediate redirect hops before reaching ${infraSig.payload.domain || "the final host"}.`,
      educationalContext: "Redirect chains are configured to bypass static URL filters, sandbox scanners, and automated crawlers.",
      severity: (infraSig.payload.redirectCount || 0) > 2 ? "high" : "medium",
      evidence: [
        `Redirect hops recorded: ${infraSig.payload.redirectCount}`,
        ...(infraSig.payload.sourceUrl ? [`Initial URL: ${infraSig.payload.sourceUrl}`] : []),
        ...(infraSig.payload.redirectedUrl ? [`Final Endpoint: ${infraSig.payload.redirectedUrl}`] : []),
      ],
      sourceSignalIds: ["infrastructure.redirectCount", "infrastructure.redirectedUrl"],
    });
  }

  // ── Stage 7: Suspicious Domain & Host Infrastructure ──────────────────────────
  if (infraSig && !infraSig.unavailable && (infraSig.payload.reasons.length > 0 || infraSig.payload.threatFeedMatch || (infraSig.payload.domainAgeDays !== null && (infraSig.payload.domainAgeDays ?? 365) < 30))) {
    const isThreatMatch = infraSig.payload.threatFeedMatch;
    const isYoung = infraSig.payload.domainAgeDays !== null && (infraSig.payload.domainAgeDays ?? 365) < 30;

    if (isThreatMatch) detectedTechniques.push("Known Threat Feed Match");
    if (isYoung) detectedTechniques.push("Newly Registered Domain");

    stages.push({
      id: "stage-infra",
      type: "domain",
      title: isThreatMatch ? "Flagged Threat Infrastructure" : isYoung ? "Newly Registered Disposable Domain" : "Suspicious Host Infrastructure",
      description: `Domain ${infraSig.payload.domain || "host"} exhibits high-risk infrastructure signals.`,
      educationalContext: "Phishing campaigns heavily rely on fresh domains registered within days or weeks of launch to evade domain reputation blocklists.",
      severity: isThreatMatch ? "critical" : isYoung ? "high" : "medium",
      evidence: [
        ...(infraSig.payload.domainAgeDays !== null ? [`Domain age: ${infraSig.payload.domainAgeDays} days old`] : []),
        ...(isThreatMatch ? ["Verified threat feed / blocklist match: YES"] : []),
        ...(infraSig.payload.ipAddress ? [`Host IP: ${infraSig.payload.ipAddress} (${infraSig.payload.hostingProvider || "Unknown ASN"})`] : []),
        ...infraSig.payload.reasons.map((r) => `Signal reason: ${r}`),
      ],
      sourceSignalIds: ["infrastructure.reasons", "infrastructure.domainAgeDays", "infrastructure.threatFeedMatch"],
    });
  }

  // ── Stage 8: Visual Replication & Deception ───────────────────────────────────
  if (visSig && !visSig.unavailable && (visSig.payload.visualFindings?.length || 0) > 0) {
    detectedTechniques.push("Visual Portal Replication");

    stages.push({
      id: "stage-visual",
      type: "visual-deception",
      title: "Visual Brand Replication",
      description: "The remote rendered page mimics layout and brand elements to deceive the visitor.",
      educationalContext: "Visual clones mirror the color palette, logos, and input styling of authentic company portals.",
      severity: "high",
      evidence: (visSig.payload.visualFindings || []).map((f) => `Visual telemetry: ${f}`),
      sourceSignalIds: ["visual.visualFindings"],
    });
  }

  // ── Stage 9: Credential Harvesting ────────────────────────────────────────────
  const hasPass = visSig && !visSig.unavailable && visSig.payload.passwordInputDetected;
  const hasForm = visSig && !visSig.unavailable && visSig.payload.formDetected;
  const hasCredKeywords = lingSig && !lingSig.unavailable && lingSig.payload.credentialMatches.length > 0;

  if (hasPass || hasForm || hasCredKeywords) {
    credentialCollectionDetected = true;
    detectedTechniques.push("Credential Harvesting");

    stages.push({
      id: "stage-harvest",
      type: "credential-harvesting",
      title: "Credential & Data Harvesting Form",
      description: "Interactive input fields solicit passwords, personal credentials, or payment data.",
      educationalContext: "The primary objective of credential phishing is exfiltrating passwords, OTP tokens, or credit card details for unauthorized account access.",
      severity: "critical",
      evidence: [
        ...(hasPass ? ["Password input element: DETECTED"] : []),
        ...(hasForm ? ["Interactive credential submission form: DETECTED"] : []),
        ...(hasCredKeywords ? lingSig.payload.credentialMatches.map((c) => `Solicitation phrase: "${c}"`) : []),
      ],
      sourceSignalIds: [
        ...(hasPass ? ["visual.passwordInputDetected"] : []),
        ...(hasForm ? ["visual.formDetected"] : []),
        ...(hasCredKeywords ? ["linguistic.credentialMatches"] : []),
      ],
    });
  }

  // ── Stage 10: Malicious Destination Impact (if critical signals present) ─────
  if (credentialCollectionDetected || infraSig?.payload.threatFeedMatch) {
    stages.push({
      id: "stage-destination",
      type: "malicious-destination",
      title: "Malicious Trap Destination",
      description: `Victim is routed to an attacker-controlled endpoint (${destinationDomain || "external host"}) designed to capture sensitive data.`,
      educationalContext: "Entering credentials into unverified endpoints leads to immediate account compromise and lateral network intrusion.",
      severity: "critical",
      evidence: [
        `Destination Host: ${destinationDomain || "Unverified domain"}`,
        `Threat Category: Credential Phishing & Identity Harvesting`,
      ],
      sourceSignalIds: ["infrastructure.domain", "fusion.policy"],
    });
  }

  // If no stages were flagged beyond input, add a clean verification stage
  if (stages.length === 1 && stages[0].type === "input") {
    stages.push({
      id: "stage-clean",
      type: "malicious-destination",
      title: "No Malicious Attack Chain Identified",
      description: "Deterministic signal streams did not detect brand spoofing, urgency coercion, newly registered infrastructure, or credential harvesting forms.",
      educationalContext: "Regular validation of unexpected links and attachments is critical for proactive defense.",
      severity: "neutral",
      evidence: ["All active telemetry streams returned low or nominal risk indices."],
      sourceSignalIds: ["fusion.safe"],
    });
  }

  return {
    version: "v1",
    stages,
    detectedTechniques: Array.from(new Set(detectedTechniques)),
    summary: {
      deliveryMethod,
      primaryDeception,
      destinationDomain,
      credentialCollectionDetected,
      qrInvolvementDetected,
    },
  };
}
