-- CreateTable
-- Loyalty Program Model / Sədaqət Proqramı Modeli
-- Loyalty program configuration / Sədaqət proqramı konfiqurasiyası
CREATE TABLE "loyalty_programs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pointsPerDollar" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- User Points Model / İstifadəçi Xalları Modeli
-- User points balance / İstifadəçi xal balansı
CREATE TABLE "user_points" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Points Transaction Model / Xal Əməliyyatı Modeli
-- Points earning and spending transactions / Xal qazanma və xərcləmə əməliyyatları
CREATE TABLE "points_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "orderId" TEXT,
    "expiryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Points Reward Model / Xal Mükafatı Modeli
-- Rewards that can be redeemed with points / Xallarla istifadə edilə bilən mükafatlar
CREATE TABLE "points_rewards" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "rewardType" TEXT NOT NULL,
    "rewardValue" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE UNIQUE INDEX "user_points_userId_key" ON "user_points"("userId");

CREATE INDEX "loyalty_programs_isActive_idx" ON "loyalty_programs"("isActive");

CREATE INDEX "user_points_userId_idx" ON "user_points"("userId");

CREATE INDEX "user_points_expiryDate_idx" ON "user_points"("expiryDate");

CREATE INDEX "points_transactions_userId_idx" ON "points_transactions"("userId");

CREATE INDEX "points_transactions_type_idx" ON "points_transactions"("type");

CREATE INDEX "points_transactions_orderId_idx" ON "points_transactions"("orderId");

CREATE INDEX "points_transactions_expiryDate_idx" ON "points_transactions"("expiryDate");

CREATE INDEX "points_transactions_createdAt_idx" ON "points_transactions"("createdAt");

CREATE INDEX "points_rewards_programId_idx" ON "points_rewards"("programId");

CREATE INDEX "points_rewards_isActive_idx" ON "points_rewards"("isActive");

CREATE INDEX "points_rewards_pointsRequired_idx" ON "points_rewards"("pointsRequired");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "points_rewards" ADD CONSTRAINT "points_rewards_programId_fkey" FOREIGN KEY ("programId") REFERENCES "loyalty_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

