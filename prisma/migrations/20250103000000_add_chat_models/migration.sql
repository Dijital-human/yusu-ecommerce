-- CreateEnum
-- Chat Room Status Enum / Chat Otağı Statusu Enum-u
CREATE TYPE "ChatRoomStatus" AS ENUM ('OPEN', 'WAITING', 'IN_PROGRESS', 'CLOSED', 'RESOLVED');

-- CreateEnum
-- Chat Sender Type Enum / Chat Göndərən Tipi Enum-u
CREATE TYPE "ChatSenderType" AS ENUM ('CUSTOMER', 'SUPPORT');

-- CreateTable
-- Chat Room Model / Chat Otağı Modeli
-- Live chat support system / Canlı chat dəstək sistemi
CREATE TABLE "chat_rooms" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "supportStaffId" TEXT,
    "status" "ChatRoomStatus" NOT NULL DEFAULT 'OPEN',
    "productId" TEXT,
    "orderId" TEXT,
    "rating" INTEGER,
    "ratingComment" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Chat Message Model / Chat Mesajı Modeli
-- Chat messages / Chat mesajları
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderType" "ChatSenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Chat Attachment Model / Chat Əlavəsi Modeli
-- File attachments in chat messages / Chat mesajlarında fayl əlavələri
CREATE TABLE "chat_attachments" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE INDEX "chat_rooms_customerId_idx" ON "chat_rooms"("customerId");

CREATE INDEX "chat_rooms_supportStaffId_idx" ON "chat_rooms"("supportStaffId");

CREATE INDEX "chat_rooms_status_idx" ON "chat_rooms"("status");

CREATE INDEX "chat_rooms_lastMessageAt_idx" ON "chat_rooms"("lastMessageAt");

CREATE INDEX "chat_rooms_createdAt_idx" ON "chat_rooms"("createdAt");

CREATE INDEX "chat_messages_roomId_idx" ON "chat_messages"("roomId");

CREATE INDEX "chat_messages_senderId_idx" ON "chat_messages"("senderId");

CREATE INDEX "chat_messages_senderType_idx" ON "chat_messages"("senderType");

CREATE INDEX "chat_messages_isRead_idx" ON "chat_messages"("isRead");

CREATE INDEX "chat_messages_createdAt_idx" ON "chat_messages"("createdAt");

CREATE INDEX "chat_attachments_messageId_idx" ON "chat_attachments"("messageId");

CREATE INDEX "chat_attachments_fileType_idx" ON "chat_attachments"("fileType");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_supportStaffId_fkey" FOREIGN KEY ("supportStaffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "chat_attachments" ADD CONSTRAINT "chat_attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

