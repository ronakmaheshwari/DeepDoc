import dotenv from "dotenv";
import { CohereClient } from "cohere-ai";
import { supabase } from "./supabase";

dotenv.config();

const cohere = new CohereClient({
  token: process.env.Embedding_Key!,
});

export async function Embedder(texts: string[]): Promise<number[][]> {
  const allEmbeddings: number[][] = [];

  const BATCH_SIZE = 96;
  const batches = Math.ceil(texts.length / BATCH_SIZE);

  for (let i = 0; i < batches; i++) {
    const batch = texts.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);

    try {
      const response = await cohere.v2.embed({
        texts: batch,
        model: "embed-v4.0",
        inputType: "classification",
        embeddingTypes: ["float"],
      });

      const vectors = response.embeddings?.float ?? [];
      console.log(`🧬 Got ${vectors.length} embeddings in batch ${i + 1}/${batches}.`);
      allEmbeddings.push(...vectors);
    } catch (error) {
      console.error(`❌ Embedding failed on batch ${i + 1}:`, error);
    }
  }

  return allEmbeddings;
}

export default async function getQueryEmbed(query: string): Promise<string> {
  const embed = await Embedder([query]);

  if (!embed.length) {
    throw new Error("Embedding failed or returned empty");
  }

  const { data, error } = await supabase.rpc("match_pdf_chunks", {
    query_embedding: embed[0],
    match_count: 5,
  });

  if (error) {
    console.error("❌ Supabase RPC failed:", error);
    throw error;
  }

  return data?.map((chunk: any) => chunk.content).join("\n\n") ?? "";
}

export async function askPDF(query: string, context: string): Promise<string> {
  try {
    const prompt = `You're an assistant that answers only based on the provided PDF content.\n\nContent:\n${context}\n\nQuestion: ${query}`;

    const response = await cohere.chat({
      model: "command-r-plus",
      message: prompt,
      temperature: 0,
    });

    return response.text;
  } catch (error) {
    console.error("❌ Error at Cohere API:", error);
    return "Sorry, I couldn’t generate a response.";
  }
}
