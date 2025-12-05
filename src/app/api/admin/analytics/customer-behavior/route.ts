/**
 * Admin Customer Behavior Analytics API Route / Admin Müştəri Davranışı Analitika API Route-u
 * Provides customer behavior analytics for admin panel
 * Admin panel üçün müştəri davranışı analitikası təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { calculateCustomerBehaviorMetrics, CustomerBehaviorFilters } from "@/lib/analytics/customer-behavior";

/**
 * GET /api/admin/analytics/customer-behavior - Get customer behavior analytics / Müştəri davranışı analitikasını al
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
    
    // Date range filtering / Tarix aralığı filtrləməsi
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const customerSegment = searchParams.get("customerSegment");

    // Build filters / Filtrləri qur
    const filters: CustomerBehaviorFilters = {};
    
    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    if (customerSegment) {
      filters.customerSegment = customerSegment;
    }

    // Calculate metrics / Metrikaları hesabla
    const metrics = await calculateCustomerBehaviorMetrics(filters);

    return successResponse(metrics);
  } catch (error) {
    return handleApiError(error, "get customer behavior analytics");
  }
}

