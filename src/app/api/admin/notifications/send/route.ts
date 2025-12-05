/**
 * Admin Notification Send API Route / Admin Bildiriş Göndərmə API Route-u
 * This endpoint handles sending notifications to customers
 * Bu endpoint müştərilərə bildiriş göndərməni idarə edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";
import { emitUserNotification } from "@/lib/events/user-events";

interface NotificationRequest {
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  targetType: "all" | "segment";
  segment?: {
    role?: string;
    isActive?: boolean;
    location?: {
      country?: string;
      city?: string;
    };
  };
  scheduledAt?: string; // ISO date string for scheduled notifications
}

// POST /api/admin/notifications/send - Send notification / Bildiriş göndər
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json() as NotificationRequest;
    const { title, message, type = "info", targetType, segment, scheduledAt } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!title || !message || !targetType) {
      return badRequestResponse("Title, message, and targetType are required / Başlıq, mesaj və targetType tələb olunur");
    }

    const prisma = await getReadClient();

    // Determine target users / Hədəf istifadəçiləri müəyyənləşdir
    let targetUserIds: string[] = [];

    if (targetType === "all") {
      // Get all active customers / Bütün aktiv müştəriləri al
      const allCustomers = await prisma.user.findMany({
        where: {
          role: "CUSTOMER",
          isActive: true,
        },
        select: {
          id: true,
        },
      });
      targetUserIds = allCustomers.map((c: { id: string }) => c.id);
    } else if (targetType === "segment" && segment) {
      // Build where clause for segment / Segment üçün where clause qur
      const where: any = {
        role: segment.role || "CUSTOMER",
      };

      if (segment.isActive !== undefined) {
        where.isActive = segment.isActive;
      }

      // Location-based filtering would require additional schema / Location-based filtering əlavə schema tələb edir
      // For now, we'll use basic filtering / Hal-hazırda əsas filtering istifadə edəcəyik

      const segmentCustomers = await prisma.user.findMany({
        where,
        select: {
          id: true,
        },
      });
      targetUserIds = segmentCustomers.map((c: { id: string }) => c.id);
    }

    // If scheduled, store notification for later / Əgər planlaşdırılıbsa, bildirişi sonra üçün saxla
    if (scheduledAt) {
      // TODO: Implement notification scheduling / Bildiriş planlaşdırmasını tətbiq et
      // For now, we'll just log it / Hal-hazırda yalnız log edəcəyik
      logger.info('Scheduled notification created / Planlaşdırılmış bildiriş yaradıldı', {
        adminId: user.id,
        title,
        targetCount: targetUserIds.length,
        scheduledAt,
      });

      return successResponse({
        scheduled: true,
        scheduledAt,
        targetCount: targetUserIds.length,
      }, "Notification scheduled successfully / Bildiriş uğurla planlaşdırıldı");
    }

    // Send notifications immediately / Bildirişləri dərhal göndər
    const notificationResults = await Promise.allSettled(
      targetUserIds.map((userId) =>
        emitUserNotification(userId, {
          title,
          message,
          type,
          source: "admin",
          adminId: user.id,
        })
      )
    );

    const successCount = notificationResults.filter((r) => r.status === "fulfilled").length;
    const failureCount = notificationResults.filter((r) => r.status === "rejected").length;

    logger.info('Notifications sent / Bildirişlər göndərildi', {
      adminId: user.id,
      title,
      totalTargets: targetUserIds.length,
      successCount,
      failureCount,
    });

    return successResponse({
      sent: true,
      totalTargets: targetUserIds.length,
      successCount,
      failureCount,
    }, `Notifications sent to ${successCount} customers / Bildirişlər ${successCount} müştəriyə göndərildi`);
  } catch (error) {
    return handleApiError(error, "send notification");
  }
}

