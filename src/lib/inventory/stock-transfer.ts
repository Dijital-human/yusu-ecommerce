/**
 * Stock Transfer Service / Stok Transferi Xidməti
 * Business logic for stock transfer operations between warehouses
 * Anbarlar arasında stok transferi əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { updateWarehouseStock, getProductStockInWarehouse } from "./warehouse";

export interface CreateStockTransferData {
  fromWarehouseId: string;
  toWarehouseId: string;
  productId: string;
  quantity: number;
  notes?: string;
}

/**
 * Create stock transfer / Stok transferi yarat
 */
export async function createStockTransfer(data: CreateStockTransferData) {
  // Validate warehouses are different / Anbarların fərqli olduğunu yoxla
  if (data.fromWarehouseId === data.toWarehouseId) {
    throw new Error("Source and destination warehouses must be different / Mənbə və təyinat anbarları fərqli olmalıdır");
  }

  // Check source warehouse stock / Mənbə anbar stokunu yoxla
  const sourceStock = await getProductStockInWarehouse(data.productId, data.fromWarehouseId);
  if (!sourceStock || sourceStock.quantity - sourceStock.reserved < data.quantity) {
    throw new Error(
      `Insufficient stock in source warehouse / Mənbə anbarda kifayət qədər stok yoxdur. Available: ${sourceStock ? sourceStock.quantity - sourceStock.reserved : 0}`
    );
  }

  // Create transfer record / Transfer qeydi yarat
  const transfer = await (prisma as any).stock_transfers.create({
    data: {
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      productId: data.productId,
      quantity: data.quantity,
      status: "PENDING",
      notes: data.notes,
    },
  });

  logger.info("Stock transfer created / Stok transferi yaradıldı", {
    transferId: transfer.id,
    fromWarehouseId: data.fromWarehouseId,
    toWarehouseId: data.toWarehouseId,
    productId: data.productId,
    quantity: data.quantity,
  });

  return transfer;
}

/**
 * Approve stock transfer / Stok transferini təsdiqlə
 */
export async function approveStockTransfer(transferId: string) {
  const transfer = await (prisma as any).stock_transfers.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error("Stock transfer not found / Stok transferi tapılmadı");
  }

  if (transfer.status !== "PENDING") {
    throw new Error(`Transfer cannot be approved. Current status: ${transfer.status} / Transfer təsdiqlənə bilməz. Hazırkı status: ${transfer.status}`);
  }

  // Check source stock again / Mənbə stokunu yenidən yoxla
  const sourceStock = await getProductStockInWarehouse(transfer.productId, transfer.fromWarehouseId);
  if (!sourceStock || sourceStock.quantity - sourceStock.reserved < transfer.quantity) {
    throw new Error("Insufficient stock in source warehouse / Mənbə anbarda kifayət qədər stok yoxdur");
  }

  // Update stock in source warehouse / Mənbə anbardakı stoku yenilə
  await updateWarehouseStock(
    transfer.fromWarehouseId,
    transfer.productId,
    sourceStock.quantity - transfer.quantity,
    sourceStock.reserved
  );

  // Update stock in destination warehouse / Təyinat anbardakı stoku yenilə
  const destStock = await getProductStockInWarehouse(transfer.productId, transfer.toWarehouseId);
  await updateWarehouseStock(
    transfer.toWarehouseId,
    transfer.productId,
    (destStock?.quantity || 0) + transfer.quantity,
    destStock?.reserved || 0
  );

  // Update transfer status / Transfer statusunu yenilə
  const updated = await (prisma as any).stock_transfers.update({
    where: { id: transferId },
    data: {
      status: "APPROVED",
      transferDate: new Date(),
    },
  });

  logger.info("Stock transfer approved / Stok transferi təsdiqləndi", {
    transferId,
    fromWarehouseId: transfer.fromWarehouseId,
    toWarehouseId: transfer.toWarehouseId,
  });

  return updated;
}

/**
 * Complete stock transfer / Stok transferini tamamla
 */
export async function completeStockTransfer(transferId: string) {
  const transfer = await (prisma as any).stock_transfers.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error("Stock transfer not found / Stok transferi tapılmadı");
  }

  if (transfer.status !== "APPROVED" && transfer.status !== "IN_TRANSIT") {
    throw new Error(`Transfer cannot be completed. Current status: ${transfer.status} / Transfer tamamlanə bilməz. Hazırkı status: ${transfer.status}`);
  }

  const updated = await (prisma as any).stock_transfers.update({
    where: { id: transferId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  logger.info("Stock transfer completed / Stok transferi tamamlandı", { transferId });
  return updated;
}

/**
 * Cancel stock transfer / Stok transferini ləğv et
 */
export async function cancelStockTransfer(transferId: string) {
  const transfer = await (prisma as any).stock_transfers.findUnique({
    where: { id: transferId },
  });

  if (!transfer) {
    throw new Error("Stock transfer not found / Stok transferi tapılmadı");
  }

  if (transfer.status === "COMPLETED") {
    throw new Error("Cannot cancel completed transfer / Tamamlanmış transferi ləğv edə bilməzsiniz");
  }

  const updated = await (prisma as any).stock_transfers.update({
    where: { id: transferId },
    data: {
      status: "CANCELLED",
    },
  });

  logger.info("Stock transfer cancelled / Stok transferi ləğv edildi", { transferId });
  return updated;
}

/**
 * Get stock transfers / Stok transferlərini al
 */
export async function getStockTransfers(filters?: {
  fromWarehouseId?: string;
  toWarehouseId?: string;
  productId?: string;
  status?: string;
}) {
  const where: any = {};

  if (filters?.fromWarehouseId) {
    where.fromWarehouseId = filters.fromWarehouseId;
  }

  if (filters?.toWarehouseId) {
    where.toWarehouseId = filters.toWarehouseId;
  }

  if (filters?.productId) {
    where.productId = filters.productId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  const transfers = await (prisma as any).stock_transfers.findMany({
    where,
    include: {
      fromWarehouse: true,
      toWarehouse: true,
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return transfers;
}

