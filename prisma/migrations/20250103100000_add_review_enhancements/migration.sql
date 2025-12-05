-- CreateTable
-- Review Image Model / Rəy Şəkli Modeli
-- Images attached to reviews / Rəylərə əlavə edilmiş şəkillər
CREATE TABLE "review_images" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Review Video Model / Rəy Videosu Modeli
-- Videos attached to reviews / Rəylərə əlavə edilmiş videolar
CREATE TABLE "review_videos" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Review Vote Model / Rəy Səsi Modeli
-- Helpful/not helpful votes on reviews / Rəylərə faydalı/faydasız səslər
CREATE TABLE "review_votes" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE INDEX "review_images_reviewId_idx" ON "review_images"("reviewId");

CREATE INDEX "review_images_order_idx" ON "review_images"("order");

CREATE UNIQUE INDEX "review_videos_reviewId_key" ON "review_videos"("reviewId");

CREATE INDEX "review_videos_reviewId_idx" ON "review_videos"("reviewId");

CREATE UNIQUE INDEX "review_votes_reviewId_userId_key" ON "review_votes"("reviewId", "userId");

CREATE INDEX "review_votes_reviewId_idx" ON "review_votes"("reviewId");

CREATE INDEX "review_votes_userId_idx" ON "review_votes"("userId");

CREATE INDEX "review_votes_voteType_idx" ON "review_votes"("voteType");

-- Add indexes to reviews table / reviews cədvəlinə index-lər əlavə et
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");

CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

CREATE INDEX "reviews_createdAt_idx" ON "reviews"("createdAt");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "review_images" ADD CONSTRAINT "review_images_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "review_videos" ADD CONSTRAINT "review_videos_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

