/**
 * Warehouse Service / Anbar Xidməti
 * Business logic for warehouse operations
 * Anbar əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export interface CreateWarehouseData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  capacity?: number;
}

export interface WarehouseStockInfo {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
}

/**
 * Create warehouse / Anbar yarat
 */
export async function createWarehouse(data: CreateWarehouseData) {
  const warehouse = await prisma.warehouses.create({
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      capacity: data.capacity,
      isActive: true,
    },
  });

  logger.info("Warehouse created / Anbar yaradıldı", { warehouseId: warehouse.id, name: warehouse.name });
  return warehouse;
}

/**
 * Get all warehouses / Bütün anbarları al
 */
export async function getAllWarehouses(includeInactive = false) {
  const warehouses = await prisma.warehouses.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { name: "asc" },
  });

  return warehouses;
}

/**
 * Get warehouse by ID / ID ilə anbarı al
 */
export async function getWarehouseById(warehouseId: string) {
  const warehouse = await prisma.warehouses.findUnique({
    where: { id: warehouseId },
    include: {
      stock: {
        include: {
          product: true,
        },
      },
    },
  });

  return warehouse;
}

/**
 * Update warehouse / Anbarı yenilə
 */
export async function updateWarehouse(warehouseId: string, data: Partial<CreateWarehouseData>) {
  const warehouse = await prisma.warehouses.update({
    where: { id: warehouseId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.address && { address: data.address }),
      ...(data.city && { city: data.city }),
      ...(data.state && { state: data.state }),
      ...(data.zipCode && { zipCode: data.zipCode }),
      ...(data.country && { country: data.country }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
    },
  });

  logger.info("Warehouse updated / Anbar yeniləndi", { warehouseId, name: warehouse.name });
  return warehouse;
}

/**
 * Deactivate warehouse / Anbarı deaktivləşdir
 */
export async function deactivateWarehouse(warehouseId: string) {
  const warehouse = await prisma.warehouses.update({
    where: { id: warehouseId },
    data: { isActive: false },
  });

  logger.info("Warehouse deactivated / Anbar deaktivləşdirildi", { warehouseId });
  return warehouse;
}

/**
 * Get stock for product across all warehouses / Məhsulun bütün anbarlardakı stokunu al
 */
export async function getProductStockAcrossWarehouses(productId: string): Promise<WarehouseStockInfo[]> {
  const stock = await prisma.warehouse_stock.findMany({
    where: { productId },
    include: {
      warehouse: true,
    },
  });

  return stock.map((s) => ({
    warehouseId: s.warehouseId,
    warehouseName: s.warehouse.name,
    productId: s.productId,
    quantity: s.quantity,
    reserved: s.reserved,
    available: s.quantity - s.reserved,
  }));
}

/**
 * Get stock for product in specific warehouse / Məhsulun müəyyən anbardakı stokunu al
 */
export async function getProductStockInWarehouse(productId: string, warehouseId: string) {
  const stock = await prisma.warehouse_stock.findUnique({
    where: {
      warehouseId_productId: {
        warehouseId,
        productId,
      },
    },
    include: {
      warehouse: true,
      product: true,
    },
  });

  return stock;
}

/**
 * Update stock in warehouse / Anbardakı stoku yenilə
 */
export async function updateWarehouseStock(
  warehouseId: string,
  productId: string,
  quantity: number,
  reserved: number = 0
) {
  const stock = await prisma.warehouse_stock.upsert({
    where: {
      warehouseId_productId: {
        warehouseId,
        productId,
      },
    },
    update: {
      quantity,
      reserved,
    },
    create: {
      warehouseId,
      productId,
      quantity,
      reserved,
    },
  });

  logger.info("Warehouse stock updated / Anbar stoku yeniləndi", {
    warehouseId,
    productId,
    quantity,
    reserved,
  });

  return stock;
}

/**
 * Select best warehouse for order fulfillment / Sifarişin yerinə yetirilməsi üçün ən yaxşı anbarı seç
 */
export async function selectBestWarehouse(
  productId: string,
  quantity: number,
  shippingAddress?: { city: string; state: string; country: string }
): Promise<string | null> {
  // Get stock across all warehouses / Bütün anbarlardakı stoku al
  const stockInfo = await getProductStockAcrossWarehouses(productId);

  // Filter warehouses with sufficient stock / Kifayət qədər stoku olan anbarları filtrlə
  const availableWarehouses = stockInfo.filter((s) => s.available >= quantity);

  if (availableWarehouses.length === 0) {
    return null; // No warehouse has sufficient stock / Heç bir anbarda kifayət qədər stok yoxdur
  }

  // If shipping address provided, prefer warehouses in same city/state / Əgər çatdırılma ünvanı verilibsə, eyni şəhər/rayondakı anbarları üstün tut
  if (shippingAddress) {
    const localWarehouses = availableWarehouses.filter((s) => {
      // This is simplified - in production, use proper distance calculation
      // Bu sadələşdirilmişdir - production-da düzgün məsafə hesablaması istifadə edin
      return true; // Placeholder / Placeholder
    });

    if (localWarehouses.length > 0) {
      // Return warehouse with most available stock / Ən çox mövcud stoku olan anbarı qaytar
      return localWarehouses.sort((a, b) => b.available - a.available)[0].warehouseId;
    }
  }

  // Return warehouse with most available stock / Ən çox mövcud stoku olan anbarı qaytar
  return availableWarehouses.sort((a, b) => b.available - a.available)[0].warehouseId;
}

