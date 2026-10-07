import { reconstructAttackChain } from "../lib/analysis/attack-chain";
import type {
  LinguisticSignal,
  InfrastructureSignal,
  VisualSignal,
  QRSignal,
  ArtifactResult,
  AnySignal,
} from "../lib/analysis/types";

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log("\n🧪 Running Phase 5 Attack Reconstruction Engine Unit Tests...\n");

// Scenario 1: Clean URL with no suspicious indicators
{
  console.log("Scenario 1: Clean URL with no suspicious indicators");
  const signals: AnySignal[] = [];
  const artifacts: ArtifactResult[] = [{ kind: "url", value: "https://example.com" }];
  const chain = reconstructAttackChain({
    inputType: "url",
    inputText: "https://example.com",
    artifacts,
    signals,
  });

  assert(chain.stages.length >= 1, "Generates baseline stages");
  assert(chain.stages[0].type === "input", "First stage is input vector");
  assert(chain.detectedTechniques.length === 0, "Zero malicious techniques detected");
}

// Scenario 2: URL with suspicious infrastructure
{
  console.log("\nScenario 2: URL with suspicious infrastructure (Threat feed match, young domain)");
  const infra: InfrastructureSignal = {
    stream: "infrastructure",
    score: 85,
    payload: {
      domain: "secure-auth-update.xyz",
      domainAgeDays: 4,
      threatFeedMatch: true,
      rawScore: 85,
      reasons: ["Threat feed match", "Domain age < 7 days"],
    },
  };
  const chain = reconstructAttackChain({
    inputType: "url",
    inputText: "https://secure-auth-update.xyz",
    artifacts: [{ kind: "url", value: "https://secure-auth-update.xyz" }],
    signals: [infra],
  });

  assert(chain.detectedTechniques.includes("Known Threat Feed Match"), "Identifies threat feed match technique");
  assert(chain.detectedTechniques.includes("Newly Registered Domain"), "Identifies newly registered domain technique");
  const infraStage = chain.stages.find((s) => s.type === "domain");
  assert(infraStage?.severity === "critical", "Assigns critical severity to threat feed hits");
  assert(infraStage?.sourceSignalIds.includes("infrastructure.threatFeedMatch") ?? false, "Maps to source signal ID");
}

// Scenario 3: SMS with psychological urgency
{
  console.log("\nScenario 3: SMS with urgency coercion");
  const ling: LinguisticSignal = {
    stream: "linguistic",
    score: 70,
    payload: {
      urgencyMatches: ["act immediately", "account suspended"],
      brandMatches: [],
      credentialMatches: [],
      shortenedUrlMatches: [],
      profanityOrThreatMatches: ["action required"],
      rawScore: 70,
      details: "Urgency detected",
    },
  };
  const chain = reconstructAttackChain({
    inputType: "sms",
    inputText: "Your account is suspended. Act immediately!",
    artifacts: [{ kind: "text", value: "Your account is suspended. Act immediately!" }],
    signals: [ling],
  });

  assert(chain.summary.deliveryMethod === "SMS / Text Message", "Recognizes SMS delivery vector");
  assert(chain.detectedTechniques.includes("Urgency & Psychological Coercion"), "Identifies urgency tactic");
  const urgencyStage = chain.stages.find((s) => s.type === "social-engineering");
  assert(urgencyStage?.severity === "high", "Urgency marked high severity");
}

// Scenario 4: SMS with Brand Impersonation
{
  console.log("\nScenario 4: SMS with brand impersonation");
  const ling: LinguisticSignal = {
    stream: "linguistic",
    score: 60,
    payload: {
      urgencyMatches: [],
      brandMatches: ["HMRC", "Apple"],
      credentialMatches: [],
      shortenedUrlMatches: [],
      profanityOrThreatMatches: [],
      rawScore: 60,
      details: "Brand match",
    },
  };
  const chain = reconstructAttackChain({
    inputType: "sms",
    inputText: "HMRC refund available for Apple users",
    artifacts: [{ kind: "text", value: "HMRC refund available for Apple users" }],
    signals: [ling],
  });

  assert(chain.detectedTechniques.includes("Brand Impersonation"), "Detects brand impersonation");
  const brandStage = chain.stages.find((s) => s.type === "brand-impersonation");
  assert(brandStage?.title.includes("HMRC") ?? false, "Brand stage includes spoofed brand in title");
}

// Scenario 5: SMS with Credential Harvesting
{
  console.log("\nScenario 5: SMS with credential harvesting keywords");
  const ling: LinguisticSignal = {
    stream: "linguistic",
    score: 75,
    payload: {
      urgencyMatches: [],
      brandMatches: [],
      credentialMatches: ["enter your password", "confirm your details"],
      shortenedUrlMatches: [],
      profanityOrThreatMatches: [],
      rawScore: 75,
      details: "Harvesting keywords",
    },
  };
  const chain = reconstructAttackChain({
    inputType: "sms",
    inputText: "Please enter your password to confirm your details",
    artifacts: [{ kind: "text", value: "Please enter your password to confirm your details" }],
    signals: [ling],
  });

  assert(chain.summary.credentialCollectionDetected === true, "Flags credential collection in summary");
  const harvestStage = chain.stages.find((s) => s.type === "credential-harvesting");
  assert(harvestStage?.severity === "critical", "Harvesting stage marked critical");
}

