import express from "express"
import userRouter from "./user";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../utils/uploadthing";

const router = express.Router();

router.use("/user",userRouter)
router.use("/api/uploadthing",createRouteHandler({
    router: uploadRouter,
    config: {},
  }),
);
router.use("/chats")

export default router;