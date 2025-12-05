/**
 * Stock Forecasting Service / Stok Proqnozlaşdırma Xidməti
 * Business logic for stock forecasting
 * Stok proqnozlaşdırma üçün business logic
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

export interface StockForecast {
  productId: string;
  productName: string;
  currentStock: number;
  averageDailySales: number;
  forecastedSalesNext30Days: number;
  reorderPoint: number;
  safetyStock: number;
  recommendedOrderQuantity: number;
  daysUntilStockout: number;
  urgency: "low" | "medium" | "high" | "critical";
}

/**
 * Calculate average daily sales for a product / Məhsul üçün orta günlük satışı hesabla
 */
async function calculateAverageDailySales(productId: string, days: number = 90): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get completed orders with this product / Bu məhsulla tamamlanmış sifarişləri al
  const orderItems = await prisma.order_items.findMany({
    where: {
      productId,
      order: {
        status: {
          in: ["DELIVERED", "CONFIRMED"],
        },
        createdAt: {
          gte: startDate,
        },
      },
    },
    select: {
      quantity: true,
      order: {
        select: {
          createdAt: true,
        },
      },
    },
  });

  if (orderItems.length === 0) {
    return 0;
  }

  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const averageDailySales = totalQuantity / days;

  return averageDailySales;
}

/**
 * Calculate reorder point / Yenidən sifariş nöqtəsini hesabla
 */
function calculateReorderPoint(averageDailySales: number, leadTimeDays: number, safetyStock: number): number {
  // Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock
  // Yenidən sifariş nöqtəsi = (Orta günlük satış × Çatdırılma müddəti) + Təhlükəsizlik stoku
  return Math.ceil(averageDailySales * leadTimeDays + safetyStock);
}

/**
 * Calculate safety stock / Təhlükəsizlik stokunu hesabla
 */
function calculateSafetyStock(averageDailySales: number, days: number = 7): number {
  // Safety Stock = Average Daily Sales × Days of Safety Buffer
  // Təhlükəsizlik stoku = Orta günlük satış × Təhlükəsizlik buffer günləri
  return Math.ceil(averageDailySales * days);
}

/**
 * Calculate recommended order quantity / Tövsiyə olunan sifariş miqdarını hesabla
 */
function calculateRecommendedOrderQuantity(
  averageDailySales: number,
  currentStock: number,
  reorderPoint: number,
  days: number = 30
): number {
  // Recommended Order Quantity = (Average Daily Sales × Days) - Current Stock + Safety Stock
  // Tövsiyə olunan sifariş miqdarı = (Orta günlük satış × Günlər) - Hazırkı stok + Təhlükəsizlik stoku
  const forecastedNeed = averageDailySales * days;
  const recommended = Math.max(0, Math.ceil(forecastedNeed - currentStock + (reorderPoint - forecastedNeed)));

  return recommended;
}

/**
 * Calculate days until stockout / Stok bitməyə qədər olan günləri hesabla
 */
function calculateDaysUntilStockout(currentStock: number, averageDailySales: number): number {
  if (averageDailySales === 0) {
    return Infinity; // No sales, stock will not deplete / Satış yoxdur, stok tükənməyəcək
  }

  return Math.floor(currentStock / averageDailySales);
}

/**
 * Determine urgency level / Təciliyyət səviyyəsini müəyyənləşdir
 */
function determineUrgency(daysUntilStockout: number, reorderPoint: number, currentStock: number): "low" | "medium" | "high" | "critical" {
  if (currentStock <= 0) {
    return "critical";
  }

  if (daysUntilStockout <= 3) {
    return "critical";
  }

  if (daysUntilStockout <= 7) {
    return "high";
  }

  if (currentStock <= reorderPoint) {
    return "medium";
  }

  return "low";
}

/**
 * Get stock forecast for a product / Məhsul üçün stok proqnozunu al
 */
export async function getProductForecast(
  productId: string,
  leadTimeDays: number = 7
): Promise<StockForecast | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      stock: true,
    },
  });

  if (!product) {
    return null;
  }

  const averageDailySales = await calculateAverageDailySales(productId);
  const safetyStock = calculateSafetyStock(averageDailySales);
  const reorderPoint = calculateReorderPoint(averageDailySales, leadTimeDays, safetyStock);
  const forecastedSalesNext30Days = averageDailySales * 30;
  const recommendedOrderQuantity = calculateRecommendedOrderQuantity(
    averageDailySales,
    product.stock,
    reorderPoint
  );
  const daysUntilStockout = calculateDaysUntilStockout(product.stock, averageDailySales);
  const urgency = determineUrgency(daysUntilStockout, reorderPoint, product.stock);

  return {
    productId: product.id,
    productName: product.name,
    currentStock: product.stock,
    averageDailySales,
    forecastedSalesNext30Days,
    reorderPoint,
    safetyStock,
    recommendedOrderQuantity,
    daysUntilStockout: daysUntilStockout === Infinity ? -1 : daysUntilStockout,
    urgency,
  };
}

/**
 * Get stock forecasts for all products / Bütün məhsullar üçün stok proqnozlarını al
 */
export async function getAllProductForecasts(leadTimeDays: number = 7): Promise<StockForecast[]> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      isPublished: true,
      isApproved: true,
    },
    select: {
      id: true,
      name: true,
      stock: true,
    },
  });

  const forecasts: StockForecast[] = [];

  for (const product of products) {
    const forecast = await getProductForecast(product.id, leadTimeDays);
    if (forecast) {
      forecasts.push(forecast);
    }
  }

  // Sort by urgency (critical first) / Təciliyyətə görə sırala (kritik birinci)
  const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  forecasts.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return forecasts;
}

/**
 * Get low stock alerts / Aşağı stok xəbərdarlıqlarını al
 */
export async function getLowStockAlerts(threshold?: number): Promise<StockForecast[]> {
  const forecasts = await getAllProductForecasts();
  
  if (threshold !== undefined) {
    return forecasts.filter((f) => f.currentStock <= threshold);
  }

  // Default: products below reorder point / Default: yenidən sifariş nöqtəsindən aşağı məhsullar
  return forecasts.filter((f) => f.currentStock <= f.reorderPoint);
}

