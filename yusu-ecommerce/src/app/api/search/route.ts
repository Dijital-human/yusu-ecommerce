/**
 * Search API Route / Axtarış API Route
 * This route handles product search functionality
 * Bu route məhsul axtarış funksiyasını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters / Sorğu parametrlərini parse et
    const query = searchParams.get("q") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "relevance";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "1000000");
    const rating = parseFloat(searchParams.get("rating") || "0");
    const inStock = searchParams.get("inStock") === "true";
    
    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const whereClause: any = {
      isActive: true,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    // Add search query filter / Axtarış sorğusu filtri əlavə et
    if (query) {
      whereClause.OR = [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Add category filter / Kateqoriya filtri əlavə et
    if (category) {
      whereClause.categoryId = category;
    }

    // Add stock filter / Stok filtri əlavə et
    if (inStock) {
      whereClause.stock = {
        gt: 0,
      };
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
        // For rating, we'll sort by creation date and then calculate rating
        // Reytinq üçün yaradılma tarixinə görə sıralayacağıq, sonra reytinqi hesablayacağıq
        orderBy = { createdAt: "desc" };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder };
        break;
      case "relevance":
      default:
        // For relevance, we'll use a combination of factors
        // Uyğunluq üçün amillərin birləşməsini istifadə edəcəyik
        orderBy = { createdAt: "desc" };
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
    let productsWithRating = products.map(product => {
      const averageRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
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

    // Apply rating filter / Reytinq filtri tətbiq et
    if (rating > 0) {
      productsWithRating = productsWithRating.filter(product => product.rating >= rating);
    }

    // Sort by rating if requested / Reytinqə görə sırala
    if (sortBy === "rating") {
      productsWithRating.sort((a, b) => {
        return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
      });
    }

    // Sort by relevance if requested / Uyğunluğa görə sırala
    if (sortBy === "relevance" && query) {
      productsWithRating.sort((a, b) => {
        // Simple relevance scoring based on name and description matches
        // Ad və təsvir uyğunluqlarına əsaslanan sadə uyğunluq hesablaması
        const scoreA = calculateRelevanceScore(a, query);
        const scoreB = calculateRelevanceScore(b, query);
        return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
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
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}

/**
 * Calculate relevance score for a product based on search query
 * Axtarış sorğusuna əsaslanaraq məhsul üçün uyğunluq balı hesabla
 */
function calculateRelevanceScore(product: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Name match (highest priority) / Ad uyğunluğu (ən yüksək prioritet)
  if (product.name.toLowerCase().includes(queryLower)) {
    score += 10;
  }

  // Description match / Təsvir uyğunluğu
  if (product.description.toLowerCase().includes(queryLower)) {
    score += 5;
  }

  // Category match / Kateqoriya uyğunluğu
  if (product.category.name.toLowerCase().includes(queryLower)) {
    score += 3;
  }

  // Rating bonus / Reytinq bonusu
  score += product.rating * 0.5;

  // Review count bonus / Rəy sayı bonusu
  score += Math.min(product.reviewCount * 0.1, 2);

  return score;
}
