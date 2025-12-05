/**
 * Warehouses API Route / Anbarlar API Route-u
 * Handles warehouse operations
 * Anbar əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/api/response";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deactivateWarehouse,
  getProductStockAcrossWarehouses,
  selectBestWarehouse,
} from "@/lib/inventory/warehouse";

/**
 * GET /api/inventory/warehouses - Get all warehouses / Bütün anbarları al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("id");
    const productId = searchParams.get("productId");
    const includeInactive = searchParams.get("includeInactive") === "true";

    if (warehouseId) {
      // Get specific warehouse / Müəyyən anbarı al
      const warehouse = await getWarehouseById(warehouseId);
      if (!warehouse) {
        return NextResponse.json(
          { success: false, error: "Warehouse not found / Anbar tapılmadı" },
          { status: 404 }
        );
      }
      return successResponse(warehouse);
    }

    if (productId) {
      // Get stock for product across warehouses / Məhsulun anbarlardakı stokunu al
      const stock = await getProductStockAcrossWarehouses(productId);
      return successResponse(stock);
    }

    // Get all warehouses / Bütün anbarları al
    const warehouses = await getAllWarehouses(includeInactive);
    return successResponse(warehouses);
  } catch (error) {
    return handleApiError(error, "get warehouses");
  }
}

/**
 * POST /api/inventory/warehouses - Create warehouse / Anbar yarat
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
    const { name, address, city, state, zipCode, country, capacity } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!name || !address || !city || !state || !zipCode || !country) {
      return badRequestResponse("Missing required fields / Tələb olunan sahələr çatışmır");
    }

    const warehouse = await createWarehouse({
      name,
      address,
      city,
      state,
      zipCode,
      country,
      capacity,
    });

    return successResponse(warehouse, "Warehouse created successfully / Anbar uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create warehouse");
  }
}

/**
 * PUT /api/inventory/warehouses - Update warehouse / Anbarı yenilə
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
    const { id, ...updateData } = body;

    if (!id) {
      return badRequestResponse("Warehouse ID is required / Anbar ID-si tələb olunur");
    }

    const warehouse = await updateWarehouse(id, updateData);
    return successResponse(warehouse, "Warehouse updated successfully / Anbar uğurla yeniləndi");
  } catch (error) {
    return handleApiError(error, "update warehouse");
  }
}

/**
 * DELETE /api/inventory/warehouses - Deactivate warehouse / Anbarı deaktivləşdir
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get("id");

    if (!warehouseId) {
      return badRequestResponse("Warehouse ID is required / Anbar ID-si tələb olunur");
    }

    const warehouse = await deactivateWarehouse(warehouseId);
    return successResponse(warehouse, "Warehouse deactivated successfully / Anbar uğurla deaktivləşdirildi");
  } catch (error) {
    return handleApiError(error, "deactivate warehouse");
  }
}

