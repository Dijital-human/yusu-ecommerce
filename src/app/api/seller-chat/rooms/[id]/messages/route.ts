/**
 * Seller Chat Messages API Route / Satıcı Chat Mesajları API Route
 * Manage seller chat messages / Satıcı chat mesajlarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, successResponseWithPagination } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getSellerChatMessages, sendSellerChatMessage, markSellerChatMessagesAsRead } from "@/lib/chat/seller-chat-service";
import { parsePagination } from "@/lib/api/pagination";
import { db } from "@/lib/db";

/**
 * GET /api/seller-chat/rooms/[id]/messages
 * Get seller chat messages / Satıcı chat mesajlarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 50);

    // Verify user has access to room / İstifadəçinin otağa giriş hüququ olduğunu yoxla
    const room = await (db as any).sellerChatRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found / Otaq tapılmadı" },
        { status: 404 }
      );
    }

    if (room.customerId !== user.id && room.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const result = await getSellerChatMessages(id, limit, skip);

    // Mark messages as read / Mesajları oxunmuş kimi işarələ
    await markSellerChatMessagesAsRead(id, user.id);

    return successResponseWithPagination(result.messages, result.pagination);
  } catch (error) {
    return handleApiError(error, "get seller chat messages");
  }
}

/**
 * POST /api/seller-chat/rooms/[id]/messages
 * Send seller chat message / Satıcı chat mesajı göndər
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Message content is required / Mesaj məzmunu tələb olunur" },
        { status: 400 }
      );
    }

    // Verify user has access to room / İstifadəçinin otağa giriş hüququ olduğunu yoxla
    const room = await (db as any).sellerChatRoom.findUnique({
      where: { id },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found / Otaq tapılmadı" },
        { status: 404 }
      );
    }

    if (room.customerId !== user.id && room.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    if (room.status === 'closed') {
      return NextResponse.json(
        { success: false, error: "Room is closed / Otaq bağlıdır" },
        { status: 400 }
      );
    }

    const message = await sendSellerChatMessage(id, user.id, content.trim());

    return successResponse(message);
  } catch (error) {
    return handleApiError(error, "send seller chat message");
  }
}

