/**
 * Stock Forecast API Route / Stok Proqnoz API Route-u
 * Handles stock forecasting operations
 * Stok proqnozlaşdırma əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/api/response";
import {
  getProductForecast,
  getAllProductForecasts,
  getLowStockAlerts,
} from "@/lib/inventory/forecasting";

/**
 * GET /api/inventory/forecast - Get stock forecasts / Stok proqnozlarını al
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
    const productId = searchParams.get("productId");
    const leadTimeDays = parseInt(searchParams.get("leadTimeDays") || "7", 10);
    const lowStockOnly = searchParams.get("lowStockOnly") === "true";
    const threshold = searchParams.get("threshold") ? parseInt(searchParams.get("threshold")!, 10) : undefined;

    if (productId) {
      // Get forecast for specific product / Müəyyən məhsul üçün proqnozu al
      const forecast = await getProductForecast(productId, leadTimeDays);
      if (!forecast) {
        return NextResponse.json(
          { success: false, error: "Product not found / Məhsul tapılmadı" },
          { status: 404 }
        );
      }
      return successResponse(forecast);
    }

    if (lowStockOnly) {
      // Get low stock alerts / Aşağı stok xəbərdarlıqlarını al
      const forecasts = await getLowStockAlerts(threshold);
      return successResponse(forecasts);
    }

    // Get all forecasts / Bütün proqnozları al
    const forecasts = await getAllProductForecasts(leadTimeDays);
    return successResponse(forecasts);
  } catch (error) {
    return handleApiError(error, "get stock forecasts");
  }
}
