import {v4 as uuid} from "uuid"

interface ChunkSchema{
    text:string
    maxLen:number
}

export default async function chunkText({text,maxLen}:ChunkSchema) {
    try {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = []
        let current = ""
        for(let s of sentences){
            if((current+sentences).length>maxLen){
                chunks.push({id:uuid(),text:current.trim()});
                current=""
            }
            current+=s
        }
        if (current) chunks.push({ id: uuid(), text: current.trim() });
        return chunks;
    } catch (error) {
        console.error("Error At chunker",error)
    }
}