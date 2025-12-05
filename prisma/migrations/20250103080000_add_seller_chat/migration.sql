-- CreateTable
-- Seller Chat Room Model / Satıcı Chat Otağı Modeli
-- Direct messaging between customer and seller / Müştəri və satıcı arasında birbaşa mesajlaşma
CREATE TABLE "seller_chat_rooms" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "productId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Seller Chat Message Model / Satıcı Chat Mesajı Modeli
-- Messages in seller chat rooms / Satıcı chat otaqlarında mesajlar
CREATE TABLE "seller_chat_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seller_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE UNIQUE INDEX "seller_chat_rooms_customerId_sellerId_productId_key" ON "seller_chat_rooms"("customerId", "sellerId", "productId");

CREATE INDEX "seller_chat_rooms_customerId_idx" ON "seller_chat_rooms"("customerId");

CREATE INDEX "seller_chat_rooms_sellerId_idx" ON "seller_chat_rooms"("sellerId");

CREATE INDEX "seller_chat_rooms_productId_idx" ON "seller_chat_rooms"("productId");

CREATE INDEX "seller_chat_rooms_status_idx" ON "seller_chat_rooms"("status");

CREATE INDEX "seller_chat_rooms_lastMessageAt_idx" ON "seller_chat_rooms"("lastMessageAt");

CREATE INDEX "seller_chat_messages_roomId_idx" ON "seller_chat_messages"("roomId");

CREATE INDEX "seller_chat_messages_senderId_idx" ON "seller_chat_messages"("senderId");

CREATE INDEX "seller_chat_messages_isRead_idx" ON "seller_chat_messages"("isRead");

CREATE INDEX "seller_chat_messages_createdAt_idx" ON "seller_chat_messages"("createdAt");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "seller_chat_rooms" ADD CONSTRAINT "seller_chat_rooms_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "seller_chat_rooms" ADD CONSTRAINT "seller_chat_rooms_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "seller_chat_rooms" ADD CONSTRAINT "seller_chat_rooms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "seller_chat_messages" ADD CONSTRAINT "seller_chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "seller_chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "seller_chat_messages" ADD CONSTRAINT "seller_chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

