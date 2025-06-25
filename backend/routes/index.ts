import express from "express"
import userRouter from "./user";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../utils/uploadthing";
import chatRouter from "./chat";

const router = express.Router();

router.use("/user",userRouter)
router.use("/uploadthing",createRouteHandler({
    router: uploadRouter,
    config: {},
  }),
);
router.use("/chats",chatRouter)

export default router;