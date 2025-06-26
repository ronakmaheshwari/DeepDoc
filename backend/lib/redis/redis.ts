import { createClient } from "redis";
import prisma from "../prisma/prisma";
import dotenv from "dotenv";
dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("Redis Client error:", err);
});

(async () => {
  try {
    await redis.connect();
    console.log("✅ Connected to Redis");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

interface StoreSchema {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}

const REDIS_TTL = parseInt(process.env.REDIS_TTL || "86400", 10);


export async function storeMessage({ sessionId, role, content }: StoreSchema): Promise<boolean> {
  try {
    const key = `chat:${sessionId}`;
    const message = JSON.stringify({
      role,
      content,
      time: Date.now(),
    });

    await redis.lPush(key, message);

    const ttl = await redis.ttl(key);
    if (ttl === -1) {
      await redis.expire(key, REDIS_TTL);
    }

    return true;
  } catch (error) {
    console.error("Error storing Redis message:", error);
    return false;
  }
}

export async function getMessageHistory(sessionId: string): Promise<{ role: string; content: string }[]> {
  try {
    const key = `chat:${sessionId}`;
    const response = await redis.lRange(key, 0, -1);

    if (response.length > 0) {
      return response.map((msg) => {
        const parsed = JSON.parse(msg);
        return {
          role: parsed.role,
          content: parsed.content,
        };
      });
    }
    const dbMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" }, 
    });

    return dbMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  } catch (error) {
    console.error("Error getting Redis message history:", error);
    return [];
  }
}


export async function deleteMessageHistory(sessionId: string): Promise<boolean> {
  try {
    const key = `chat:${sessionId}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("Failed to delete Redis cache for chat:", error);
    return false;
  }
}
