import { createClient } from "redis";
import prisma from "../prisma/prisma";
import dotenv from "dotenv";

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  console.error("❌ Redis client error:", err);
});

(async () => {
  try {
    await redis.connect();
    console.log("✅ Connected to Redis");
  } catch (error) {
    console.error("❌ Failed to connect to Redis:", error);
  }
})();

const REDIS_TTL = parseInt(process.env.REDIS_TTL || "86400", 10); 

interface StoreSchema {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}

export async function storeMessage({
  sessionId,
  role,
  content,
}: StoreSchema): Promise<boolean> {
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
    console.error("❌ Error storing message in Redis:", error);
    return false;
  }
}

export async function getMessageHistory(
  sessionId: string
): Promise<{ role: string; content: string }[]> {
  const key = `chat:${sessionId}`;
  try {
    const cachedMessages = await redis.lRange(key, 0, -1);

    if (cachedMessages.length > 0) {
      return cachedMessages.map((msg) => {
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
    console.error("❌ Error retrieving message history:", error);
    return [];
  }
}

export async function deleteMessageHistory(sessionId: string): Promise<boolean> {
  try {
    const key = `chat:${sessionId}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("❌ Error deleting Redis history:", error);
    return false;
  }
}
