-- AlterTable
ALTER TABLE "users" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN "emailVerificationTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "users_emailVerificationToken_idx" ON "users"("emailVerificationToken");
CREATE INDEX IF NOT EXISTS "users_emailVerified_idx" ON "users"("emailVerified");

