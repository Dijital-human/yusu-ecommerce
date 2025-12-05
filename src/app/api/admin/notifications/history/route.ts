/**
 * Admin Notification History API Route / Admin Bildiriş Tarixçəsi API Route-u
 * This endpoint provides notification history for admin panel
 * Bu endpoint admin panel üçün bildiriş tarixçəsini təmin edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { parsePagination, createPaginationInfo } from "@/lib/api/pagination";
import { successResponseWithPagination, successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

// For now, we'll query audit logs for notification events
// Production-da bu NotificationHistory model olmalıdır
// Hal-hazırda audit log-lardan notification event-lərini soruşacağıq
// Production-da bu NotificationHistory model olmalıdır

// GET /api/admin/notifications/history - Get notification history / Bildiriş tarixçəsini al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 20);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const prisma = await getReadClient();

    // Build where clause / Where clause qur
    const where: any = {
      resourceType: "notification",
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Get notification history from audit logs / Audit log-lardan bildiriş tarixçəsini al
    const [notifications, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        select: {
          id: true,
          action: true,
          resourceType: true,
          resourceId: true,
          createdAt: true,
          userId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const pagination = createPaginationInfo(page, limit, total);

    // Calculate stats / Statistikaları hesabla
    const stats = {
      total: total,
      last24Hours: await prisma.auditLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      last7Days: await prisma.auditLog.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    };

    logger.info('Admin fetched notification history / Admin bildiriş tarixçəsini əldə etdi', {
      adminId: user.id,
      total,
      page,
      limit,
    });

    return successResponseWithPagination(
      {
        notifications,
        stats,
      },
      pagination
    );
  } catch (error) {
    return handleApiError(error, "fetch notification history");
  }
}

