-- CreateTable
-- Social Share Model / Sosial Paylaşım Modeli
-- Track social media shares / Sosial media paylaşımlarını izlə
CREATE TABLE "social_shares" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "shareCount" INTEGER NOT NULL DEFAULT 1,
    "lastSharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE INDEX "social_shares_productId_idx" ON "social_shares"("productId");

CREATE INDEX "social_shares_platform_idx" ON "social_shares"("platform");

CREATE INDEX "social_shares_shareCount_idx" ON "social_shares"("shareCount");

CREATE INDEX "social_shares_lastSharedAt_idx" ON "social_shares"("lastSharedAt");

-- CreateUniqueConstraint
-- Unique constraint for product and platform / Məhsul və platform üçün unikal məhdudiyyət
CREATE UNIQUE INDEX "social_shares_productId_platform_key" ON "social_shares"("productId", "platform");

-- AddForeignKey
-- Foreign key constraint / Xarici açar məhdudiyyəti
ALTER TABLE "social_shares" ADD CONSTRAINT "social_shares_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

