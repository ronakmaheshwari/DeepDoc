import { v4 as uuid } from 'uuid';

export default function chunkText(text:string,maxLength:500){
    try{
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let current = "";
        for (const s of sentences) {
            if((current+s).length > maxLength){
                chunks.push({id:uuid(),text: current.trim()})
            }
            current+=s
        }
        if(current){
            chunks.push({ id: uuid(), text: current.trim() });
            return chunks; 
        }
    }catch(error){
        console.error("Error at chunks",error);
    }
}