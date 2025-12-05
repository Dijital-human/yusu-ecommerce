/**
 * Performance Monitoring API Route / Performans Monitorinq API Route-u
 * Provides performance metrics and statistics
 * Performans metrikaları və statistikalar təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getAPIPerformanceStats,
  getDatabasePerformanceStats,
  getPerformanceMetrics,
  type PerformanceMetricType,
} from "@/lib/monitoring/performance";

/**
 * GET /api/monitoring/performance - Get performance metrics / Performans metrikalarını al
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
    const typeParam = searchParams.get("type");
    const type = typeParam ? (typeParam as PerformanceMetricType) : undefined;
    const endpoint = searchParams.get("endpoint") || undefined;
    const table = searchParams.get("table") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      // Return aggregated statistics / Aqreqat statistikaları qaytar
      const apiStats = getAPIPerformanceStats(endpoint, startDate, endDate);
      const dbStats = getDatabasePerformanceStats(table, startDate, endDate);

      return successResponse({
        api: apiStats,
        database: dbStats,
        period: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString(),
        },
      });
    }

    // Return raw metrics / Xam metrikaları qaytar
    const metrics = getPerformanceMetrics(type, startDate, endDate, limit);

    return successResponse({
      metrics,
      count: metrics.length,
      filters: {
        type: type || 'all',
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error, "fetch performance metrics");
  }
}

