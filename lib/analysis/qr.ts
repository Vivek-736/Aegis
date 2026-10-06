import {
  BinaryBitmap,
  HybridBinarizer,
  RGBLuminanceSource,
  QRCodeReader,
} from "@zxing/library";
import { Jimp } from "jimp";
import type { QRSignal } from "./types";

/**
 * Deterministically decode QR codes from image buffers using Jimp and @zxing/library.
 * Returns the decoded text or null if no QR code is found.
 */
export async function decodeQrFromBuffer(buffer: Buffer): Promise<string | null> {
  try {
    const image = await Jimp.read(buffer);
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    const data = image.bitmap.data;

    // Convert RGBA data to grayscale luminance buffer for ZXing
    const luminances = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      // Standard grayscale luminance formula
      luminances[i] = ((r + 2 * g + b) / 4) & 0xff;
    }

    const source = new RGBLuminanceSource(luminances, width, height);
    const bitmap = new BinaryBitmap(new HybridBinarizer(source));
    const reader = new QRCodeReader();
    const result = reader.decode(bitmap);

    return result ? result.getText() : null;
  } catch {
    return null;
  }
}

/**
 * Download image artifact from fileUrl and run deterministic QR decoding.
 */
export async function decodeQrFromUrl(imageUrl: string): Promise<QRSignal> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return {
        stream: "qr",
        score: null,
        unavailable: `Failed to fetch image: HTTP ${res.status}`,
        payload: {
          detected: false,
        },
      };
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const decodedText = await decodeQrFromBuffer(buffer);

    if (decodedText) {
      const isUrl = /^https?:\/\//i.test(decodedText.trim());
      return {
        stream: "qr",
        score: isUrl ? 25 : 10,
        payload: {
          detected: true,
          payloadText: decodedText.trim(),
          isSuspiciousUrl: isUrl,
          details: `Embedded QR code detected pointing to: ${decodedText.trim()}`,
        },
      };
    }

    return {
      stream: "qr",
      score: 0,
      payload: {
        detected: false,
        details: "No QR barcode detected in the uploaded image.",
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      stream: "qr",
      score: null,
      unavailable: `QR extraction error: ${msg}`,
      payload: {
        detected: false,
      },
    };
  }
}