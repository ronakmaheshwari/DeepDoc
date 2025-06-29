import dotenv from "dotenv";
import { createUploadthing, type FileRouter } from "uploadthing/express";
import jwt from "jsonwebtoken";
import axios from "axios";
import pdf from "pdf-parse-fork";
import prisma from "../lib/prisma/prisma";
import chunkText from "./chunkText";
import { Embedder } from "./embedding";
import insertChunkBatched from "./supabase";

dotenv.config();
console.log("UPLOADTHING_SECRET:", process.env.UPLOADTHING_TOKEN);

const f = createUploadthing();

export const uploadRouter = {
  pdfUploader: f({
    "application/pdf": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) throw new Error("No token provided");

      try {
        const decoded = jwt.verify(token, process.env.JWTSecret!) as {
          userId: string;
        };

        return { userId: decoded.userId };
      } catch (err) {
        console.error("❌ Invalid token", err);
        throw new Error("Invalid token");
      }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      try {
        if (!file || !file.name || !file.ufsUrl || !metadata?.userId) {
          throw new Error("Invalid input format");
        }

        const userId = metadata.userId;

        const storePdf = await prisma.pdfFile.create({
          data: {
            userId,
            name: file.name,
            url: file.ufsUrl,
          },
        });

        const session = await prisma.chatSession.create({
          data: {
            userId,
            pdfId: storePdf.id,
          },
        });

        const response = await axios.get(file.ufsUrl, { responseType: "arraybuffer" });
        const text = (await pdf(response.data)).text;

        const chunks = await chunkText({ text, maxLen: 500 }) ?? [];
        const chunkTexts = chunks.map((c) => c.text);
        const embed = await Embedder(chunkTexts); 
        console.log(embed.length);
        await insertChunkBatched(chunks, embed, storePdf.id);
        console.log("✅ Upload processing complete");
        console.log(session.id)
        return { sessionId: session.id };
      } catch (err) {
        console.error("❌ UploadThing error:", err);
        throw new Error("UploadThing failed");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
