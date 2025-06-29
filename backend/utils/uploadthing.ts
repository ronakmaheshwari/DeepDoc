import dotenv from "dotenv";
import { createUploadthing, type FileRouter } from "uploadthing/express";
import jwt from "jsonwebtoken";
import axios from "axios";
import pdf from "pdf-parse-fork";
import prisma from "../lib/prisma/prisma";
import chunkText from "./chunkText";
import embedding from "./embedding";
import insertChunk from "./supabase";

dotenv.config();

const f = createUploadthing();

export const uploadRouter = {
  pdfUploader: f({
    "application/pdf": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  }).middleware(async ({ req }) => {
      console.log("🚨 HIT UploadThing middleware");
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];

      if (!token) throw new Error("No token provided");

      try {
        const decoded = jwt.verify(token, process.env.JWTSecret!) as {
          userId: string;
        };

        return { userId: decoded.userId }; // 👈 passed as metadata to onUploadComplete
      } catch (err) {
        throw new Error("Invalid token");
      }
    })

    .onUploadComplete(async ({ file, metadata }) => {
      try {
        console.log("✅ HIT onUploadComplete");
        console.log("metadata", metadata, "file", file);
        if (!file || !file.name || !file.url || !metadata?.userId) {
          console.error("Missing fields", { file, metadata });
          throw new Error("Invalid input format");
        }
        const userId = metadata.userId;
        if (!userId) throw new Error("userId missing in metadata");

        const storePdf = await prisma.pdfFile.create({
          data: {
            userId,
            name: file.name,
            url: file.url,
          },
        });

        const session = await prisma.chatSession.create({
          data: {
            userId,
            pdfId: storePdf.id,
          },
        });

        const response = await axios.get(file.url, { responseType: "arraybuffer" });
        const text = (await pdf(response.data)).text;

        const chunks = await chunkText({ text, maxLen: 500 }) ?? [];
        const embeddings = await Promise.all(chunks.map((c) => embedding(c.text)));

        await insertChunk(chunks, embeddings, storePdf.id);

        return { sessionId: session.id };
      } catch (err) {
        console.error("UploadThing error:", err);
        throw new Error("UploadThing failed");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