// Scenario 6: QR Code Quishing
{
  console.log("\nScenario 6: QR matrix quishing vector");
  const qr: QRSignal = {
    stream: "qr",
    score: 80,
    payload: {
      detected: true,
      payloadText: "https://fake-parking-payment.com",
      isSuspiciousUrl: true,
      bonusPenaltyApplied: 10,
    },
  };
  const chain = reconstructAttackChain({
    inputType: "image",
    fileUrl: "https://utfs.io/f/qr-code.png",
    artifacts: [{ kind: "qr", value: "https://fake-parking-payment.com" }],
    signals: [qr],
  });

  assert(chain.summary.qrInvolvementDetected === true, "Flags QR involvement in summary");
  assert(chain.detectedTechniques.includes("QR Matrix Code (Quishing)"), "Identifies Quishing technique");
}

// Scenario 7: Shortened URL
{
  console.log("\nScenario 7: Shortened URL obfuscation");
  const ling: LinguisticSignal = {
    stream: "linguistic",
    score: 40,
    payload: {
      urgencyMatches: [],
      brandMatches: [],
      credentialMatches: [],
      shortenedUrlMatches: ["bit.ly/claim-prize"],
      profanityOrThreatMatches: [],
      rawScore: 40,
      details: "Shortener found",
    },
  };
  const chain = reconstructAttackChain({
    inputType: "url",
    inputText: "https://bit.ly/claim-prize",
    artifacts: [{ kind: "url", value: "https://bit.ly/claim-prize" }],
    signals: [ling],
  });

  assert(chain.detectedTechniques.includes("URL Obfuscation"), "Identifies URL obfuscation");
}

// Scenario 8: Multi-Hop Redirection
{
  console.log("\nScenario 8: Multi-hop redirection");
  const infra: InfrastructureSignal = {
    stream: "infrastructure",
    score: 65,
    payload: {
      domain: "destination-portal.xyz",
      sourceUrl: "https://tracker.net/hop1",
      redirectedUrl: "https://destination-portal.xyz/login",
      redirectCount: 3,
      rawScore: 65,
      reasons: ["3 redirects detected"],
    },
  };
  const chain = reconstructAttackChain({
    inputType: "url",
    inputText: "https://tracker.net/hop1",
    artifacts: [{ kind: "url", value: "https://tracker.net/hop1" }],
    signals: [infra],
  });

  assert(chain.detectedTechniques.includes("Multi-Hop Redirection"), "Identifies redirection");
  const redStage = chain.stages.find((s) => s.type === "redirect");
  assert(redStage?.evidence.some((e) => e.includes("3")) ?? false, "Records redirect count in evidence");
}

// Scenario 9: Fake Login Page & Password Field Detection
{
  console.log("\nScenario 9: Fake login page via isolated Browserbase render");
  const vis: VisualSignal = {
    stream: "visual",
    score: 90,
    payload: {
      formDetected: true,
      passwordInputDetected: true,
      brandImpersonationDetected: true,
      impersonatedBrand: "Microsoft 365",
      visualFindings: ["Microsoft logo replicated", "Password form present"],
      rawScore: 90,
    },
  };
  const chain = reconstructAttackChain({
    inputType: "url",
    inputText: "https://login-microsoft365-verify.com",
    artifacts: [{ kind: "url", value: "https://login-microsoft365-verify.com" }],
    signals: [vis],
  });

  assert(chain.detectedTechniques.includes("Credential Harvesting"), "Identifies credential harvesting");
  assert(chain.detectedTechniques.includes("Visual Portal Replication"), "Identifies visual cloning");
  assert(chain.summary.credentialCollectionDetected === true, "Flags credential collection");
}

// Scenario 10: Unavailable Signal & Multiple Simultaneous Techniques
{
  console.log("\nScenario 10: Partial / unavailable signals & multiple techniques");
  const ling: LinguisticSignal = {
    stream: "linguistic",
    score: 80,
    payload: {
      urgencyMatches: ["urgent action"],
      brandMatches: ["FedEx"],
      credentialMatches: ["update billing"],
      shortenedUrlMatches: ["tinyurl.com/pkg"],
      profanityOrThreatMatches: [],
      rawScore: 80,
      details: "Urgency + brand + shortener",
    },
  };
  const visUnavailable: VisualSignal = {
    stream: "visual",
    score: null,
    unavailable: "Browserbase timed out",
    payload: { rawScore: 0 },
  };
  const chain = reconstructAttackChain({
    inputType: "sms",
    inputText: "FedEx: urgent action update billing tinyurl.com/pkg",
    artifacts: [{ kind: "text", value: "FedEx: urgent action update billing tinyurl.com/pkg" }],
    signals: [ling, visUnavailable],
  });

  assert(chain.detectedTechniques.length >= 3, "Handles multiple techniques concurrently");
  assert(chain.stages.some((s) => s.type === "brand-impersonation"), "Retains brand stage");
  assert(chain.stages.some((s) => s.type === "social-engineering"), "Retains urgency stage");
  assert(chain.stages.some((s) => s.type === "url"), "Retains shortener stage");
}

console.log(`\n🎉 Results: ${passed} / ${total} tests passed.\n`);
