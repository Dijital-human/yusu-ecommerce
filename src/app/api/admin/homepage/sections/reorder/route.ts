/**
 * Admin Homepage Sections Reorder API Route / Admin Ana Səhifə Bölmələri Yenidən Sıralama API Route-u
 * This endpoint reorders homepage sections
 * Bu endpoint ana səhifə bölmələrini yenidən sıralayır
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 * 
 * Supports multilingual content through error messages
 * Xəta mesajları vasitəsilə çoxdilli məzmunu dəstəkləyir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { reorderHomepageSections } from "@/services/homepage.service";
import { logger } from "@/lib/utils/logger";

// PUT /api/admin/homepage/sections/reorder - Reorder sections / Bölmələri yenidən sırala
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { sectionOrders } = body;

    // Validate input / Girişi yoxla
    if (!Array.isArray(sectionOrders) || sectionOrders.length === 0) {
      return badRequestResponse(
        "sectionOrders must be a non-empty array / sectionOrders boş olmayan array olmalıdır"
      );
    }

    // Validate each order item / Hər sıralama elementini yoxla
    for (const order of sectionOrders) {
      if (!order.id || typeof order.order !== 'number') {
        return badRequestResponse(
          "Each order item must have 'id' and 'order' fields / Hər sıralama elementində 'id' və 'order' sahələri olmalıdır"
        );
      }
    }

    await reorderHomepageSections(sectionOrders);
    
    logger.info('Admin reordered homepage sections / Admin ana səhifə bölmələrini yenidən sıraladı', {
      adminId: user.id,
      count: sectionOrders.length,
    });

    return successResponse(
      { reordered: true, count: sectionOrders.length }, 
      "Homepage sections reordered successfully / Ana səhifə bölmələri uğurla yenidən sıralandı"
    );
  } catch (error) {
    return handleApiError(error, "reorder homepage sections");
  }
}

