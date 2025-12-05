/**
 * Admin Customer Detail API Route / Admin Müştəri Detal API Route-u
 * This endpoint provides detailed customer information for admin panel
 * Bu endpoint admin panel üçün ətraflı müştəri məlumatları təmin edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient } from "@/lib/db/query-client";
import { getCartItems } from "@/services/cart.service";
import { getWishlistItems } from "@/services/wishlist.service";
import { getUserOrders } from "@/services/order.service";
import { logger } from "@/lib/utils/logger";

// GET /api/admin/customers/[id] - Get customer details / Müştəri detallarını əldə et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { id: customerId } = await params;

    const prisma = await getReadClient();

    // Get customer basic info / Müştəri əsas məlumatlarını al
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        addresses: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            latitude: true,
            longitude: true,
            isDefault: true,
            createdAt: true,
          },
          orderBy: {
            isDefault: "desc",
          },
        },
        _count: {
          select: {
            orders: true,
            cartItems: true,
            wishlistItems: true,
            reviews: true,
          },
        },
      },
    });

    if (!customer) {
      return notFoundResponse("Customer not found / Müştəri tapılmadı");
    }

    // Get customer cart items / Müştəri səbət elementlərini al
    const cartItems = await getCartItems(customerId);

    // Get customer wishlist items / Müştəri wishlist elementlərini al
    const wishlistItems = await getWishlistItems(customerId);

    // Get customer orders / Müştəri sifarişlərini al
    const { orders } = await getUserOrders(customerId, customer.role, 1, 50);

    // Get recent activity logs / Son aktivlik loglarını al
    const recentActivity = await prisma.auditLog.findMany({
      where: {
        userId: customerId,
      },
      select: {
        id: true,
        action: true,
        resourceType: true,
        resourceId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Get favorite products (most ordered) / Favorit məhsullar (ən çox sifarış verilən)
    const favoriteProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          customerId: customerId,
        },
      },
      _count: {
        productId: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _count: {
          productId: "desc",
        },
      },
      take: 10,
    });

    const favoriteProductIds = favoriteProducts.map((fp: { productId: string }) => fp.productId);
    const favoriteProductsData = favoriteProductIds.length > 0
      ? await prisma.product.findMany({
          where: {
            id: { in: favoriteProductIds },
          },
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
          },
        })
      : [];

    logger.info('Admin fetched customer details / Admin müştəri detallarını əldə etdi', {
      adminId: user.id,
      customerId,
    });

    return successResponse({
      customer,
      cartItems,
      wishlistItems,
      orders,
      recentActivity,
      favoriteProducts: favoriteProductsData,
    });
  } catch (error) {
    return handleApiError(error, "fetch customer details");
  }
}

