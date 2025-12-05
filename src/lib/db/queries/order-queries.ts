/**
 * Order Query Helpers / Sifariş Sorğu Köməkçiləri
 * Reusable Prisma queries for orders
 * Sifarişlər üçün təkrar istifadə olunan Prisma sorğuları
 */

import { getReadClient } from "@/lib/db/query-client";
import { orderIncludeBasic, orderIncludeDetailed } from "@/lib/db/selectors";
import { notFoundResponse } from "@/lib/api/response";
import { NextResponse } from "next/server";

/**
 * Get order details for email notification / Email bildirişi üçün sifariş təfərrüatlarını al
 * Uses eager loading to include all necessary relations / Bütün lazımi relation-ları include etmək üçün eager loading istifadə edir
 */
export async function getOrderDetailsForEmail(orderId: string) {
  const readClient = await getReadClient();
  return await readClient.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Get order with basic includes / Əsas include-larla sifarişi al
 */
export async function getOrderWithBasic(orderId: string): Promise<any | null> {
  const readClient = await getReadClient();
  const order = await readClient.order.findUnique({
    where: { id: orderId },
    include: orderIncludeBasic,
  });

  return order;
}

/**
 * Get order with detailed includes / Ətraflı include-larla sifarişi al
 */
export async function getOrderWithDetailed(orderId: string): Promise<any | NextResponse> {
  const readClient = await getReadClient();
  const order = await readClient.order.findUnique({
    where: { id: orderId },
    include: orderIncludeDetailed,
  });

  if (!order) {
    return notFoundResponse("Order");
  }

  return order;
}

/**
 * Get order for tracking / İzləmə üçün sifarişi al
 */
export async function getOrderForTracking(
  orderId?: string,
  trackingNumber?: string,
  orderNumber?: string
) {
  // Build where clause / Where şərtini qur
  const where: any = {};
  
  if (orderId) {
    where.id = orderId;
  } else if (orderNumber) {
    // Order number format: YUSU-YYYY-XXX (last 8 chars of ID)
    // Sifariş nömrəsi formatı: YUSU-YYYY-XXX (ID-nin son 8 simvolu)
    const idSuffix = orderNumber.replace("YUSU-", "").replace(/-/g, "");
    if (idSuffix.length >= 8) {
      where.id = {
        endsWith: idSuffix.slice(-8),
      };
    } else {
      return null;
    }
  } else if (trackingNumber) {
    // For now, use tracking number as order ID suffix
    // İndilik, izləmə nömrəsini sifariş ID sonluğu kimi istifadə et
    where.id = {
      contains: trackingNumber,
    };
  } else {
    return null;
  }

  // Get order with all relations using eager loading / Eager loading istifadə edərək bütün əlaqələrlə sifarişi əldə et
  const readClient = await getReadClient();
  const order = await readClient.order.findFirst({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      seller: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      courier: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              description: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return order;
}

