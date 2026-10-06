import type { AnySignal, FusionResult, RiskLabel } from "./types";

/**
 * Weights (v1 policy from scope.md):
 * linguistic:     30%
 * infrastructure: 35%
 * visual:         25%
 * qr_bonus:       10% (added when a QR payload resolves to a suspicious domain or penalty)
 *
 * Thresholds (v1 policy):
 * 0 – 24:   Safe
 * 25 – 54:  Suspicious
 * 55 – 79:  Likely phishing
 * 80 – 100: Confirmed phishing
 */
export function fuseRiskScores(signals: readonly AnySignal[]): FusionResult {
  const linguisticSignal = signals.find((s) => s.stream === "linguistic");
  const infrastructureSignal = signals.find((s) => s.stream === "infrastructure");
  const visualSignal = signals.find((s) => s.stream === "visual");
  const qrSignal = signals.find((s) => s.stream === "qr");

  // Determine available base streams
  const lingScore = linguisticSignal && linguisticSignal.score !== null ? linguisticSignal.score : null;
  const infraScore = infrastructureSignal && infrastructureSignal.score !== null ? infrastructureSignal.score : null;
  const visualScore = visualSignal && visualSignal.score !== null ? visualSignal.score : null;

  // Base weights for the primary streams
  let lingWeight = 0.30;
  let infraWeight = 0.35;
  let visWeight = 0.25;

  // Re-distribute weights if any stream is genuinely unavailable
  const availableStreams: { stream: string; baseWeight: number; score: number }[] = [];
  if (lingScore !== null) availableStreams.push({ stream: "linguistic", baseWeight: lingWeight, score: lingScore });
  if (infraScore !== null) availableStreams.push({ stream: "infrastructure", baseWeight: infraWeight, score: infraScore });
  if (visualScore !== null) availableStreams.push({ stream: "visual", baseWeight: visWeight, score: visualScore });

  let weightedSum = 0;
  let linguisticContribution = 0;
  let infrastructureContribution = 0;
  let visualContribution = 0;

  if (availableStreams.length > 0) {
    const totalAvailableBase = availableStreams.reduce((acc, curr) => acc + curr.baseWeight, 0);

    for (const item of availableStreams) {
      // Available streams scale to 1.0 (100%)
      const effectiveWeight = item.baseWeight / totalAvailableBase;
      const contribution = item.score * effectiveWeight;

      if (item.stream === "linguistic") linguisticContribution = Math.round(contribution * 10) / 10;
      if (item.stream === "infrastructure") infrastructureContribution = Math.round(contribution * 10) / 10;
      if (item.stream === "visual") visualContribution = Math.round(contribution * 10) / 10;

      weightedSum += contribution;
    }
  }

  // QR bonus evaluation
  let qrBonus = 0;
  if (qrSignal && qrSignal.score !== null) {
    // If QR payload is suspicious or adds penalty
    qrBonus = Math.round((qrSignal.score * 0.10) * 10) / 10;
    weightedSum += qrBonus;
  }

  const finalScore = Math.min(Math.max(Math.round(weightedSum), 0), 100);

  let label: RiskLabel;
  if (finalScore <= 24) {
    label = "safe";
  } else if (finalScore <= 54) {
    label = "suspicious";
  } else if (finalScore <= 79) {
    label = "likely_phishing";
  } else {
    label = "confirmed_phishing";
  }

  return {
    score: finalScore,
    label,
    weightsVersion: "v1",
    breakdown: {
      linguisticContribution,
      infrastructureContribution,
      visualContribution,
      qrBonus,
    },
  };
}
