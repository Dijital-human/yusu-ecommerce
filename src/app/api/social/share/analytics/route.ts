/**
 * Social Share Analytics API Route / Sosial Paylaşım Analitika API Route
 * Get social sharing analytics / Sosial paylaşım analitikasını al
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient } from "@/lib/db/query-client";

/**
 * GET /api/social/share/analytics
 * Get social sharing analytics / Sosial paylaşım analitikasını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only admins can view analytics / Yalnız adminlər analitikaya baxa bilər
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;
    const platform = searchParams.get("platform") || undefined;

    const readClient = await getReadClient();

    const where: any = {};
    if (startDate || endDate) {
      where.lastSharedAt = {};
      if (startDate) {
        where.lastSharedAt.gte = startDate;
      }
      if (endDate) {
        where.lastSharedAt.lte = endDate;
      }
    }
    if (platform) {
      where.platform = platform;
    }

    const [totalShares, platformStats, topProducts, recentShares] = await Promise.all([
      readClient.socialShare.aggregate({
        where,
        _sum: {
          shareCount: true,
        },
      }),
      readClient.socialShare.groupBy({
        by: ["platform"],
        where,
        _sum: {
          shareCount: true,
        },
        _count: {
          productId: true,
        },
      }),
      readClient.socialShare.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
            },
          },
        },
        orderBy: {
          shareCount: "desc",
        },
        take: 10,
      }),
      readClient.socialShare.findMany({
        where,
        orderBy: {
          lastSharedAt: "desc",
        },
        take: 20,
      }),
    ]);

    return successResponse({
      totalShares: totalShares._sum.shareCount || 0,
      platformStats: platformStats.map((stat) => ({
        platform: stat.platform,
        totalShares: stat._sum.shareCount || 0,
        productCount: stat._count.productId,
      })),
      topProducts,
      recentShares,
    });
  } catch (error) {
    return handleApiError(error, "get social share analytics");
  }
}

