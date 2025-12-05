/**
 * Admin Search History Analytics API Route / Admin Axtarış Tarixçəsi Analitika API Route-u
 * Provides search history analytics for admin panel
 * Admin panel üçün axtarış tarixçəsi analitikası təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { prisma } from "@/lib/db";
import { parsePagination, createPaginationInfo } from "@/lib/api/pagination";

/**
 * GET /api/admin/analytics/search-history - Get search history analytics / Axtarış tarixçəsi analitikasını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 50);
    
    // Date range filtering / Tarix aralığı filtrləməsi
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const userId = searchParams.get("userId");
    const query = searchParams.get("query");

    // Build where clause / Where şərtini qur
    const where: any = {};
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    if (userId) {
      where.userId = userId;
    }

    if (query) {
      where.query = {
        contains: query,
        mode: 'insensitive',
      };
    }

    // Get search history with pagination / Səhifələmə ilə axtarış tarixçəsini al
    const [history, total] = await Promise.all([
      prisma.search_history.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.search_history.count({ where }),
    ]);

    // Get statistics / Statistika al
    const totalSearches = await prisma.search_history.count();
    const uniqueUsers = await prisma.search_history.groupBy({
      by: ['userId'],
      where: startDate || endDate ? {
        timestamp: where.timestamp,
      } : undefined,
    });

    // Get popular queries / Populyar sorğuları al
    const popularQueries = await prisma.search_history.groupBy({
      by: ['query'],
      where,
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: 'desc',
        },
      },
      take: 10,
    });

    const pagination = createPaginationInfo(page, limit, total);

    return successResponse({
      history: history.map(item => ({
        id: item.id,
        userId: item.userId,
        user: item.user,
        query: item.query,
        resultsCount: item.resultsCount,
        filters: item.filters,
        timestamp: item.timestamp,
      })),
      pagination,
      statistics: {
        totalSearches,
        uniqueUsers: uniqueUsers.length,
        popularQueries: popularQueries.map(q => ({
          query: q.query,
          count: q._count.query,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error, "get search history analytics");
  }
}

