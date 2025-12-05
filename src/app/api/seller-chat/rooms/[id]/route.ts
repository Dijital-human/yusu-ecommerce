/**
 * Seller Chat Room Detail API Route / Satıcı Chat Otağı Detal API Route
 * Get seller chat room details / Satıcı chat otağı detallarını al
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getSellerChatRoomById, closeSellerChatRoom } from "@/lib/chat/seller-chat-service";

/**
 * GET /api/seller-chat/rooms/[id]
 * Get seller chat room details / Satıcı chat otağı detallarını al
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

    const room = await getSellerChatRoomById(id);

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found / Otaq tapılmadı" },
        { status: 404 }
      );
    }

    // Verify user has access / İstifadəçinin giriş hüququ olduğunu yoxla
    if (room.customerId !== user.id && room.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    return successResponse(room);
  } catch (error) {
    return handleApiError(error, "get seller chat room");
  }
}

/**
 * PATCH /api/seller-chat/rooms/[id]
 * Update seller chat room (close) / Satıcı chat otağını yenilə (bağla)
 */
export async function PATCH(
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
    const { action } = body;

    const room = await getSellerChatRoomById(id);

    if (!room) {
      return NextResponse.json(
        { success: false, error: "Room not found / Otaq tapılmadı" },
        { status: 404 }
      );
    }

    // Verify user has access / İstifadəçinin giriş hüququ olduğunu yoxla
    if (room.customerId !== user.id && room.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    if (action === 'close') {
      const closedRoom = await closeSellerChatRoom(id);
      return successResponse(closedRoom);
    }

    return NextResponse.json(
      { success: false, error: "Invalid action / Etibarsız əməliyyat" },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error, "update seller chat room");
  }
}

