import { CohereClient } from "cohere-ai";
import dotenv from "dotenv";
dotenv.config();

const cohere = new CohereClient({
  token: process.env.Embedding_Key!,
});

console.log(process.env.Embedding_Key)

export async function embedding(texts: string[]) {
  const res = await cohere.v2.embed({
    model: 'embed-v4.0',
    inputType: 'classification',
    embeddingTypes: ['float'],
    texts,
  });

  console.log(res.embeddings); 
  return res.embeddings; // Already number[][]
}

