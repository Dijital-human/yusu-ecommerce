/**
 * GDPR Data Export API Route / GDPR Məlumat Eksportu API Route-u
 * Handles GDPR data export requests
 * GDPR məlumat eksport sorğularını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { exportUserData } from "@/lib/compliance/gdpr";

/**
 * POST /api/compliance/gdpr/export - Export user data / İstifadəçi məlumatlarını eksport et
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const result = await exportUserData(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to export data / Məlumatları eksport etmək uğursuz oldu",
        },
        { status: 500 }
      );
    }

    return successResponse(result.data, "Data exported successfully / Məlumatlar uğurla eksport edildi");
  } catch (error) {
    return handleApiError(error, "export user data");
  }
}

