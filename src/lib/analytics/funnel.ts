/**
 * Conversion Funnel Service / Konversiya Funnel Xidməti
 * Calculates conversion funnel metrics from user journey data
 * İstifadəçi səyahət məlumatlarından konversiya funnel metrikalarını hesablayır
 */

import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db';

/**
 * Funnel stage / Funnel mərhələsi
 */
export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

/**
 * Conversion funnel data / Konversiya funnel məlumatları
 */
export interface ConversionFunnel {
  stages: FunnelStage[];
  totalVisitors: number;
  totalConversions: number;
  overallConversionRate: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Calculate conversion funnel / Konversiya funnel hesabla
 */
export async function calculateConversionFunnel(
  startDate: Date,
  endDate: Date
): Promise<ConversionFunnel> {
  try {
    // Stage 1: Visitors (users who visited) / Ziyarətçilər (ziyarət edən istifadəçilər)
    // Note: Using createdAt as lastLoginAt field doesn't exist in schema
    // Qeyd: lastLoginAt field-i schema-da yoxdur, ona görə createdAt istifadə edirik
    const visitors = await prisma.users.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Stage 2: Product Views (users who viewed products) / Məhsul Baxışları (məhsul baxan istifadəçilər)
    // Note: This is simplified. In production, track actual product views
    // Qeyd: Bu sadələşdirilmişdir. Production-da faktiki məhsul baxışlarını izləyin
    // Get order IDs in date range first / Əvvəlcə tarix aralığındakı sifariş ID-lərini al
    const ordersInRange = await prisma.orders.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { id: true },
    });
    const orderIds = ordersInRange.map(o => o.id);
    const productViews = await prisma.order_items.count({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });

    // Stage 3: Add to Cart (users who added items to cart) / Səbətə Əlavə (səbətə məhsul əlavə edən istifadəçilər)
    // Note: This is simplified. In production, track actual cart additions
    // Qeyd: Bu sadələşdirilmişdir. Production-da faktiki səbətə əlavələri izləyin
    const addToCarts = await prisma.cart_items.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Stage 4: Checkout Started (users who started checkout) / Checkout Başladı (checkout başlatan istifadəçilər)
    const checkoutStarted = await prisma.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Stage 5: Purchase Completed (users who completed purchase) / Alış Tamamlandı (alışı tamamlayan istifadəçilər)
    const purchasesCompleted = await prisma.orders.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const stages: FunnelStage[] = [
      {
        name: 'Visitors',
        count: visitors,
        percentage: 100,
        dropOffRate: 0,
      },
      {
        name: 'Product Views',
        count: productViews,
        percentage: visitors > 0 ? (productViews / visitors) * 100 : 0,
        dropOffRate: visitors > 0 ? ((visitors - productViews) / visitors) * 100 : 0,
      },
      {
        name: 'Add to Cart',
        count: addToCarts,
        percentage: productViews > 0 ? (addToCarts / productViews) * 100 : 0,
        dropOffRate: productViews > 0 ? ((productViews - addToCarts) / productViews) * 100 : 0,
      },
      {
        name: 'Checkout Started',
        count: checkoutStarted,
        percentage: addToCarts > 0 ? (checkoutStarted / addToCarts) * 100 : 0,
        dropOffRate: addToCarts > 0 ? ((addToCarts - checkoutStarted) / addToCarts) * 100 : 0,
      },
      {
        name: 'Purchase Completed',
        count: purchasesCompleted,
        percentage: checkoutStarted > 0 ? (purchasesCompleted / checkoutStarted) * 100 : 0,
        dropOffRate: checkoutStarted > 0 ? ((checkoutStarted - purchasesCompleted) / checkoutStarted) * 100 : 0,
      },
    ];

    const overallConversionRate = visitors > 0 
      ? (purchasesCompleted / visitors) * 100 
      : 0;

    return {
      stages,
      totalVisitors: visitors,
      totalConversions: purchasesCompleted,
      overallConversionRate: Math.round(overallConversionRate * 100) / 100,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to calculate conversion funnel / Konversiya funnel hesablamaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

