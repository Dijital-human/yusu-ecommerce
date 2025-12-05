/**
 * Orders API Route v1 / Sifarişlər API Route-u v1
 * This file handles order operations with filters and search / Filtrlər və axtarış ilə sifariş əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, badRequestResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { getReadClient } from '@/lib/db/query-client';
import { orderIncludeBasic } from '@/lib/db/selectors';

/**
 * GET /api/v1/orders
 * Get user orders with filters and search / Filtrlər və axtarış ilə istifadəçi sifarişlərini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);

    // Parse query parameters / Query parametrlərini parse et
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const productName = searchParams.get('productName');
    const sellerName = searchParams.get('sellerName');
    const search = searchParams.get('search'); // General search / Ümumi axtarış
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const role = searchParams.get('role'); // customer, seller, courier

    // Build where clause / Where şərtini qur
    const where: any = {};

    // Role-based filtering / Rol əsaslı filtr
    if (role === 'customer' || user.role === 'CUSTOMER') {
      where.customerId = user.id;
    } else if (role === 'seller' || user.role === 'SELLER') {
      where.sellerId = user.id;
    } else if (role === 'courier' || user.role === 'COURIER') {
      where.courierId = user.id;
    } else if (user.role === 'ADMIN') {
      // Admin can see all orders / Admin bütün sifarişləri görə bilər
    } else {
      // Default to customer orders / Default olaraq müştəri sifarişləri
      where.customerId = user.id;
    }

    // Status filter / Status filtr
    if (status) {
      where.status = status;
    }

    // Date range filter / Tarix aralığı filtr
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    // Price range filter / Qiymət aralığı filtr
    if (minPrice || maxPrice) {
      where.totalAmount = {};
      if (minPrice) {
        where.totalAmount.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.totalAmount.lte = parseFloat(maxPrice);
      }
    }

    // Product name filter / Məhsul adı filtr
    if (productName) {
      where.items = {
        some: {
          product: {
            name: {
              contains: productName,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    // Seller name filter / Satıcı adı filtr
    if (sellerName) {
      where.seller = {
        name: {
          contains: sellerName,
          mode: 'insensitive',
        },
      };
    }

    // General search (order ID, product name, seller name) / Ümumi axtarış (sifariş ID, məhsul adı, satıcı adı)
    if (search) {
      where.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        {
          items: {
            some: {
              product: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        },
        {
          seller: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Build orderBy clause / OrderBy şərtini qur
    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.totalAmount = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Execute query / Sorğunu icra et
    const readClient = await getReadClient();
    const [orders, total] = await Promise.all([
      readClient.order.findMany({
        where,
        include: orderIncludeBasic,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      readClient.order.count({ where }),
    ]);

    return successResponse({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error, 'get orders');
  }
}
