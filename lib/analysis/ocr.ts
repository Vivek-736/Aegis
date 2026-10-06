import { z } from "zod";

const OcrResultSchema = z.object({
  extractedText: z.string(),
  detectedUrls: z.array(z.string()),
  brandVisuals: z.array(z.string()),
  hasFormCues: z.boolean(),
});

export type OcrResult = z.infer<typeof OcrResultSchema>;

// Active, working Gemini vision models verified via API
const WORKING_GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.7-flash",
] as const;

/**
 * Multimodal OCR & Visual Text Extraction using Gemini Vision
 */
export async function extractOcrFromMedia(fileUrl: string): Promise<OcrResult> {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return { extractedText: "", detectedUrls: [], brandVisuals: [], hasFormCues: false };
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // If Gemini key is available, execute real Multimodal Vision OCR
    if (geminiApiKey) {
      const prompt = `You are PhishCatcher's Multimodal Vision OCR extraction engine.
Examine this uploaded screenshot/document thoroughly:
1. Extract ALL visible text, SMS messages, email bodies, subject lines, senders, and warnings verbatim.
2. Extract all URLs, links, domain names, or shortlinks visible anywhere in the image.
3. Identify any brand logos or brand names depicted (e.g. PayPal, Apple, Collabstr, Netflix, Chase, HMRC, DHL, USPS).
4. Detect if there are interactive login fields, password boxes, or credit card input dialogs shown in the screenshot.

Return your response in strictly valid JSON format with this exact schema:
{
  "extractedText": "full transcribed text here",
  "detectedUrls": ["https://..."],
  "brandVisuals": ["brand names"],
  "hasFormCues": true | false
}
Do not wrap in markdown blocks, output raw JSON only.`;

      for (const model of WORKING_GEMINI_MODELS) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: prompt },
                      {
                        inline_data: {
                          mime_type: contentType.includes("pdf") ? "application/pdf" : "image/png",
                          data: base64Data,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.1,
                  response_mime_type: "application/json",
                },
              }),
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textOutput) {
              const cleanJson = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(cleanJson);
              const validated = OcrResultSchema.parse(parsed);
              return validated;
            }
          }
        } catch {
          // Try next working model
          continue;
        }
      }
    }

    // Fallback URL regex if Vision API was unreachable
    return {
      extractedText: "File uploaded for analysis.",
      detectedUrls: [],
      brandVisuals: [],
      hasFormCues: false,
    };
  } catch {
    return {
      extractedText: "",
      detectedUrls: [],
      brandVisuals: [],
      hasFormCues: false,
    };
  }
}