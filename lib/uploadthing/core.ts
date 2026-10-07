import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageOrDocument: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      let userId: string = "anonymous";
      try {
        const session = await auth();
        if (session && session.userId) {
          userId = session.userId;
        }
      } catch {
        // Fallback for cookie context during uploadthing handshake
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl || (file as { url?: string }).url || `https://utfs.io/f/${file.key}`;
      return { uploadedBy: metadata.userId, fileUrl, fileKey: file.key };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
