/**
 * Flash Sales Service / Flash Satışlar Xidməti
 * Database operations for flash sales / Flash satışlar üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";

export interface FlashSale {
  id: string;
  title: string;
  description?: string;
  discount: number;
  productIds: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get active flash sales / Aktiv flash satışları al
 */
export async function getActiveFlashSales(limit: number = 20): Promise<FlashSale[]> {
  try {
    const readClient = await getReadClient();
    const now = new Date();
    
    const flashSales = await readClient.flashSale.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      orderBy: {
        startDate: "desc",
      },
      take: limit,
    });

    return flashSales.map((sale) => ({
      id: sale.id,
      title: sale.title,
      description: sale.description || undefined,
      discount: Number(sale.discount),
      productIds: sale.productIds,
      startDate: sale.startDate,
      endDate: sale.endDate,
      isActive: sale.isActive,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching active flash sales:", error);
    throw error;
  }
}

/**
 * Get flash sale by ID / ID ilə flash satışı al
 */
export async function getFlashSaleById(saleId: string): Promise<FlashSale | null> {
  try {
    const readClient = await getReadClient();
    const flashSale = await readClient.flashSale.findUnique({
      where: {
        id: saleId,
      },
    });

    if (!flashSale) {
      return null;
    }

    return {
      id: flashSale.id,
      title: flashSale.title,
      description: flashSale.description || undefined,
      discount: Number(flashSale.discount),
      productIds: flashSale.productIds,
      startDate: flashSale.startDate,
      endDate: flashSale.endDate,
      isActive: flashSale.isActive,
      createdAt: flashSale.createdAt,
      updatedAt: flashSale.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching flash sale:", error);
    throw error;
  }
}

/**
 * Get upcoming flash sales / Gələcək flash satışları al
 */
export async function getUpcomingFlashSales(limit: number = 10): Promise<FlashSale[]> {
  try {
    const readClient = await getReadClient();
    const now = new Date();
    
    const flashSales = await readClient.flashSale.findMany({
      where: {
        isActive: true,
        startDate: {
          gt: now,
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit,
    });

    return flashSales.map((sale) => ({
      id: sale.id,
      title: sale.title,
      description: sale.description || undefined,
      discount: Number(sale.discount),
      productIds: sale.productIds,
      startDate: sale.startDate,
      endDate: sale.endDate,
      isActive: sale.isActive,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching upcoming flash sales:", error);
    throw error;
  }
}

