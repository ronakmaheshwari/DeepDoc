import {createClient} from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface Chunk {
  id: string;
  text: string;
}

interface PdfChunkRow {
  id: string;
  content: string;
  embedding: number[];
  pdf_id: string;
}

export default async function insertChunkBatched(
  chunks: Chunk[],
  embeddings: (number[] | undefined)[],
  pdfId: string
) {
  const rows = chunks
    .map((chunk, i) => {
      const embedding = embeddings[i];
      if (!embedding) return null;

      return {
        id: chunk.id,
        content: chunk.text,
        embedding,
        pdf_id: pdfId,
      };
    })
    .filter((row): row is PdfChunkRow => row !== null);

  const BATCH_SIZE = 100;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("pdf_chunks").insert(batch);
    if (error) {
      console.error(`❌ Batch insert failed at index ${i}:`, error);
      return;
    }
    console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1}`);
  }
}