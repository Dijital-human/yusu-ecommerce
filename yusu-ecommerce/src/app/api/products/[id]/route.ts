/**
 * Product Detail API Route / Məhsul Təfərrüatı API Route-u
 * This file handles individual product operations (GET, PUT, DELETE)
 * Bu fayl fərdi məhsul əməliyyatlarını idarə edir (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/products/[id] - Get single product / Tək məhsul əldə et
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    // Calculate average rating / Orta reytinqi hesabla
    const avgRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0;

    const productWithRating = {
      ...product,
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: product.reviews.length,
    };

    return NextResponse.json({
      success: true,
      data: productWithRating,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product / Məhsul əldə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product / Məhsul yenilə
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const productId = params.id;
    const body = await request.json();

    // Check if product exists / Məhsulun mövcud olduğunu yoxla
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    // Check if user can update this product / İstifadəçinin bu məhsulu yeniləyə biləcəyini yoxla
    if (session.user.role !== "ADMIN" && existingProduct.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only update your own products / Yalnız öz məhsullarınızı yeniləyə bilərsiniz" },
        { status: 403 }
      );
    }

    // Update product / Məhsul yenilə
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name || existingProduct.name,
        description: body.description || existingProduct.description,
        price: body.price ? parseFloat(body.price) : existingProduct.price,
        images: body.images || existingProduct.images,
        categoryId: body.categoryId || existingProduct.categoryId,
        stock: body.stock !== undefined ? parseInt(body.stock) : existingProduct.stock,
        isActive: body.isActive !== undefined ? body.isActive : existingProduct.isActive,
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
      data: updatedProduct,
      message: "Product updated successfully / Məhsul uğurla yeniləndi",
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product / Məhsul yeniləmək uğursuz" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product / Məhsul sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const productId = params.id;

    // Check if product exists / Məhsulun mövcud olduğunu yoxla
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found / Məhsul tapılmadı" },
        { status: 404 }
      );
    }

    // Check if user can delete this product / İstifadəçinin bu məhsulu silə biləcəyini yoxla
    if (session.user.role !== "ADMIN" && existingProduct.sellerId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You can only delete your own products / Yalnız öz məhsullarınızı silə bilərsiniz" },
        { status: 403 }
      );
    }

    // Soft delete - set isActive to false / Yumşaq silmə - isActive-i false et
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully / Məhsul uğurla silindi",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product / Məhsul silmək uğursuz" },
      { status: 500 }
    );
  }
}
