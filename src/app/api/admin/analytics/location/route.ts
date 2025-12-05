/**
 * Admin Location Analytics API Route / Admin Location Analitika API Route-u
 * This endpoint provides location-based analytics for admin panel
 * Bu endpoint admin panel üçün location-based analitika təmin edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/analytics/location - Get location analytics / Location analitikasını al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const prisma = await getReadClient();

    // Get location distribution from addresses / Ünvanlardan location distribution al
    const locationStats = await prisma.address.groupBy({
      by: ["country", "city"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 50,
    });

    // Get country distribution / Ölkə distribution al
    const countryDistribution = await prisma.address.groupBy({
      by: ["country"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    // Get city distribution / Şəhər distribution al
    const cityDistribution = await prisma.address.groupBy({
      by: ["city"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 20,
    });

    logger.info('Admin fetched location analytics / Admin location analitikasını əldə etdi', {
      adminId: user.id,
    });

    return successResponse({
      locationStats,
      countryDistribution,
      cityDistribution,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error, "fetch location analytics");
  }
}

