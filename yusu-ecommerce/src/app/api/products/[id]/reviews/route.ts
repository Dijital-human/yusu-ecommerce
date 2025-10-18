/**
 * Product Reviews API Route / Məhsul Rəyləri API Route
 * This route handles fetching reviews for a specific product
 * Bu route müəyyən məhsul üçün rəyləri almağı idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Check if product exists / Məhsulun mövcudluğunu yoxla
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    // Fetch reviews with pagination / Səhifələmə ilə rəyləri al
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId: productId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          productId: productId,
        },
      }),
    ]);

    // Calculate pagination info / Səhifələmə məlumatını hesabla
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}
