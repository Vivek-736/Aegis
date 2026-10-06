import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyses } from "@/lib/db/schema";
import { z } from "zod";

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

    await db.insert(analyses).values({
      id,
      userId,
      inputType: body.inputType,
      inputText: "inputText" in body ? body.inputText : null,
      fileKey: "fileKey" in body ? body.fileKey : null,
      fileUrl: "fileUrl" in body ? body.fileUrl : null,
      status: "pending",
    });

    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    console.error("[ANALYSE]", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}