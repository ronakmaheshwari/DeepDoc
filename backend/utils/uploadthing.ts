import dotenv from "dotenv";
import { createUploadthing, type FileRouter } from "uploadthing/express";
import prisma from "../lib/prisma/prisma";
import axios from "axios";
import pdf from "pdf-parse-fork"
import chunkText from "./chunkText";
import embedding from "./embedding";
import insertChunk from "./supabase";
dotenv.config();

const f = createUploadthing();

export const uploadRouter = {
  
  pdfUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file, metadata }: { file: any; metadata?: { userId?: string } }) => {
    const userId = metadata?.userId;

    if (!userId) {
      throw new Error("userId is required to upload PDF.");
    }
    const name = file.name;

    const storePdf = await prisma.pdfFile.create({
        data:{
            userId,
            name,
            url: file.url
        }
    });

    const sessionCreation = await prisma.chatSession.create({
        data:{
            userId,
            pdfId:storePdf.id
        }
    })
    const buffer = await axios.get(`${file.url}`,{responseType:"arraybuffer"})
    const data = buffer.data
    const text = (await pdf(data)).text
    const chunk = await chunkText({ text, maxLen: 500 })
    const embeder =await embedding({ text: chunk?.map((x) => x.text) ?? [] })
    await insertChunk(chunk,embeder,storePdf.id)

    return {sessionId: sessionCreation.id}
  }),
} satisfies FileRouter;
export type OurFileRouter = typeof uploadRouter;