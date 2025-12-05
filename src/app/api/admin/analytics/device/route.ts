/**
 * Admin Device Analytics API Route / Admin Device Analitika API Route-u
 * This endpoint provides device-based analytics for admin panel
 * Bu endpoint admin panel üçün device-based analitika təmin edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 * 
 * NOTE: Device tracking requires additional schema fields
 * QEYD: Device tracking əlavə schema sahələri tələb edir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/analytics/device - Get device analytics / Device analitikasını al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    // TODO: Implement device tracking
    // Production-da bu UserSession və ya UserActivity model-dən gələcək
    // Hal-hazırda mock data qaytaracağıq
    // Production-da bu UserSession və ya UserActivity model-dən gələcək

    logger.info('Admin fetched device analytics / Admin device analitikasını əldə etdi', {
      adminId: user.id,
    });

    // Mock data for now / Hal-hazırda mock data
    return successResponse({
      deviceTypes: [
        { type: "desktop", count: 45, percentage: 45 },
        { type: "mobile", count: 40, percentage: 40 },
        { type: "tablet", count: 15, percentage: 15 },
      ],
      browsers: [
        { name: "Chrome", count: 60, percentage: 60 },
        { name: "Safari", count: 25, percentage: 25 },
        { name: "Firefox", count: 10, percentage: 10 },
        { name: "Edge", count: 5, percentage: 5 },
      ],
      operatingSystems: [
        { name: "Windows", count: 50, percentage: 50 },
        { name: "macOS", count: 30, percentage: 30 },
        { name: "iOS", count: 15, percentage: 15 },
        { name: "Android", count: 5, percentage: 5 },
      ],
      timestamp: new Date().toISOString(),
      note: "Mock data - Device tracking requires additional schema implementation / Mock data - Device tracking əlavə schema tətbiqi tələb edir",
    });
  } catch (error) {
    return handleApiError(error, "fetch device analytics");
  }
}

