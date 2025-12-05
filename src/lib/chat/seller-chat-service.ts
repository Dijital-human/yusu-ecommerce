/**
 * Seller Chat Service / Satıcı Chat Xidməti
 * Service functions for seller chat management / Satıcı chat idarəetməsi üçün xidmət funksiyaları
 */

import { db } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * Get or create seller chat room / Satıcı chat otağını al və ya yarat
 */
export async function getOrCreateSellerChatRoom(
  customerId: string,
  sellerId: string,
  productId?: string
) {
  try {
    // Check if room exists / Otağın mövcud olub-olmadığını yoxla
    const existingRoom = await (db as any).sellerChatRoom.findFirst({
      where: {
        customerId,
        sellerId,
        productId: productId || null,
        status: 'open',
      },
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Create new room / Yeni otaq yarat
    const newRoom = await (db as any).sellerChatRoom.create({
      data: {
        customerId,
        sellerId,
        productId: productId || null,
        status: 'open',
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    logger.info('Seller chat room created / Satıcı chat otağı yaradıldı', {
      roomId: newRoom.id,
      customerId,
      sellerId,
      productId,
    });

    return newRoom;
  } catch (error) {
    logger.error('Failed to get or create seller chat room / Satıcı chat otağını almaq və ya yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get seller chat room by ID / ID ilə satıcı chat otağını al
 */
export async function getSellerChatRoomById(roomId: string) {
  try {
    const room = await (db as any).sellerChatRoom.findUnique({
      where: { id: roomId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return room;
  } catch (error) {
    logger.error('Failed to get seller chat room / Satıcı chat otağını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get seller chat rooms for user / İstifadəçi üçün satıcı chat otaqlarını al
 */
export async function getSellerChatRooms(userId: string, role: 'customer' | 'seller') {
  try {
    const where: any = {};
    if (role === 'customer') {
      where.customerId = userId;
    } else {
      where.sellerId = userId;
    }

    const rooms = await (db as any).sellerChatRoom.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return rooms;
  } catch (error) {
    logger.error('Failed to get seller chat rooms / Satıcı chat otaqlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get seller chat messages / Satıcı chat mesajlarını al
 */
export async function getSellerChatMessages(
  roomId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const [messages, total] = await Promise.all([
      (db as any).sellerChatMessage.findMany({
        where: { roomId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      (db as any).sellerChatMessage.count({
        where: { roomId },
      }),
    ]);

    return {
      messages: messages.reverse(), // Reverse to show oldest first / Ən köhnəsini əvvəldə göstərmək üçün tərsinə çevir
      total,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Failed to get seller chat messages / Satıcı chat mesajlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Send seller chat message / Satıcı chat mesajı göndər
 */
export async function sendSellerChatMessage(
  roomId: string,
  senderId: string,
  content: string
) {
  try {
    // Create message / Mesaj yarat
    const message = await (db as any).sellerChatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update room last message time / Otağın son mesaj zamanını yenilə
    await (db as any).sellerChatRoom.update({
      where: { id: roomId },
      data: {
        lastMessageAt: new Date(),
      },
    });

    logger.info('Seller chat message sent / Satıcı chat mesajı göndərildi', {
      messageId: message.id,
      roomId,
      senderId,
    });

    return message;
  } catch (error) {
    logger.error('Failed to send seller chat message / Satıcı chat mesajı göndərmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Mark messages as read / Mesajları oxunmuş kimi işarələ
 */
export async function markSellerChatMessagesAsRead(roomId: string, userId: string) {
  try {
    // Get room to check if user is participant / İstifadəçinin iştirakçı olub-olmadığını yoxlamaq üçün otağı al
    const room = await (db as any).sellerChatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error('Room not found / Otaq tapılmadı');
    }

    // Check if user is customer or seller / İstifadəçinin müştəri və ya satıcı olub-olmadığını yoxla
    if (room.customerId !== userId && room.sellerId !== userId) {
      throw new Error('Unauthorized / Yetkisiz');
    }

    // Mark messages as read where sender is not the current user / Göndərən cari istifadəçi olmayan mesajları oxunmuş kimi işarələ
    await (db as any).sellerChatMessage.updateMany({
      where: {
        roomId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    logger.info('Seller chat messages marked as read / Satıcı chat mesajları oxunmuş kimi işarələndi', {
      roomId,
      userId,
    });
  } catch (error) {
    logger.error('Failed to mark messages as read / Mesajları oxunmuş kimi işarələmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Close seller chat room / Satıcı chat otağını bağla
 */
export async function closeSellerChatRoom(roomId: string) {
  try {
    const room = await (db as any).sellerChatRoom.update({
      where: { id: roomId },
      data: {
        status: 'closed',
      },
    });

    logger.info('Seller chat room closed / Satıcı chat otağı bağlandı', {
      roomId,
    });

    return room;
  } catch (error) {
    logger.error('Failed to close seller chat room / Satıcı chat otağını bağlamaq uğursuz oldu', error);
    throw error;
  }
}

