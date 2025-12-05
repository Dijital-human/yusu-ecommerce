/**
 * Admin Loyalty Rewards Processing API Route / Admin Sədaqət Mükafatları Emalı API Route
 * Process birthday and anniversary rewards (Admin only) / Doğum günü və ildönümü mükafatlarını emal et (Yalnız Admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  processBirthdayRewards,
  processAnniversaryRewards,
} from "@/lib/loyalty/loyalty-enhancements";

/**
 * POST /api/admin/loyalty/rewards/process
 * Process birthday and anniversary rewards (Admin only) / Doğum günü və ildönümü mükafatlarını emal et (Yalnız Admin)
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
    const { type } = body; // 'birthday', 'anniversary', or 'both'

    let results: any = {};

    if (type === 'birthday' || type === 'both') {
      const birthdayResults = await processBirthdayRewards();
      results.birthday = birthdayResults;
    }

    if (type === 'anniversary' || type === 'both') {
      const anniversaryResults = await processAnniversaryRewards();
      results.anniversary = anniversaryResults;
    }

    return successResponse(results, "Rewards processed successfully / Mükafatlar uğurla emal olundu");
  } catch (error) {
    return handleApiError(error, "process loyalty rewards");
  }
}

