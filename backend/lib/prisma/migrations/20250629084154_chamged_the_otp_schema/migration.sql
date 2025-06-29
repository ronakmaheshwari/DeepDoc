-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "otp" SET DATA TYPE TEXT,
ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');
