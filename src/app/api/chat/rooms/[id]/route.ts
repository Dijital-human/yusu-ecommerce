/**
 * Chat Room API Route / Chat Otağı API Route
 * Get, update, and close chat room / Chat otağını al, yenilə və bağla
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import {
  getChatRoom,
  closeChatRoom,
  assignSupportStaff,
  rateChatRoom,
} from "@/lib/chat/chat-service";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

/**
 * GET /api/chat/rooms/[id]
 * Get chat room details / Chat otağı detallarını al
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

    const room = await getChatRoom(id, user.id);

    return successResponse(room);
  } catch (error) {
    return handleApiError(error, "get chat room");
  }
}

/**
 * PATCH /api/chat/rooms/[id]
 * Update chat room (assign support, close, rate) / Chat otağını yenilə (dəstək təyin et, bağla, reytinqlə)
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
    const { action, supportStaffId, rating, comment } = body;

    if (action === "assign" && (user.role === "ADMIN" || user.role === "SUPPORT")) {
      // Assign support staff / Dəstək işçisi təyin et
      if (!supportStaffId) {
        return NextResponse.json(
          { success: false, error: "Support staff ID is required / Dəstək işçisi ID-si tələb olunur" },
          { status: 400 }
        );
      }

      const room = await assignSupportStaff(id, supportStaffId);
      return successResponse(room);
    }

    if (action === "close") {
      // Close chat room / Chat otağını bağla
      const room = await closeChatRoom(id, user.id);
      return successResponse(room);
    }

    if (action === "rate" && user.role === "CUSTOMER") {
      // Rate chat room / Chat otağını reytinqlə
      if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json(
          { success: false, error: "Rating must be between 1 and 5 / Reytinq 1 ilə 5 arasında olmalıdır" },
          { status: 400 }
        );
      }

      const room = await rateChatRoom(id, user.id, rating, comment);
      return successResponse(room);
    }

    return NextResponse.json(
      { success: false, error: "Invalid action / Etibarsız əməliyyat" },
      { status: 400 }
    );
  } catch (error) {
    return handleApiError(error, "update chat room");
  }
}

