/**
 * Category Products API Route / Kateqoriya Məhsulları API Route
 * This route handles fetching products within a specific category
 * Bu route müəyyən kateqoriya daxilindəki məhsulları almağı idarə edir
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
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters / Sorğu parametrlərini parse et
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const search = searchParams.get("search") || "";
    
    const skip = (page - 1) * limit;

    // Check if category exists / Kateqoriyanın mövcudluğunu yoxla
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

    // Build where clause / Where şərtini qur
    const whereClause: any = {
      categoryId: categoryId,
      isActive: true,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    // Add search filter if provided / Axtarış filtri əlavə et
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    // Build orderBy clause / OrderBy şərtini qur
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
        orderBy = { name: sortOrder };
        break;
      case "price":
        orderBy = { price: sortOrder };
        break;
      case "rating":
        // For rating, we'll need to calculate average rating
        // Reytinq üçün orta reytinqi hesablamalıyıq
        orderBy = { createdAt: "desc" }; // Fallback to creation date
        break;
      case "createdAt":
      default:
        orderBy = { createdAt: sortOrder };
        break;
    }

    // Fetch products with pagination / Səhifələmə ilə məhsulları al
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
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
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({
        where: whereClause,
      }),
    ]);

    // Calculate average rating for each product / Hər məhsul üçün orta reytinqi hesabla
    const productsWithRating = products.map(product => {
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review: { rating: number }) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
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
    });

    // Sort by rating if requested / Reytinqə görə sırala
    if (sortBy === "rating") {
      productsWithRating.sort((a, b) => {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      });
    }

    // Calculate pagination info / Səhifələmə məlumatını hesabla
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products: productsWithRating,
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
    console.error("Error fetching category products:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}
