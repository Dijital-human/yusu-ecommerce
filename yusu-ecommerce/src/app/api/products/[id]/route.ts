/**
 * Product Details API Route / Məhsul Detalları API Route
 * This route handles fetching detailed information about a specific product
 * Bu route müəyyən məhsul haqqında ətraflı məlumat almağı idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.id;

    // Fetch product with related data / Əlaqəli məlumatlarla məhsulu al
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
      include: {
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
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    // Calculate average rating / Orta reytinqi hesabla
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    // Format response / Cavabı formatla
    const response = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      images: product.images || [],
      category: product.category,
      seller: product.seller,
      stock: product.stock,
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: product.reviews.length,
      isActive: product.isActive,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}