import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyses, artifacts, signals, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";
import { checkRateLimit } from "@/lib/ratelimit";

const bodySchema = z.discriminatedUnion("inputType", [
  z.object({ inputType: z.literal("url"), inputText: z.string().url() }),
  z.object({ inputType: z.literal("sms"), inputText: z.string().min(1).max(2000) }),
  z.object({
    inputType: z.enum(["image", "document"]),
    fileKey: z.string().min(1),
    fileUrl: z.string().url(),
  }),
]);

const PIPELINE_TIMEOUT_MS = 55000; // 55-second ceiling for Next.js 60s limit

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Rate limiting: max 10 analyses per user per hour
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const waitMin = Math.ceil((rateLimit.retryAfterSeconds || 60) / 60);
      return NextResponse.json(
        {
          error: `Rate limit reached (10 analyses/hour). Please wait ${waitMin} minute${waitMin > 1 ? "s" : ""} before submitting another analysis.`,
        },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parseResult = bodySchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid submission payload. Please check your input." },
        { status: 422 }
      );
    }
    const body = parseResult.data;

    const id = crypto.randomUUID();

    // 1. Insert initial running analysis record
    await db.insert(analyses).values({
      id,
      userId,
      inputType: body.inputType,
      inputText: "inputText" in body ? body.inputText : null,
      fileKey: "fileKey" in body ? body.fileKey : null,
      fileUrl: "fileUrl" in body ? body.fileUrl : null,
      status: "running",
    });

    // 2. Run multimodal analysis pipeline with 55s timeout ceiling
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Analysis pipeline timed out (55s limit)")), PIPELINE_TIMEOUT_MS)
      );

      const result = await Promise.race([
        runAnalysisPipeline({
          inputType: body.inputType,
          inputText: "inputText" in body ? body.inputText : null,
          fileUrl: "fileUrl" in body ? body.fileUrl : null,
        }),
        timeoutPromise,
      ]);

      // Persist artifacts
      for (const art of result.artifacts) {
        await db.insert(artifacts).values({
          id: crypto.randomUUID(),
          analysisId: id,
          kind: art.kind,
          value: art.value,
        });
      }

      // Persist signals
      for (const sig of result.signals) {
        await db.insert(signals).values({
          id: crypto.randomUUID(),
          analysisId: id,
          stream: sig.stream,
          score: sig.score,
          unavailable: sig.unavailable ?? null,
          payload: sig.payload,
        });
      }

      // Persist report
      await db.insert(reports).values({
        id: crypto.randomUUID(),
        analysisId: id,
        score: result.fusion.score,
        label: result.fusion.label,
        weightsVersion: result.fusion.weightsVersion,
        explanation: result.explanation,
        screenshotUrl: result.screenshotUrl ?? null,
      });

      // Mark analysis complete
      await db
        .update(analyses)
        .set({
          status: "complete",
          completedAt: new Date(),
        })
        .where(eq(analyses.id, id));
    } catch (pipelineErr) {
      console.error("[PIPELINE ERROR]", pipelineErr);
      await db
        .update(analyses)
        .set({
          status: "failed",
          completedAt: new Date(),
        })
        .where(eq(analyses.id, id));
    }

    return NextResponse.json({ id });
  } catch (err: unknown) {
    console.error("[ANALYSE]", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your analysis. Please try again." },
      { status: 500 }
    );
  }
}