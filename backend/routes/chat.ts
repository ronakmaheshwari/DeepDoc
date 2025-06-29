import express from "express";
import dotenv from "dotenv";
import { userMiddleware } from "../utils/middleware";
import prisma from "../lib/prisma/prisma";
import { storeMessage } from "../lib/redis/redis";
import getQueryEmbed, { askPDF } from "../utils/embedding";

dotenv.config();

const chatRouter = express.Router();

chatRouter.post("/:sessionId", userMiddleware, async (req: any, res: any) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;
    const { message } = req.body;

    if (!message || typeof message !== "string" || !userId) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized session access" });
    }

    const redisSuccess = await storeMessage({
      sessionId,
      role: "user",
      content: message,
    });

    if (!redisSuccess) {
      console.warn("⚠️ Redis store failed for user message.");
    }

    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "user",
        content: message,
      },
    });

    const chatCount = await prisma.chatMessage.count({ where: { sessionId } });
    if (chatCount === 1) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: message.slice(0, 30).trim() || "Untitled Session" },
      });
    }

    const queryEmbed = await getQueryEmbed(message);
    const serverAnswer = await askPDF(message, queryEmbed);
    const finalAnswer = serverAnswer || "Sorry, I couldn't generate a response.";

    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "assistant",
        content: finalAnswer,
      },
    });

    const redisAssistantSuccess = await storeMessage({
      sessionId,
      role: "assistant",
      content: finalAnswer,
    });

    if (!redisAssistantSuccess) {
      console.warn("⚠️ Redis store failed for assistant message.");
    }

    return res.status(200).json({
      user: userMessage,
      assistant: assistantMessage,
    });
  } catch (error) {
    console.error("❌ Chat endpoint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default chatRouter;
