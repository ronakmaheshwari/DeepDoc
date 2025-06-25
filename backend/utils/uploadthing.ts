import { createUploadthing, type FileRouter } from "uploadthing/express";
import prisma from "../prisma/prisma";
import axios from "axios";
import pdf from "pdf-parse-fork"
import chunkText from "./chunk";
import { embedding } from "./embedded";
import insertChunk from "./supabase";

const f = createUploadthing();

export const uploadRouter = {

  pdfUploader: f({
    pdf: {
      maxFileSize:"16MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(
    async ({ file, metadata }: { file: any; metadata?: { userId?: string } }) => {
      const userId = metadata?.userId ?? "anonymous";
      const pdfName = file.name 

      const pdfRecord = await prisma.pdfFile.create({
        data:{
            userId,name:pdfName,url:file.url
        }
      })

      const sessionCreate = await prisma.chatSession.create({
        data:{
            userId,
            pdfId:pdfRecord.id
        }
      }) 
      const buffer = (await axios.get(file.url,{responseType:"arraybuffer"})).data
      const parser = ((await pdf(buffer)).text);
      const maxLength = 500

      const chunks = chunkText(parser,maxLength);
      const embedder =await embedding(Array.isArray(chunks) ? chunks.map((x) => x.text) : [])

      await insertChunk(chunks,embedder,pdfRecord.id);
      return {sessionId: sessionCreate.id}
    }
  ),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
