import z from "zod"

export const SignupSchema = z.object({
    username:z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(5).regex(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{8,}$/, 
  "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.")
})

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-_=+{};:,<.>]).{6,}$/,
      "Password must include uppercase, lowercase, number, and special character."
    )
});

export const Otpschema = z.object({
  otp: z.string().min(4).max(10).regex(/^[A-Z0-9]+$/i, "OTP must be alphanumeric")
  }).transform((data) => ({
    otp: data.otp.toUpperCase()
}));