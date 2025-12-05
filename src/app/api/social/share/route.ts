/**
 * Social Share API Route / Sosial Paylaşım API Route
 * Track social media shares / Sosial media paylaşımlarını izlə
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { handleApiError, successResponse } from "@/lib/api/response";
import { db } from "@/lib/db";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/social/share
 * Track social media share / Sosial media paylaşımını izlə
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { productId, platform, url } = body;

    if (!productId || !platform || !url) {
      return NextResponse.json(
        { success: false, error: "Missing required fields / Tələb olunan sahələr çatışmır" },
        { status: 400 }
      );
    }

    // Check if share record exists / Paylaşım qeydi mövcuddursa yoxla
    const existingShare = await (db as any).socialShare.findFirst({
      where: {
        productId,
        platform,
      },
    });

    if (existingShare) {
      // Update share count / Paylaşım sayını yenilə
      const updatedShare = await (db as any).socialShare.update({
        where: { id: existingShare.id },
        data: {
          shareCount: {
            increment: 1,
          },
          lastSharedAt: new Date(),
        },
      });

      logger.info("Social share tracked / Sosial paylaşım izlənildi", {
        productId,
        platform,
        userId: user.id,
      });

      return successResponse(updatedShare);
    } else {
      // Create new share record / Yeni paylaşım qeydi yarat
      const newShare = await (db as any).socialShare.create({
        data: {
          productId,
          platform,
          shareCount: 1,
          lastSharedAt: new Date(),
        },
      });

      logger.info("Social share created / Sosial paylaşım yaradıldı", {
        productId,
        platform,
        userId: user.id,
      });

      return successResponse(newShare);
    }
  } catch (error) {
    return handleApiError(error, "track social share");
  }
}

/**
 * GET /api/social/share
 * Get share statistics / Paylaşım statistikalarını al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required / Məhsul ID-si tələb olunur" },
        { status: 400 }
      );
    }

    const shares = await (db as any).socialShare.findMany({
      where: { productId },
      orderBy: { shareCount: "desc" },
    });

    const totalShares = shares.reduce((sum: number, share: any) => sum + share.shareCount, 0);

    return successResponse({
      shares,
      totalShares,
      platformCounts: shares.map((share: any) => ({
        platform: share.platform,
        count: share.shareCount,
      })),
    });
  } catch (error) {
    return handleApiError(error, "get share statistics");
  }
}

