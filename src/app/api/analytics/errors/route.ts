/**
 * Error Tracking API Route / Xəta İzləmə API Route-u
 * Handles error tracking and reporting
 * Xəta izləmə və hesabatı idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { 
  captureError, 
  captureException, 
  captureMessage,
  getErrorReports,
  resolveError,
  getErrorStatistics,
  clearResolvedErrors
} from "@/lib/analytics/error-tracking";

/**
 * POST /api/analytics/errors - Capture error / Xətanı tut
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, stack, severity = 'medium', context = {} } = body;

    if (!message) {
      return badRequestResponse("Error message is required / Xəta mesajı tələb olunur");
    }

    const error = stack ? new Error(message) : new Error(message);
    if (stack) {
      error.stack = stack;
    }

    const errorId = captureError(error, severity, {
      ...context,
      url: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return successResponse({ errorId }, "Error captured successfully / Xəta uğurla tutuldu");
  } catch (error) {
    return handleApiError(error, "capture error");
  }
}

/**
 * GET /api/analytics/errors - Get error reports / Xəta hesabatlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity") as any;
    const resolved = searchParams.get("resolved");
    const limit = parseInt(searchParams.get("limit") || "100");
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const statistics = getErrorStatistics();
      return successResponse(statistics);
    }

    const reports = getErrorReports(
      severity,
      resolved === 'true' ? true : resolved === 'false' ? false : undefined,
      limit
    );

    return successResponse(reports);
  } catch (error) {
    return handleApiError(error, "fetch error reports");
  }
}

/**
 * PUT /api/analytics/errors - Resolve error / Xətanı həll et
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { errorId, action } = body;

    if (!errorId) {
      return badRequestResponse("Error ID is required / Xəta ID tələb olunur");
    }

    if (action === 'resolve') {
      const success = resolveError(errorId, user.id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: "Error not found / Xəta tapılmadı" },
          { status: 404 }
        );
      }
      return successResponse({ success: true }, "Error resolved successfully / Xəta uğurla həll edildi");
    }

    if (action === 'clear_resolved') {
      const cleared = clearResolvedErrors();
      return successResponse({ cleared }, "Resolved errors cleared successfully / Həll edilmiş xətalar uğurla təmizləndi");
    }

    return badRequestResponse("Invalid action. Must be 'resolve' or 'clear_resolved' / Yanlış əməliyyat. 'resolve' və ya 'clear_resolved' olmalıdır");
  } catch (error) {
    return handleApiError(error, "update error");
  }
}

