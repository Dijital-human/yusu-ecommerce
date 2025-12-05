-- CreateTable
-- Product Video Model / Məhsul Video Modeli
-- Product videos / Məhsul videoları
CREATE TABLE "product_videos" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'product',
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Product Media Model / Məhsul Media Modeli
-- Additional media files (images, videos, 360° views) / Əlavə media faylları (şəkillər, videolar, 360° görünüşlər)
CREATE TABLE "product_media" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE INDEX "product_videos_productId_idx" ON "product_videos"("productId");

CREATE INDEX "product_videos_type_idx" ON "product_videos"("type");

CREATE INDEX "product_videos_isPrimary_idx" ON "product_videos"("isPrimary");

CREATE INDEX "product_videos_order_idx" ON "product_videos"("order");

CREATE INDEX "product_media_productId_idx" ON "product_media"("productId");

CREATE INDEX "product_media_mediaType_idx" ON "product_media"("mediaType");

CREATE INDEX "product_media_order_idx" ON "product_media"("order");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "product_videos" ADD CONSTRAINT "product_videos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_media" ADD CONSTRAINT "product_media_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

