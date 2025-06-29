export default function OtpGenerator(length: number): string {
  try {
    let otp = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let i = 0; i < length; i++) {
      otp += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return otp;
  } catch (error) {
    console.error("Error occurred during OTP generation:", error);
    return ""; // fallback to avoid undefined return
  }
}
