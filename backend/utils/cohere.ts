import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
dotenv.config();

const cohere = new CohereClient({
  token: process.env.Embedding_Key!,
});

export default async function askPDF(query: string, context: string) {
  try {
    const prompt = `You're an assistant that answers only based on the provided PDF content.\n\nContent:\n${context}\n\nQuestion: ${query}`;

    const response = await cohere.chat({
      model: "command-r-plus", 
      message: prompt,
      temperature: 0.3,
    });

    return response.text;
  } catch (error) {
    console.error("Error at Cohere API:", error);
    return "Sorry, I couldn’t generate a response.";
  }
}
