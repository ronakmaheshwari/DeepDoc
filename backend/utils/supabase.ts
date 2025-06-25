import {createClient} from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

if(!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY){
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY environment variable");
}

export default async function insertChunk(
    chunks: any,
    embedding: any[],
    pdfId: string
) {
    interface Chunk {
        id: string;
        text: string;
    }

    interface PdfChunkRow {
        id: string;
        content: string;
        embedding: any;
        pdfId: string;
    }

    const rows: PdfChunkRow[] = (chunks as Chunk[]).map((c: Chunk, i: number): PdfChunkRow => ({
        id: c.id,
        content: c.text,
        embedding: embedding[i],
        pdfId
    }));
    await supabase.from("pdf_chunks").insert(rows);
}