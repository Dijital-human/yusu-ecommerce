/**
 * Category Details API Route / Kateqoriya Detalları API Route
 * This route handles fetching detailed information about a specific category
 * Bu route müəyyən kateqoriya haqqında ətraflı məlumat almağı idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    // Fetch category with product count / Məhsul sayı ilə kateqoriyanı al
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
        isActive: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found / Kateqoriya tapılmadı" },
        { status: 404 }
      );
    }

    // Get product count for this category / Bu kateqoriya üçün məhsul sayını al
    const productCount = await prisma.product.count({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
    });

    // Get price range for this category / Bu kateqoriya üçün qiymət aralığını al
    const priceStats = await prisma.product.aggregate({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    // Format response / Cavabı formatla
    const response = {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount,
      isActive: category.isActive,
      parentId: category.parentId,
      minPrice: priceStats._min.price ? Number(priceStats._min.price) : 0,
      maxPrice: priceStats._max.price ? Number(priceStats._max.price) : 1000,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}
