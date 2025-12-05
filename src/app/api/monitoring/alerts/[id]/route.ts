/**
 * Alert Management API Route / Xəbərdarlıq İdarəetməsi API Route-u
 * Provides individual alert management
 * Fərdi xəbərdarlıq idarəetməsi təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { resolveAlert, getAlertRule } from "@/lib/monitoring/alerts";

/**
 * GET /api/monitoring/alerts/[id] - Get alert rule / Alert qaydasını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const ruleId = id;

    if (!ruleId) {
      return badRequestResponse("Rule ID is required / Qayda ID tələb olunur");
    }

    const rule = getAlertRule(ruleId);

    if (!rule) {
      return badRequestResponse("Alert rule not found / Alert qaydası tapılmadı");
    }

    return successResponse({ rule });
  } catch (error) {
    return handleApiError(error, "fetch alert rule");
  }
}

/**
 * PATCH /api/monitoring/alerts/[id] - Resolve alert / Alert-i həll et
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { id } = await params;
    const alertId = id;

    if (!alertId) {
      return badRequestResponse("Alert ID is required / Alert ID tələb olunur");
    }

    const resolved = resolveAlert(alertId);

    if (!resolved) {
      return badRequestResponse("Alert not found or already resolved / Alert tapılmadı və ya artıq həll edilib");
    }

    return successResponse({
      message: "Alert resolved successfully / Alert uğurla həll edildi",
    });
  } catch (error) {
    return handleApiError(error, "resolve alert");
  }
}

