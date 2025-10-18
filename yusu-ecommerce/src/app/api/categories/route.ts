/**
 * Categories API Route / Kateqoriyalar API Route-u
 * This file handles CRUD operations for categories
 * Bu fayl kateqoriyalar üçün CRUD əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/categories - Get all categories / Bütün kateqoriyaları əldə et
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeProducts = searchParams.get("includeProducts") === "true";
    const parentOnly = searchParams.get("parentOnly") === "true";

    // Build where clause / Where şərtini qur
    const where: any = {
      isActive: true,
    };

    if (parentOnly) {
      where.parentId = null;
    }

    // Get categories / Kateqoriyaları əldə et
    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: { isActive: true },
          include: includeProducts ? {
            products: {
              where: { isActive: true },
              take: 4, // Limit products per category / Kateqoriya başına məhsul məhdudiyyəti
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          } : false,
        },
        parent: true,
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories / Kateqoriyaları əldə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category / Yeni kateqoriya yarat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only admins can create categories / Yalnız adminlər kateqoriya yarada bilər" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, image, parentId } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required / Kateqoriya adı tələb olunur" },
        { status: 400 }
      );
    }

    // Check if parent category exists (if parentId provided) / Ana kateqoriyanın mövcud olduğunu yoxla
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: "Parent category not found / Ana kateqoriya tapılmadı" },
          { status: 404 }
        );
      }
    }

    // Check if category with same name already exists / Eyni adlı kateqoriyanın artıq mövcud olduğunu yoxla
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
        parentId: parentId || null,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category with this name already exists / Bu adlı kateqoriya artıq mövcuddur" },
        { status: 409 }
      );
    }

    // Create category / Kateqoriya yarat
    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        image: image || null,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: "Category created successfully / Kateqoriya uğurla yaradıldı",
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category / Kateqoriya yaratmaq uğursuz" },
      { status: 500 }
    );
  }
}
