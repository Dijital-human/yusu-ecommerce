/**
 * Chat Service / Chat Xidməti
 * Live chat support system service / Canlı chat dəstək sistemi xidməti
 */

import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { emitRealtimeEvent } from "@/lib/realtime/sse";

// Chat Room Status / Chat Otağı Statusu
type ChatRoomStatus = "OPEN" | "WAITING" | "IN_PROGRESS" | "CLOSED" | "RESOLVED";

// Chat Sender Type / Chat Göndərən Tipi
type ChatSenderType = "CUSTOMER" | "SUPPORT";

/**
 * Create a new chat room / Yeni chat otağı yarat
 */
export async function createChatRoom(
  customerId: string,
  productId?: string,
  orderId?: string
): Promise<{ id: string }> {
  try {
    const chatRoom = await (db as any).chatRoom.create({
      data: {
        customerId,
        productId,
        orderId,
        status: "OPEN" as ChatRoomStatus,
      },
    });

    logger.info("Chat room created / Chat otağı yaradıldı", {
      roomId: chatRoom.id,
      customerId,
    });

    // Emit real-time event / Real-time hadisə yayımla
    emitRealtimeEvent("chat.room.created", { roomId: chatRoom.id }, customerId);

    return { id: chatRoom.id };
  } catch (error) {
    logger.error("Failed to create chat room / Chat otağı yaratmaq uğursuz oldu", error);
    throw error;
  }
}

/**
 * Get user's chat rooms / İstifadəçinin chat otaqlarını al
 */
export async function getUserChatRooms(
  userId: string,
  role: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const where = role === "ADMIN" || role === "SUPPORT"
      ? { supportStaffId: userId }
      : { customerId: userId };

    const [rooms, total] = await Promise.all([
      (db as any).chatRoom.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          supportStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
          order: {
            select: {
              id: true,
              status: true,
              totalAmount: true,
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: limit,
        skip: offset,
      }),
      (db as any).chatRoom.count({ where }),
    ]);

    return { rooms, total };
  } catch (error) {
    logger.error("Failed to get user chat rooms / İstifadəçinin chat otaqlarını almaq uğursuz oldu", error);
    throw error;
  }
}

/**
 * Get chat room details / Chat otağı detallarını al
 */
export async function getChatRoom(roomId: string, userId: string) {
  try {
    const room = await db.chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { customerId: userId },
          { supportStaffId: userId },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        supportStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
          },
        },
      },
    });

    if (!room) {
      throw new Error("Chat room not found / Chat otağı tapılmadı");
    }

    return room;
  } catch (error) {
    logger.error("Failed to get chat room / Chat otağını almaq uğursuz oldu", error);
    throw error;
  }
}

/**
 * Get chat messages / Chat mesajlarını al
 */
export async function getChatMessages(
  roomId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const [messages, total] = await Promise.all([
      (db as any).chatMessage.findMany({
        where: { roomId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      (db as any).chatMessage.count({ where: { roomId } }),
    ]);

    return { messages: messages.reverse(), total };
  } catch (error) {
    logger.error("Failed to get chat messages / Chat mesajlarını almaq uğursuz oldu", error);
    throw error;
  }
}

/**
 * Send a chat message / Chat mesajı göndər
 */
export async function sendChatMessage(
  roomId: string,
  senderId: string,
  senderType: ChatSenderType,
  content: string,
  attachments?: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  }>
) {
  try {
    // Verify room access / Otaq girişini yoxla
    const room = await (db as any).chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { customerId: senderId },
          { supportStaffId: senderId },
        ],
      },
    });

    if (!room) {
      throw new Error("Chat room not found or access denied / Chat otağı tapılmadı və ya giriş rədd edildi");
    }

    // Create message / Mesaj yarat
    const message = await (db as any).chatMessage.create({
      data: {
        roomId,
        senderId,
        senderType,
        content,
        attachments: attachments
          ? {
              create: attachments.map((att) => ({
                fileUrl: att.fileUrl,
                fileType: att.fileType,
                fileName: att.fileName,
                fileSize: att.fileSize,
              })),
            }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        attachments: true,
      },
    });

    // Update room last message time / Otağın son mesaj zamanını yenilə
    await (db as any).chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessageAt: new Date(),
        status: senderType === "SUPPORT"
          ? ("IN_PROGRESS" as ChatRoomStatus)
          : room.status === "CLOSED"
          ? ("OPEN" as ChatRoomStatus)
          : room.status,
      },
    });

    // Emit real-time event / Real-time hadisə yayımla
    const recipientId = senderType === "CUSTOMER"
      ? room.supportStaffId
      : room.customerId;

    emitRealtimeEvent(
      "chat.message.new",
      { roomId, message },
      recipientId || undefined
    );

    logger.info("Chat message sent / Chat mesajı göndərildi", {
      messageId: message.id,
      roomId,
      senderId,
    });

    return message;
  } catch (error) {
    logger.error("Failed to send chat message / Chat mesajı göndərmək uğursuz oldu", error);
    throw error;
  }
}

