/**
 * Chat Typing Indicator API Route / Chat Yazma Göstəricisi API Route
 * Send typing indicator / Yazma göstəricisi göndər
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { emitRealtimeEvent } from "@/lib/realtime/sse";
import { getChatRoom } from "@/lib/chat/chat-service";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

/**
 * POST /api/chat/rooms/[id]/typing
 * Send typing indicator / Yazma göstəricisi göndər
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
    const { id: roomId } = await params;

    // Verify room access / Otaq girişini yoxla
    const room = await getChatRoom(roomId, user.id);

    // Emit typing event to recipient / Alıcıya yazma hadisəsi yayımla
    const recipientId =
      room.customerId === user.id
        ? room.supportStaffId
        : room.customerId;

    if (recipientId) {
      emitRealtimeEvent(
        "chat.typing",
        {
          roomId,
          userId: user.id,
          userName: user.name || user.email,
          isTyping: true,
        },
        recipientId
      );
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "send typing indicator");
  }
}

