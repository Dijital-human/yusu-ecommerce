/**
 * Monitoring Errors API / Monitorinq Xətaları API
 * API endpoints for error aggregation and monitoring
 * Xəta aqreqasiyası və monitorinq üçün API endpoint-ləri
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getAggregatedErrors,
  markErrorAsResolved,
  aggregateError,
} from "@/lib/monitoring/error-aggregation";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/monitoring/errors - Get aggregated errors
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Check if user is admin
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const resolved = searchParams.get("resolved");
    const severity = searchParams.get("severity") as 'low' | 'medium' | 'high' | 'critical' | null;
    const limit = parseInt(searchParams.get("limit") || "50");

    const errors = getAggregatedErrors({
      resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
      severity: severity || undefined,
      limit,
    });

    return successResponse(errors);
  } catch (error) {
    return handleApiError(error, "fetch aggregated errors");
  }
}

/**
 * POST /api/monitoring/errors - Aggregate an error (for testing or manual reporting)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Check if user is admin
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { message, stack, endpoint, metadata } = body;

    if (!message) {
      return badRequestResponse("Missing error message");
    }

    const error = new Error(message);
    if (stack) {
      error.stack = stack;
    }

    await aggregateError(error, {
      userId: user.id,
      endpoint,
      metadata,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "aggregate error");
  }
}

/**
 * PUT /api/monitoring/errors/:id/resolve - Mark error as resolved
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Check if user is admin
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const errorId = searchParams.get("id");

    if (!errorId) {
      return badRequestResponse("Missing error ID");
    }

    markErrorAsResolved(errorId, user.id);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "mark error as resolved");
  }
}

