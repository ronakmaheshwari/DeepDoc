import express from "express";
import dotenv from "dotenv";
import { userMiddleware } from "../utils/middleware";
import prisma from "../lib/prisma/prisma";
import {
  deleteMessageHistory,
  getMessageHistory,
} from "../lib/redis/redis";

dotenv.config();

const sessionRouter = express.Router();

sessionRouter.post("/rename/:sessionId", userMiddleware, async (req: any, res: any) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.userId;
    const title = req.body.title;

    const SearchSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!SearchSession || SearchSession.userId !== userId) {
      return res.status(403).json({ message: "Invalid session or access denied" });
    }

    const ChangeTitle = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });

    return res.status(200).json({
      message: `The title of session ${sessionId} has been changed.`,
      session: ChangeTitle,
    });
  } catch (error) {
    console.error("❌ Rename Session endpoint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

sessionRouter.delete("/delete/:sessionId", userMiddleware, async (req: any, res: any) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.userId;

    const CheckSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!CheckSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (CheckSession.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this session" });
    }

    const [deletedMessages, deletedSession] = await Promise.all([
        prisma.chatMessage.deleteMany({ where: { sessionId } }),
        prisma.chatSession.delete({ where: { id: sessionId } })
    ])

    await deleteMessageHistory(sessionId);

    return res.status(200).json({ message: "Session and its messages were deleted" });
  } catch (error) {
    console.error("❌ Delete Session endpoint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

sessionRouter.get("/history/:sessionId", userMiddleware, async (req: any, res: any) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.userId;

    const CheckSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!CheckSession) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (CheckSession.userId !== userId) {
      return res.status(403).json({ message: "Access denied to this session" });
    }

    const response = await getMessageHistory(sessionId);

    return res.status(200).json({ message: response });
  } catch (error) {
    console.error("❌ History Session endpoint error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

export default sessionRouter;
