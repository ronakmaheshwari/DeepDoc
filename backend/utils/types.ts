import z from "zod"

const SignupSchema = z.object({
    username:z.string().min(3).max(16).nonempty(),
    email:z.string().email(),
    password:z.string().min(5).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, 
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
})

const SigninSchema = z.object({
    email:z.string().email(),
    password:z.string().min(5).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, 
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
})

const OtpSchema = z.object({
    otp:z.number().min(5)
})

export {SignupSchema,SigninSchema,OtpSchema};