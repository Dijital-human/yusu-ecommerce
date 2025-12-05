/**
 * Security Events API Route / Təhlükəsizlik Hadisələri API Route-u
 * Provides security event monitoring endpoints
 * Təhlükəsizlik hadisə monitorinq endpoint-ləri təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getSecurityEvents, SecurityEventType } from "@/lib/security/monitoring";

/**
 * GET /api/security/events - Get security events / Təhlükəsizlik hadisələrini al
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
    const type = searchParams.get("type") as SecurityEventType | undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const limit = parseInt(searchParams.get("limit") || "100");

    const events = getSecurityEvents(type, startDate, endDate, limit);

    return successResponse({
      events,
      count: events.length,
      filters: {
        type: type || 'all',
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, "fetch security events");
  }
}

