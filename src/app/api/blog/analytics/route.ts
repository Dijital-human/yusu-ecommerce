/**
 * Blog Analytics API Route / Blog Analitika API Route
 * Gets blog analytics data / Blog analitika məlumatlarını alır
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getReadClient } from "@/lib/db/query-client";

/**
 * GET /api/blog/analytics
 * Get blog analytics / Blog analitikasını al
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

    const readClient = await getReadClient();

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [totalPosts, publishedPosts, totalViews, totalSharesResult, popularPosts] =
      await Promise.all([
        readClient.blogPost.count(),
        readClient.blogPost.count({
          where: { isPublished: true },
        }),
        readClient.blogView.count({ where }),
        readClient.blogPost.aggregate({
          _sum: {
            shareCount: true,
          },
        }),
        readClient.blogPost.findMany({
          where: {
            isPublished: true,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
            category: true,
            analytics: true,
          },
          orderBy: [
            { viewCount: "desc" },
            { shareCount: "desc" },
          ],
          take: 10,
        }),
      ]);

    return successResponse({
      totalPosts,
      publishedPosts,
      totalViews,
      totalShares: totalSharesResult._sum.shareCount || 0,
      popularPosts,
    });
  } catch (error) {
    return handleApiError(error, "get blog analytics");
  }
}

