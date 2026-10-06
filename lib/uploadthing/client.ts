import { generateUploadDropzone, generateUploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "./core";

export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
export const UploadButton = generateUploadButton<OurFileRouter>();
