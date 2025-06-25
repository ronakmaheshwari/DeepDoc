import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
import { supabase } from "./supabase";
dotenv.config();

const cohere = new CohereClient({
  token: process.env.Embedding_Key!,
});

export async function embedding(texts: string[]): Promise<number[][]> {
  const res = await cohere.v2.embed({
    model: "embed-v4.0",
    inputType: "search_document",
    embeddingTypes: ["float"], // Only float, not sparse
    texts,
  });

  return res.embeddings as number[][];
}

export default async function searchRelevantChunks(query: string): Promise<string> {
  try {
    const embed = await embedding([query]);

    if (!embed || !embed.length) {
      throw new Error("Embedding failed or returned empty");
    }

    const { data, error } = await supabase.rpc("match_pdf_chunks", {
      query_embedding: embed[0],
      match_count: 5,
    });

    if (error) throw error;

    return data?.map((chunk: any) => chunk.content).join("\n\n") ?? "";

  } catch (error: any) {
    console.error("❌ searchRelevantChunks error:", error.message || error);
    return "";
  }
}
