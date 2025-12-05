/**
 * Stock Transfers API Route / Stok Transferləri API Route-u
 * Handles stock transfer operations
 * Stok transferi əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/api/response";
import {
  createStockTransfer,
  approveStockTransfer,
  completeStockTransfer,
  cancelStockTransfer,
  getStockTransfers,
} from "@/lib/inventory/stock-transfer";

/**
 * GET /api/inventory/transfers - Get stock transfers / Stok transferlərini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { searchParams } = new URL(request.url);
    const fromWarehouseId = searchParams.get("fromWarehouseId");
    const toWarehouseId = searchParams.get("toWarehouseId");
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    const transfers = await getStockTransfers({
      fromWarehouseId: fromWarehouseId || undefined,
      toWarehouseId: toWarehouseId || undefined,
      productId: productId || undefined,
      status: status || undefined,
    });

    return successResponse(transfers);
  } catch (error) {
    return handleApiError(error, "get stock transfers");
  }
}

/**
 * POST /api/inventory/transfers - Create stock transfer / Stok transferi yarat
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
    const { fromWarehouseId, toWarehouseId, productId, quantity, notes } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!fromWarehouseId || !toWarehouseId || !productId || !quantity) {
      return badRequestResponse("Missing required fields / Tələb olunan sahələr çatışmır");
    }

    if (quantity <= 0) {
      return badRequestResponse("Quantity must be greater than 0 / Miqdar 0-dan böyük olmalıdır");
    }

    const transfer = await createStockTransfer({
      fromWarehouseId,
      toWarehouseId,
      productId,
      quantity,
      notes,
    });

    return successResponse(transfer, "Stock transfer created successfully / Stok transferi uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create stock transfer");
  }
}

/**
 * PUT /api/inventory/transfers - Update stock transfer / Stok transferini yenilə
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return badRequestResponse("Transfer ID and action are required / Transfer ID-si və əməliyyat tələb olunur");
    }

    let result;

    switch (action) {
      case "approve":
        result = await approveStockTransfer(id);
        return successResponse(result, "Stock transfer approved successfully / Stok transferi uğurla təsdiqləndi");
      case "complete":
        result = await completeStockTransfer(id);
        return successResponse(result, "Stock transfer completed successfully / Stok transferi uğurla tamamlandı");
      case "cancel":
        result = await cancelStockTransfer(id);
        return successResponse(result, "Stock transfer cancelled successfully / Stok transferi uğurla ləğv edildi");
      default:
        return badRequestResponse("Invalid action. Valid actions: approve, complete, cancel / Yanlış əməliyyat. Etibarlı əməliyyatlar: approve, complete, cancel");
    }
  } catch (error) {
    return handleApiError(error, "update stock transfer");
  }
}

