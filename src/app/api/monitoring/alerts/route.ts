/**
 * Alerts API Route / Xəbərdarlıqlar API Route-u
 * Provides alert management and monitoring
 * Xəbərdarlıq idarəetməsi və monitorinq təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  checkAlerts,
  getActiveAlerts,
  getAllAlerts,
  resolveAlert,
  getAlertRules,
  upsertAlertRule,
  removeAlertRule,
  getAlertRule,
  type AlertRule,
} from "@/lib/monitoring/alerts";

/**
 * GET /api/monitoring/alerts - Get alerts / Alert-ləri al
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
    const activeOnly = searchParams.get("activeOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const check = searchParams.get("check") === "true"; // Trigger alert check / Alert yoxlamasını tetiklə

    // Trigger alert check if requested / Tələb olunarsa alert yoxlamasını tetiklə
    if (check) {
      await checkAlerts();
    }

    const alerts = activeOnly ? getActiveAlerts() : getAllAlerts(limit);

    return successResponse({
      alerts,
      count: alerts.length,
      activeCount: getActiveAlerts().length,
    });
  } catch (error) {
    return handleApiError(error, "fetch alerts");
  }
}

/**
 * POST /api/monitoring/alerts - Create or update alert rule / Alert qaydası yarat və ya yenilə
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json() as AlertRule;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!body.id || !body.name || !body.type || !body.severity || body.threshold === undefined) {
      return badRequestResponse("Missing required fields / Tələb olunan sahələr çatışmır");
    }

    upsertAlertRule(body);

    return successResponse({
      message: "Alert rule created/updated successfully / Alert qaydası uğurla yaradıldı/yeniləndi",
      rule: body,
    });
  } catch (error) {
    return handleApiError(error, "create/update alert rule");
  }
}

/**
 * DELETE /api/monitoring/alerts - Delete alert rule / Alert qaydasını sil
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const ruleId = searchParams.get("ruleId");

    if (!ruleId) {
      return badRequestResponse("Rule ID is required / Qayda ID tələb olunur");
    }

    const removed = removeAlertRule(ruleId);

    if (!removed) {
      return badRequestResponse("Alert rule not found / Alert qaydası tapılmadı");
    }

    return successResponse({
      message: "Alert rule deleted successfully / Alert qaydası uğurla silindi",
    });
  } catch (error) {
    return handleApiError(error, "delete alert rule");
  }
}

