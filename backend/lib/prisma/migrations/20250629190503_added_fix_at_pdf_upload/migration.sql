-- DropIndex
DROP INDEX "PdfFile_userId_name_key";

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "expiresAt" SET DEFAULT (now() + interval '10 minutes');
