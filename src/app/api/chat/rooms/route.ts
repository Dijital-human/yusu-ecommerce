/**
 * Chat Rooms API Route / Chat Otaqları API Route
 * Create and list chat rooms / Chat otaqları yarat və siyahıla
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { createChatRoom, getUserChatRooms } from "@/lib/chat/chat-service";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/chat/rooms
 * Get user's chat rooms / İstifadəçinin chat otaqlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getUserChatRooms(user.id, user.role, limit, offset);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get chat rooms");
  }
}

/**
 * POST /api/chat/rooms
 * Create a new chat room / Yeni chat otağı yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { productId, orderId } = body;

    // Only customers can create chat rooms / Yalnız müştərilər chat otağı yarada bilər
    if (user.role !== "CUSTOMER") {
      return NextResponse.json(
        { success: false, error: "Only customers can create chat rooms / Yalnız müştərilər chat otağı yarada bilər" },
        { status: 403 }
      );
    }

    const result = await createChatRoom(user.id, productId, orderId);

    logger.info("Chat room created via API / API vasitəsilə chat otağı yaradıldı", {
      roomId: result.id,
      customerId: user.id,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "create chat room");
  }
}

