import z from "zod"

export const SignupSchema = z.object({
    username:z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(5).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, 
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
})

export const SigninSchema = z.object({
    email:z.string().email(),
    password:z.string().min(5).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, 
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
})

export const Otpschema = z.object({
    otp:z.number().min(4)
})