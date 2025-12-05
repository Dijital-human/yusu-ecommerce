/**
 * Chat Room API / Chat Otağı API
 * Create and manage chat rooms
 * Chat otaqlarını yarat və idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";
import { createChatRoom, getUserChatRooms } from "@/lib/chat/chat-service";
import { logger } from "@/lib/utils/logger";

/**
 * POST - Create new chat room / Yeni chat otağı yarat
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required / Autentifikasiya tələb olunur" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, orderId } = body;

    // Check if user has an open chat room / İstifadəçinin açıq chat otağı olub-olmadığını yoxla
    const existingRooms = await getUserChatRooms(session.user.id, session.user.role || "CUSTOMER", 1, 0);
    
    const openRoom = existingRooms.rooms.find(
      (room: any) => room.status === "OPEN" || room.status === "WAITING" || room.status === "IN_PROGRESS"
    );

    if (openRoom) {
      // Return existing room / Mövcud otağı qaytar
      return NextResponse.json({
        roomId: openRoom.id,
        messages: openRoom.messages || [],
        status: openRoom.status,
        isExisting: true,
      });
    }

    // Create new chat room / Yeni chat otağı yarat
    const chatRoom = await createChatRoom(session.user.id, productId, orderId);

    logger.info("Chat room created via API / API vasitəsilə chat otağı yaradıldı", {
      roomId: chatRoom.id,
      userId: session.user.id,
    });

    return NextResponse.json({
      roomId: chatRoom.id,
      messages: [],
      status: "OPEN",
      isExisting: false,
    });
  } catch (error) {
    logger.error("Failed to create chat room / Chat otağı yaratmaq uğursuz oldu", error);
    return NextResponse.json(
      { error: "Failed to create chat room / Chat otağı yaratmaq uğursuz oldu" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get user's chat rooms / İstifadəçinin chat otaqlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required / Autentifikasiya tələb olunur" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getUserChatRooms(
      session.user.id,
      session.user.role || "CUSTOMER",
      limit,
      offset
    );

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to get chat rooms / Chat otaqlarını almaq uğursuz oldu", error);
    return NextResponse.json(
      { error: "Failed to get chat rooms / Chat otaqlarını almaq uğursuz oldu" },
      { status: 500 }
    );
  }
}

