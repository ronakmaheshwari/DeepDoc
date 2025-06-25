// chat.ts
import express from "express";
import dotenv from "dotenv";
import { userMiddleware } from "../middleware";
import prisma from "../prisma/prisma";

import searchRelevantChunks from "../utils/embedded";
import askPDF from "../utils/cohere";
import client  from "../utils/redis";
dotenv.config();

const chatRouter = express.Router();

chatRouter.post("/:sessionId", userMiddleware, async (req: any, res: any) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.userId;
    const { message } = req.body;

    if (!message || !userId) return res.status(400).send("Invalid input");

    const session = await prisma.chatSession.findUnique({ where: { id: sessionId } });
    if (!session || session.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized session access" });
    }

    const userMessage = await prisma.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });

    const chatCount = await prisma.chatMessage.count({ where: { sessionId } });
    if (chatCount === 1) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { title: message.slice(0, 30) },
      });
    }

    await client.lPush(`chat:${sessionId}`, JSON.stringify(userMessage));

    const chunks = await searchRelevantChunks(message);
    const answer = await askPDF(message, chunks);

    const assistantMessage = await prisma.chatMessage.create({
      data: { sessionId, role: "assistant", content: answer ?? "" },
    });

    await client.lPush(`chat:${sessionId}`, JSON.stringify(assistantMessage));

    res.status(200).json({ user: userMessage, assistant: assistantMessage });

  } catch (error) {
    console.error("Error at chat endpoint:", error);
    res.status(500).json({ message: "Internal error occurred" });
  }
});

export default chatRouter;
