import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { decodeQrFromUrl } from "./qr";
import { extractOcrFromMedia } from "./ocr";
import { analyzeLinguistic } from "./linguistic";
import { analyzeInfrastructure } from "./infrastructure";
import { analyzeVisual } from "./visual";
import { fuseRiskScores } from "./fusion";
import { generateExplanation } from "./explanation";
import { reconstructAttackChain } from "./attack-chain";
import type {
  AnalysisPipelineResult,
  ArtifactResult,
  AnySignal,
  InputType,
  FusionResult,
} from "./types";

export interface PipelineInput {
  inputType: InputType;
  inputText?: string | null;
  fileUrl?: string | null;
}

/**
 * Define LangGraph State Schema for the Multimodal Pipeline
 */
const AnalysisStateAnnotation = Annotation.Root({
  input: Annotation<PipelineInput>({
    reducer: (_, next) => next,
    default: () => ({ inputType: "url" }),
  }),
  primaryUrl: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  primaryText: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  artifacts: Annotation<ArtifactResult[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  signals: Annotation<AnySignal[]>({
    reducer: (prev, next) => [...prev, ...next],
    default: () => [],
  }),
  fusion: Annotation<FusionResult | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  explanation: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  liveSessionUrl: Annotation<string | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
  liveSessionId: Annotation<string | undefined>({
    reducer: (_, next) => next,
    default: () => undefined,
  }),
});

type AnalysisState = typeof AnalysisStateAnnotation.State;

/**
 * Node 1: Ingestion & Extraction Node
 * Handles text, URL, QR deterministic decoding, and Gemini Vision OCR
 */
async function ingestionNode(state: AnalysisState): Promise<Partial<AnalysisState>> {
  const input = state.input;
  const newArtifacts: ArtifactResult[] = [];
  const newSignals: AnySignal[] = [];
  let primaryUrl = state.primaryUrl;
  let primaryText = state.primaryText;

  if (input.inputType === "url" && input.inputText) {
    primaryUrl = input.inputText.trim();
    newArtifacts.push({ kind: "url", value: primaryUrl });
    primaryText = primaryUrl;
  } else if (input.inputType === "sms" && input.inputText) {
    primaryText = input.inputText.trim();
    newArtifacts.push({ kind: "text", value: primaryText });

    const urlMatch = primaryText.match(/https?:\/\/[^\s"'<>]+/);
    if (urlMatch) {
      primaryUrl = urlMatch[0];
      newArtifacts.push({ kind: "url", value: primaryUrl });
    }
  } else if ((input.inputType === "image" || input.inputType === "document") && input.fileUrl) {
    // Concurrently decode QR codes with @zxing/library and perform Gemini 3.5 flash OCR
    const [qrRes, ocrRes] = await Promise.allSettled([
      decodeQrFromUrl(input.fileUrl),
      extractOcrFromMedia(input.fileUrl),
    ]);

    if (qrRes.status === "fulfilled") {
      newSignals.push(qrRes.value);
      if (qrRes.value.payload.payloadText) {
        newArtifacts.push({ kind: "qr", value: qrRes.value.payload.payloadText });
        if (/^https?:\/\//i.test(qrRes.value.payload.payloadText)) {
          primaryUrl = qrRes.value.payload.payloadText;
        }
      }
    }

    if (ocrRes.status === "fulfilled" && ocrRes.value.extractedText) {
      primaryText = ocrRes.value.extractedText;
      newArtifacts.push({ kind: "text", value: primaryText });

      if (!primaryUrl && ocrRes.value.detectedUrls.length > 0) {
        primaryUrl = ocrRes.value.detectedUrls[0];
        newArtifacts.push({ kind: "url", value: primaryUrl });
      }
    }
  }

  return {
    primaryUrl,
    primaryText,
    artifacts: newArtifacts,
    signals: newSignals,
  };
}

/**
 * Node 2: Multimodal Signal Streams Node
 * Executes Linguistic, Infrastructure, and Browserbase Visual streams in parallel
 */
async function streamsNode(state: AnalysisState): Promise<Partial<AnalysisState>> {
  const newSignals: AnySignal[] = [];
  let liveSessionUrl: string | undefined;
  let liveSessionId: string | undefined;

  const tasks: Promise<void>[] = [];

  // 1. Linguistic Stream
  if (state.primaryText) {
    tasks.push(
      (async () => {
        try {
          const ling = analyzeLinguistic(state.primaryText);
          newSignals.push(ling);
        } catch {
          // Fallback
        }
      })()
    );
  }

  // 2. Infrastructure & Browserbase Visual Streams (for URLs or extracted QR destinations)
  if (state.primaryUrl) {
    const targetUrl = state.primaryUrl;

    // Infrastructure stream
    tasks.push(
      (async () => {
        try {
          const infra = await analyzeInfrastructure(targetUrl);
          newSignals.push(infra);
        } catch {
          // Fallback
        }
      })()
    );

    // Visual stream with Browserbase cloud browser rendering
    tasks.push(
      (async () => {
        try {
          const vis = await analyzeVisual(targetUrl);
          if (vis.payload.sessionId) liveSessionId = vis.payload.sessionId;
          if (vis.payload.sessionUrl) liveSessionUrl = vis.payload.sessionUrl;
          newSignals.push(vis);
        } catch {
          // Fallback
        }
      })()
    );
  }

  await Promise.allSettled(tasks);

  return {
    signals: newSignals,
    liveSessionUrl,
    liveSessionId,
  };
}

/**
 * Node 3: Risk Fusion & Explanation Node
 * Calculates composite risk score and generates Nemotron plain-language explanation
 */
async function fusionAndExplanationNode(state: AnalysisState): Promise<Partial<AnalysisState>> {
  const fusion = fuseRiskScores(state.signals);
  const explanation = await generateExplanation(fusion, state.signals);

  return {
    fusion,
    explanation,
  };
}

// Build the LangGraph Orchestrator
const workflow = new StateGraph(AnalysisStateAnnotation)
  .addNode("ingestion", ingestionNode)
  .addNode("streams", streamsNode)
  .addNode("fusion_and_explanation", fusionAndExplanationNode)
  .addEdge(START, "ingestion")
  .addEdge("ingestion", "streams")
  .addEdge("streams", "fusion_and_explanation")
  .addEdge("fusion_and_explanation", END);

export const analysisGraph = workflow.compile();

/**
 * Pipeline execution entrypoint using LangGraph orchestrator
 */
export async function runAnalysisPipeline(input: PipelineInput): Promise<AnalysisPipelineResult> {
  const finalState = await analysisGraph.invoke({ input });

  const fusion = finalState.fusion || {
    score: 0,
    label: "safe",
    weightsVersion: "v1",
    breakdown: {
      linguisticContribution: 0,
      infrastructureContribution: 0,
      visualContribution: 0,
      qrBonus: 0,
    },
  };

  const attackChain = reconstructAttackChain({
    inputType: input.inputType,
    inputText: input.inputText,
    fileUrl: input.fileUrl,
    artifacts: finalState.artifacts,
    signals: finalState.signals,
  });

  return {
    artifacts: finalState.artifacts,
    signals: finalState.signals,
    fusion,
    explanation: finalState.explanation,
    screenshotUrl: finalState.liveSessionUrl,
    browserbaseSessionId: finalState.liveSessionId,
    attackChain,
  };
}
