import { createClient } from "redis";
import dotenv from "dotenv"
dotenv.config()

const client = createClient({
    url:process.env.REDIS_URL
});
client.on('error', (err) => console.log('Redis Client Error', err));

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to Redis");
    } catch (error) {
        console.error("Failed to connect to Redis", error);
    }
}

startServer();

export default client;