/**
 * Products API Route / Məhsullar API Route-u
 * This file handles CRUD operations for products
 * Bu fayl məhsullar üçün CRUD əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/products - Get all products / Bütün məhsulları əldə et
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const skip = (page - 1) * limit;

    // Build where clause / Where şərtini qur
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Build orderBy clause / OrderBy şərtini qur
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Get products with pagination / Səhifələmə ilə məhsulları əldə et
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product / Hər məhsul üçün orta reytinqi hesabla
    const productsWithRating = products.map((product) => {
      const avgRating = product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0;

      return {
        ...product,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined, // Remove reviews array from response / Cavabdan reviews massivini çıxar
      };
    });

    return NextResponse.json({
      success: true,
      data: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products / Məhsulları əldə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product / Yeni məhsul yarat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    // Check if user is seller or admin / İstifadəçinin satıcı və ya admin olduğunu yoxla
    if (!["SELLER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: "Only sellers can create products / Yalnız satıcılar məhsul yarada bilər" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      images,
      categoryId,
      stock,
    } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields / Tələb olunan sahələr çatışmır" },
        { status: 400 }
      );
    }

    // Check if category exists / Kateqoriyanın mövcud olduğunu yoxla
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found / Kateqoriya tapılmadı" },
        { status: 404 }
      );
    }

    // Create product / Məhsul yarat
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        images: images || "",
        categoryId,
        sellerId: session.user.id,
        stock: parseInt(stock) || 0,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product created successfully / Məhsul uğurla yaradıldı",
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product / Məhsul yaratmaq uğursuz" },
      { status: 500 }
    );
  }
}