/**
 * Mark messages as read / Mesajları oxunmuş kimi işarələ
 */
export async function markMessagesAsRead(roomId: string, userId: string) {
  try {
    const result = await (db as any).chatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Emit real-time event / Real-time hadisə yayımla
    emitRealtimeEvent("chat.messages.read", { roomId }, userId);

    return { count: result.count };
  } catch (error) {
    logger.error("Failed to mark messages as read / Mesajları oxunmuş kimi işarələmək uğursuz oldu", error);
    throw error;
  }
}

/**
 * Assign support staff to chat room / Chat otağına dəstək işçisi təyin et
 */
export async function assignSupportStaff(roomId: string, supportStaffId: string) {
  try {
    const room = await (db as any).chatRoom.update({
      where: { id: roomId },
      data: {
        supportStaffId,
        status: "IN_PROGRESS" as ChatRoomStatus,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Emit real-time event / Real-time hadisə yayımla
    emitRealtimeEvent(
      "chat.room.assigned",
      { roomId, supportStaffId },
      room.customerId
    );

    logger.info("Support staff assigned / Dəstək işçisi təyin edildi", {
      roomId,
      supportStaffId,
    });

    return room;
  } catch (error) {
    logger.error("Failed to assign support staff / Dəstək işçisi təyin etmək uğursuz oldu", error);
    throw error;
  }
}

/**
 * Close chat room / Chat otağını bağla
 */
export async function closeChatRoom(roomId: string, userId: string) {
  try {
    const room = await (db as any).chatRoom.findFirst({
      where: {
        id: roomId,
        OR: [
          { customerId: userId },
          { supportStaffId: userId },
        ],
      },
    });

    if (!room) {
      throw new Error("Chat room not found or access denied / Chat otağı tapılmadı və ya giriş rədd edildi");
    }

    const updatedRoom = await (db as any).chatRoom.update({
      where: { id: roomId },
      data: {
        status: "CLOSED" as ChatRoomStatus,
      },
    });

    // Emit real-time event / Real-time hadisə yayımla
    const recipientId = room.customerId === userId
      ? room.supportStaffId
      : room.customerId;

    emitRealtimeEvent(
      "chat.room.closed",
      { roomId },
      recipientId || undefined
    );

    return updatedRoom;
  } catch (error) {
    logger.error("Failed to close chat room / Chat otağını bağlamaq uğursuz oldu", error);
    throw error;
  }
}

/**
 * Rate chat room / Chat otağını reytinqlə
 */
export async function rateChatRoom(
  roomId: string,
  customerId: string,
  rating: number,
  comment?: string
) {
  try {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5 / Reytinq 1 ilə 5 arasında olmalıdır");
    }

    const room = await (db as any).chatRoom.findFirst({
      where: {
        id: roomId,
        customerId,
      },
    });

    if (!room) {
      throw new Error("Chat room not found or access denied / Chat otağı tapılmadı və ya giriş rədd edildi");
    }

    const updatedRoom = await (db as any).chatRoom.update({
      where: { id: roomId },
      data: {
        rating,
        ratingComment: comment,
        status: "RESOLVED" as ChatRoomStatus,
      },
    });

    logger.info("Chat room rated / Chat otağı reytinqləndi", {
      roomId,
      rating,
    });

    return updatedRoom;
  } catch (error) {
    logger.error("Failed to rate chat room / Chat otağını reytinqləmək uğursuz oldu", error);
    throw error;
  }
}

