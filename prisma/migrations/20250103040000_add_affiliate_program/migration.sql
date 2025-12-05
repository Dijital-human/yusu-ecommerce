-- CreateTable
-- Affiliate Program Model / Affiliate Proqram Modeli
-- Seller affiliate programs / Satıcı affiliate proqramları
CREATE TABLE "affiliate_programs" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "commissionRate" DECIMAL(65,30) NOT NULL DEFAULT 0.1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "minPayout" DECIMAL(65,30) NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Affiliate Link Model / Affiliate Link Modeli
-- Affiliate links for products / Məhsullar üçün affiliate linkləri
CREATE TABLE "affiliate_links" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "productId" TEXT,
    "linkCode" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Affiliate Commission Model / Affiliate Komissiya Modeli
-- Commissions earned by affiliates / Affiliate-lər tərəfindən qazanılan komissiyalar
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "linkId" TEXT,
    "orderId" TEXT NOT NULL,
    "commissionAmount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Affiliate Payout Model / Affiliate Ödəniş Modeli
-- Payouts to affiliates / Affiliate-lərə ödənişlər
CREATE TABLE "affiliate_payouts" (
    "id" TEXT NOT NULL,
    "affiliateId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE INDEX "affiliate_programs_sellerId_idx" ON "affiliate_programs"("sellerId");

CREATE INDEX "affiliate_programs_isActive_idx" ON "affiliate_programs"("isActive");

CREATE UNIQUE INDEX "affiliate_links_linkCode_key" ON "affiliate_links"("linkCode");

CREATE INDEX "affiliate_links_affiliateId_idx" ON "affiliate_links"("affiliateId");

CREATE INDEX "affiliate_links_productId_idx" ON "affiliate_links"("productId");

CREATE INDEX "affiliate_links_linkCode_idx" ON "affiliate_links"("linkCode");

CREATE INDEX "affiliate_commissions_affiliateId_idx" ON "affiliate_commissions"("affiliateId");

CREATE INDEX "affiliate_commissions_linkId_idx" ON "affiliate_commissions"("linkId");

CREATE INDEX "affiliate_commissions_orderId_idx" ON "affiliate_commissions"("orderId");

CREATE INDEX "affiliate_commissions_status_idx" ON "affiliate_commissions"("status");

CREATE INDEX "affiliate_commissions_createdAt_idx" ON "affiliate_commissions"("createdAt");

CREATE INDEX "affiliate_payouts_affiliateId_idx" ON "affiliate_payouts"("affiliateId");

CREATE INDEX "affiliate_payouts_status_idx" ON "affiliate_payouts"("status");

CREATE INDEX "affiliate_payouts_createdAt_idx" ON "affiliate_payouts"("createdAt");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "affiliate_programs" ADD CONSTRAINT "affiliate_programs_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "affiliate_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "affiliate_payouts" ADD CONSTRAINT "affiliate_payouts_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

