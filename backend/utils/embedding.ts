import dotenv from "dotenv";
import { CohereClient } from "cohere-ai";
import { supabase } from "./supabase";

dotenv.config();

const cohere = new CohereClient({
  token: process.env.Embedding_Key!,
});

export async function embedding(text: string[]): Promise<number[][]> {
  try {
    const embed = await cohere.v2.embed({
      texts: text,
      model: "embed-v4.0",
      inputType: "classification",
      embeddingTypes: ["float"],
    });
    console.log(`🧬 Got ${embed.embeddings?.float?.length} embeddings.`);
    return embed.embeddings.float ?? [];
  } catch (error) {
    console.log("Error at Embedding", error);
    return [];
  }
}

export default async function getQueryEmbed(query:string): Promise<string> {
    const embed = await embedding([query]);

    if(!embed || !embed.length){
        throw new Error("Embedding failed or returned empty"); 
    }
    const { data, error } = await supabase.rpc("match_pdf_chunks", {
      query_embedding: embed[0],
      match_count: 5,
    });

    if (error) throw error;

    return data?.map((chunk: any) => chunk.content).join("\n\n") ?? "";

}

export async function askPDF(query: string, context: string) {
  try {
    const prompt = `You're an assistant that answers only based on the provided PDF content.\n\nContent:\n${context}\n\nQuestion: ${query}`;

    const response = await cohere.chat({
      model: "command-r-plus", // safer fallback than internal preview models
      message: prompt,
      temperature: 0,
    });

    return response.text;
  } catch (error) {
    console.error("Error at Cohere API:", error);
    return "Sorry, I couldn’t generate a response.";
  }
}