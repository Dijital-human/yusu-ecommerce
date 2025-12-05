/**
 * Seller Chat Rooms API Route / Satıcı Chat Otaqları API Route
 * Manage seller chat rooms / Satıcı chat otaqlarını idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, successResponseWithPagination } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getOrCreateSellerChatRoom, getSellerChatRooms } from "@/lib/chat/seller-chat-service";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/seller-chat/rooms
 * Get seller chat rooms / Satıcı chat otaqlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") as 'customer' | 'seller' || 'customer';

    // Determine role from user / İstifadəçidən rol müəyyən et
    let userRole: 'customer' | 'seller' = 'customer';
    if (user.role === 'SELLER' || user.role === 'SUPER_SELLER' || user.role === 'USER_SELLER') {
      userRole = 'seller';
    }

    const rooms = await getSellerChatRooms(user.id, userRole);
    return successResponse(rooms);
  } catch (error) {
    return handleApiError(error, "get seller chat rooms");
  }
}

/**
 * POST /api/seller-chat/rooms
 * Create seller chat room / Satıcı chat otağı yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { sellerId, productId } = body;

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: "Seller ID is required / Satıcı ID tələb olunur" },
        { status: 400 }
      );
    }

    // Verify user is customer / İstifadəçinin müştəri olduğunu yoxla
    if (user.role === 'SELLER' || user.role === 'SUPER_SELLER' || user.role === 'USER_SELLER') {
      return NextResponse.json(
        { success: false, error: "Only customers can create seller chat rooms / Yalnız müştərilər satıcı chat otağı yarada bilər" },
        { status: 403 }
      );
    }

    const room = await getOrCreateSellerChatRoom(user.id, sellerId, productId);

    logger.info("Seller chat room created / Satıcı chat otağı yaradıldı", {
      roomId: room.id,
      customerId: user.id,
      sellerId,
      productId,
    });

    return successResponse(room);
  } catch (error) {
    return handleApiError(error, "create seller chat room");
  }
}

