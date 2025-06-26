import express from "express"
import userRouter from "./user"
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "../utils/uploadthing";
import chatRouter from "./chat";
import sessionRouter from "./session";

const router = express.Router()

router.use("/user",userRouter);
router.use("/uploadthing",createRouteHandler({router:uploadRouter}))
router.use("/chat",chatRouter)
router.use("/session",sessionRouter)

export default router