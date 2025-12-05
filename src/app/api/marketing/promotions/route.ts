/**
 * Promotions API Route / Promosiyalar API Route-u
 * Handles promotion and discount operations
 * Promosiya və endirim əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getActivePromotions, validateCouponCode, applyPromotion } from "@/lib/marketing/promotions";
import type { Promotion } from "@/lib/marketing/promotions";

/**
 * GET /api/marketing/promotions - Get active promotions / Aktiv promosiyaları al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicableTo = searchParams.get("applicableTo") as 'all' | 'category' | 'product' | 'seller' | undefined;
    const applicableId = searchParams.get("applicableId") || undefined;

    const promotions = await getActivePromotions(applicableTo, applicableId);

    return successResponse(promotions);
  } catch (error) {
    return handleApiError(error, "fetch promotions");
  }
}

/**
 * POST /api/marketing/promotions - Create promotion / Promosiya yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const {
      name,
      description,
      type,
      startDate,
      endDate,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      applicableTo,
      applicableIds,
      couponCode,
      usageLimit,
      userLimit,
    } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!name || !type || !startDate || !endDate || discountValue === undefined) {
      return badRequestResponse("Missing required fields / Tələb olunan sahələr çatışmır");
    }

    // TODO: Implement database query to create promotion
    // TODO: Promosiya yaratmaq üçün veritabanı sorğusu tətbiq et
    const promotion: Promotion = {
      id: `promo_${Date.now()}`,
      name,
      description,
      type,
      status: 'draft',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      discountValue: parseFloat(discountValue),
      minPurchaseAmount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : undefined,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
      applicableTo: applicableTo || 'all',
      applicableIds,
      couponCode,
      usageLimit,
      userLimit,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return successResponse(promotion, "Promotion created successfully / Promosiya uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create promotion");
  }
}

