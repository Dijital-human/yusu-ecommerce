/**
 * Seller Products API / Satıcı Məhsulları API
 * GET /api/sellers/[id]/products - Get seller's approved products
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // Pagination params / Səhifələmə parametrləri
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;
    
    // Filter params / Filtr parametrləri
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const search = searchParams.get("search");

    // Check if seller exists / Satıcının mövcud olub-olmadığını yoxla
    const seller = await db.users.findUnique({
      where: { 
        id,
        role: { in: ["SELLER", "SUPER_SELLER"] },
        isApprovedByAdmin: true,
        isActive: true,
      },
      select: { id: true, name: true, storeName: true }
    });

    if (!seller) {
      return NextResponse.json(
        { 
          error: "Seller not found / Satıcı tapılmadı",
          errorAz: "Satıcı tapılmadı"
        },
        { status: 404 }
      );
    }

    // Build where clause / Şərt quruluşu
    const where: any = {
      sellerId: id,
      isApproved: true,
      isPublished: true,
      isActive: true,
    };

    if (category) {
      where.categoryId = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy / Sıralama quruluşu
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else if (sortBy === "rating") {
      orderBy.averageRating = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Get products / Məhsulları al
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          compareAtPrice: true,
          images: true,
          stock: true,
          averageRating: true,
          reviewCount: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where })
    ]);

    // Get categories for filter / Filtr üçün kateqoriyaları al
    const categories = await db.product.groupBy({
      by: ["categoryId"],
      where: {
        sellerId: id,
        isApproved: true,
        isPublished: true,
        isActive: true,
      },
      _count: {
        categoryId: true
      }
    });

    const categoryIds = categories.map(c => c.categoryId).filter(Boolean);
    const categoryDetails = categoryIds.length > 0 ? await db.category.findMany({
      where: { id: { in: categoryIds as string[] } },
      select: { id: true, name: true }
    }) : [];

    // Format products / Məhsulları formatla
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description?.substring(0, 150) + "...",
      price: product.price,
      originalPrice: product.compareAtPrice,
      image: Array.isArray(product.images) 
        ? product.images[0] 
        : typeof product.images === "string" 
          ? product.images.split(",")[0] 
          : "/placeholder.png",
      stock: product.stock,
      rating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
      category: product.category,
      createdAt: product.createdAt,
    }));

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        name: seller.storeName || seller.name,
      },
      products: formattedProducts,
      filters: {
        categories: categoryDetails.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: categories.find(c => c.categoryId === cat.id)?._count.categoryId || 0
        }))
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json(
      { 
        error: "Internal server error / Daxili server xətası",
        errorAz: "Daxili server xətası"
      },
      { status: 500 }
    );
  }
}

