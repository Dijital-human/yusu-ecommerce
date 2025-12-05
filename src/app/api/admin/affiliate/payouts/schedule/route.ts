/**
 * Admin Affiliate Payout Scheduling API Route / Admin Affiliate Ödəniş Planlaşdırması API Route
 * Schedule payouts for affiliate programs / Affiliate proqramları üçün ödənişləri planlaşdır
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { schedulePayoutsForProgram, getScheduledPayouts } from "@/lib/affiliate/affiliate-enhancements";
import { getReadClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/admin/affiliate/payouts/schedule
 * Get scheduled payouts (Admin only) / Planlaşdırılmış ödənişləri al (Yalnız Admin)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId") || undefined;
    const scheduledDate = searchParams.get("scheduledDate") ? new Date(searchParams.get("scheduledDate")!) : undefined;

    const payouts = await getScheduledPayouts(programId, scheduledDate);
    return successResponse(payouts);
  } catch (error) {
    return handleApiError(error, "get scheduled payouts");
  }
}

/**
 * POST /api/admin/affiliate/payouts/schedule
 * Schedule payouts for a program (Admin only) / Proqram üçün ödənişləri planlaşdır (Yalnız Admin)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json(
        { success: false, error: "Program ID is required / Proqram ID tələb olunur" },
        { status: 400 }
      );
    }

    const result = await schedulePayoutsForProgram(programId);

    logger.info("Payouts scheduled / Ödənişlər planlaşdırıldı", {
      adminId: user.id,
      programId,
      scheduledCount: result.scheduled,
    });

    return successResponse(result, "Payouts scheduled successfully / Ödənişlər uğurla planlaşdırıldı");
  } catch (error) {
    return handleApiError(error, "schedule payouts");
  }
}

