import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyses, artifacts, signals, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { runAnalysisPipeline } from "@/lib/analysis/pipeline";

const bodySchema = z.discriminatedUnion("inputType", [
  z.object({ inputType: z.literal("url"), inputText: z.string().url() }),
  z.object({ inputType: z.literal("sms"), inputText: z.string().min(1).max(2000) }),
  z.object({
    inputType: z.enum(["image", "document"]),
    fileKey: z.string().min(1),
    fileUrl: z.string().url(),
  }),
]);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const body = bodySchema.parse(json);

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

    // 2. Run multimodal analysis pipeline synchronously
    try {
      const result = await runAnalysisPipeline({
        inputType: body.inputType,
        inputText: "inputText" in body ? body.inputText : null,
        fileUrl: "fileUrl" in body ? body.fileUrl : null,
      });

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
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    console.error("[ANALYSE]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}