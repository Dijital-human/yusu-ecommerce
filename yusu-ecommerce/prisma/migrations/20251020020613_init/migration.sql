-- AlterTable
ALTER TABLE "orders" ADD COLUMN "paidAt" DATETIME;
ALTER TABLE "orders" ADD COLUMN "paymentIntentId" TEXT;
ALTER TABLE "orders" ADD COLUMN "paymentStatus" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "originalPrice" DECIMAL;
