import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { SignupSchema } from "../utils/types"
import prisma from "../prisma/prisma"
import dotenv from "dotenv"
import { Resend } from "resend";
import OtpGenerator from "../utils/utils"
dotenv.config();

const userRouter = express.Router()
const JWTSecret = process.env.JWTSecret || "";
const saltround = process.env.Saltrounds || 10;
const resend = new Resend(process.env.Resend_Key || "");

const OTPEmailTemplate = (email: string, otp: number) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DeepDoc OTP</title>
    <style>
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
          padding: 20px !important;
        }
        .otp-box {
          font-size: 18px !important;
          padding: 10px 20px !important;
        }
      }
    </style>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div class="container" style="max-width: 600px; width: 90%; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #1e3a8a;">🔐 Hello ${email}!</h2>
      <p style="font-size: 16px;">Your One-Time Password (OTP) for accessing your <strong>DeepDoc</strong> account is:</p>
      <div class="otp-box" style="text-align: center; margin: 30px 0;">
        <span style="display: inline-block; background-color: #1e3a8a; color: #ffffff; padding: 12px 24px; font-size: 20px; font-weight: bold; border-radius: 5px; letter-spacing: 2px;">
          ${otp}
        </span>
      </div>
      <p style="font-size: 14px; color: #555;">This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        Sent with 🔍 from <a href="https://deepdoc.10xdevs.me" style="color: #1e3a8a; text-decoration: none;">DeepDoc</a>
      </p>
    </div>
  </body>
  </html>
`;

userRouter.post("/signup",async(req:any,res:any)=>{
    try {
        const parsed = SignupSchema.safeParse(req.body);
        if(!parsed.success){
            return res.status(400).json({
                message:"Invalid User Inputs provided",
                error: parsed.error.errors
            })
        }
        const {username,email,password} = parsed.data
        const ExistingUser = await prisma.user.findUnique({
            where:{
                email
            }
        })
        if(ExistingUser){
            return res.status(404).json({
                message:"User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password,saltround);
        const otp = parseInt(OtpGenerator(5) as string);
        const response = await prisma.user.create({
            data:{
                username,email,password:hashedPassword
            }
        })
        await prisma.otp.upsert({
            where: { userId: response.id },
            update: {
                otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
            create: {
                userId: response.id,
                otp,
            },
        });
        
        const html = OTPEmailTemplate(response.email, otp);
        await resend.emails.send({
            from: "onboarding@hire.10xdevs.me",
            to: response.email,
            subject: "You've Got the OTP from DeepDoc!",
            html,
        });
        const token = jwt.sign({ userId: response.id }, JWTSecret, { expiresIn: "1d" });
        return res.status(200).json({
            message:"User Successfully Created",
            token:token
        })
    } catch (error) {
        console.error("Error occured at Signup")
        return res.status(500).json({
            message:"Internal Error Occured"
        })
    }
})

export default userRouter