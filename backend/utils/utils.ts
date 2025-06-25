export default function OtpGenerator(length:number){
    try {
        let curr = ""
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"
        for(let i=0;i<length;i++){
            curr+=letters.charAt(Math.floor(Math.random()*letters.length));
        }
        return curr;
    } catch (error) {
        console.error("Error occured at OtpGeneration")
    }
}