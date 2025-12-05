-- CreateTable
-- Wishlist Note Model / İstək Siyahısı Qeydi Modeli
-- User notes for wishlist items / İstək siyahısı elementləri üçün istifadəçi qeydləri
CREATE TABLE "wishlist_notes" (
    "id" TEXT NOT NULL,
    "wishlistItemId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Price Alert Model / Qiymət Bildirişi Modeli
-- Price drop alerts for wishlist items / İstək siyahısı elementləri üçün qiymət düşmə bildirişləri
CREATE TABLE "price_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "wishlistItemId" TEXT,
    "targetPrice" DECIMAL(10,2) NOT NULL,
    "currentPrice" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE UNIQUE INDEX "wishlist_notes_wishlistItemId_key" ON "wishlist_notes"("wishlistItemId");

CREATE UNIQUE INDEX "price_alerts_userId_productId_key" ON "price_alerts"("userId", "productId");

CREATE INDEX "price_alerts_userId_idx" ON "price_alerts"("userId");

CREATE INDEX "price_alerts_productId_idx" ON "price_alerts"("productId");

CREATE INDEX "price_alerts_isActive_idx" ON "price_alerts"("isActive");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "wishlist_notes" ADD CONSTRAINT "wishlist_notes_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_wishlistItemId_fkey" FOREIGN KEY ("wishlistItemId") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

