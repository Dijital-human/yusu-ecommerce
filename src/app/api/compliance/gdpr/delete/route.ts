/**
 * GDPR Data Deletion API Route / GDPR Məlumat Silmə API Route-u
 * Handles GDPR data deletion requests (right to be forgotten)
 * GDPR məlumat silmə sorğularını idarə edir (unudulma hüququ)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { deleteUserData } from "@/lib/compliance/gdpr";

/**
 * POST /api/compliance/gdpr/delete - Delete user data / İstifadəçi məlumatlarını sil
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const body = await request.json();
    const { confirm } = body;

    if (!confirm || confirm !== 'DELETE') {
      return badRequestResponse("Confirmation required. Send { confirm: 'DELETE' } / Təsdiq tələb olunur. { confirm: 'DELETE' } göndərin");
    }

    const result = await deleteUserData(user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to delete data / Məlumatları silmək uğursuz oldu",
        },
        { status: 500 }
      );
    }

    return successResponse({ success: true }, "Data deleted successfully / Məlumatlar uğurla silindi");
  } catch (error) {
    return handleApiError(error, "delete user data");
  }
}

