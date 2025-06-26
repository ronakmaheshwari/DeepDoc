import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWTSecret = process.env.JWTSecret || "";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      stage?: "otp" | "verified"; 
    }
  }
}

export const userMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWTSecret) as {
      userId: string;
      stage?: string;
    };

    req.userId = decoded.userId;
    req.stage = decoded.stage || "verified"; 

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
