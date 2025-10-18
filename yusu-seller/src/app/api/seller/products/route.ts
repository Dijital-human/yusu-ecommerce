import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

// GET /api/seller/products - Get seller's products / Satıcının məhsullarını al
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a seller
    // İstifadəçinin giriş edib-edmədiyini və satıcı olub-olmadığını yoxla
    if (!session || session.user?.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get seller's products with category information
    // Satıcının məhsullarını kateqoriya məlumatları ilə al
    const products = await prisma.product.findMany({
      where: {
        sellerId: session.user.id,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    // Səhifələmə üçün ümumi sayı al
    const totalCount = await prisma.product.count({
      where: {
        sellerId: session.user.id,
        isActive: true,
      },
    });

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}

// POST /api/seller/products - Create new product / Yeni məhsul yarat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is a seller
    // İstifadəçinin giriş edib-edmədiyini və satıcı olub-olmadığını yoxla
    if (!session || session.user?.role !== "SELLER") {
      return NextResponse.json(
        { error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      images = [],
    } = body;

    // Validate required fields
    // Tələb olunan sahələri yoxla
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields / Tələb olunan sahələr çatışmır" },
        { status: 400 }
      );
    }

    // Create new product
    // Yeni məhsul yarat
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        categoryId,
        sellerId: session.user.id,
        images,
        isActive: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      { 
        message: "Product created successfully / Məhsul uğurla yaradıldı",
        product 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}
