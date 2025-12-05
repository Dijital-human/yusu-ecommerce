/**
 * Chat Messages API Route / Chat Mesajları API Route
 * Get and send chat messages / Chat mesajlarını al və göndər
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import {
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
} from "@/lib/chat/chat-service";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

// Chat Sender Type / Chat Göndərən Tipi
type ChatSenderType = "CUSTOMER" | "SUPPORT";

/**
 * GET /api/chat/rooms/[id]/messages
 * Get chat messages / Chat mesajlarını al
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
    const { id: roomId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Verify room access / Otaq girişini yoxla
    const { getChatRoom } = await import("@/lib/chat/chat-service");
    await getChatRoom(roomId, user.id);

    const result = await getChatMessages(roomId, limit, offset);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "get chat messages");
  }
}

/**
 * POST /api/chat/rooms/[id]/messages
 * Send a chat message / Chat mesajı göndər
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
    const body = await request.json();
    const { content, attachments } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message content is required / Mesaj məzmunu tələb olunur" },
        { status: 400 }
      );
    }

    // Determine sender type / Göndərən tipini müəyyən et
    const senderType: ChatSenderType =
      user.role === "ADMIN" || user.role === "SUPPORT"
        ? "SUPPORT"
        : "CUSTOMER";

    const message = await sendChatMessage(
      roomId,
      user.id,
      senderType,
      content.trim(),
      attachments
    );

    return successResponse(message);
  } catch (error) {
    return handleApiError(error, "send chat message");
  }
}

/**
 * PUT /api/chat/rooms/[id]/messages
 * Mark messages as read / Mesajları oxunmuş kimi işarələ
 */
export async function PUT(
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
    const { getChatRoom } = await import("@/lib/chat/chat-service");
    await getChatRoom(roomId, user.id);

    const result = await markMessagesAsRead(roomId, user.id);

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "mark messages as read");
  }
}

