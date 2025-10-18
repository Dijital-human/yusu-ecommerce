/**
 * Cart API Route / Səbət API Route-u
 * This file handles cart operations (GET, POST, PUT, DELETE)
 * Bu fayl səbət əməliyyatlarını idarə edir (GET, POST, PUT, DELETE)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/cart - Get user's cart / İstifadəçinin səbətini əldə et
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    // Get cart items with product details / Məhsul təfərrüatları ilə səbət elementlərini əldə et
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cart / Səbəti əldə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart / Səbətə element əlavə et
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Validate input / Girişi yoxla
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required / Məhsul ID tələb olunur" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, error: "Quantity must be at least 1 / Miqdar ən azı 1 olmalıdır" },
        { status: 400 }
      );
    }

    // Check if product exists and is active / Məhsulun mövcud və aktiv olduğunu yoxla
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found or inactive / Məhsul tapılmadı və ya qeyri-aktiv" },
        { status: 404 }
      );
    }

    // Check if product is in stock / Məhsulun stokda olduğunu yoxla
    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock / Kifayət qədər stok yoxdur" },
        { status: 400 }
      );
    }

    // Check if item already exists in cart / Elementin artıq səbətdə mövcud olduğunu yoxla
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });

    if (existingItem) {
      // Update existing item quantity / Mövcud elementin miqdarını yenilə
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return NextResponse.json(
          { success: false, error: "Insufficient stock for requested quantity / Tələb olunan miqdar üçün kifayət qədər stok yoxdur" },
          { status: 400 }
        );
      }

      const updatedItem = await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId,
          },
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: "Cart item updated / Səbət elementi yeniləndi",
      });
    } else {
      // Create new cart item / Yeni səbət elementi yarat
      const newItem = await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId: productId,
          quantity: quantity,
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: newItem,
        message: "Item added to cart / Element səbətə əlavə edildi",
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart / Səbətə element əlavə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// PUT /api/cart - Update cart item quantity / Səbət elementinin miqdarını yenilə
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, quantity } = body;

    // Validate input / Girişi yoxla
    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "Product ID and quantity are required / Məhsul ID və miqdar tələb olunur" },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { success: false, error: "Quantity cannot be negative / Miqdar mənfi ola bilməz" },
        { status: 400 }
      );
    }

    // Check if item exists in cart / Elementin səbətdə mövcud olduğunu yoxla
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found in cart / Element səbətdə tapılmadı" },
        { status: 404 }
      );
    }

    if (quantity === 0) {
      // Remove item from cart / Elementi səbətdən çıxar
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Item removed from cart / Element səbətdən çıxarıldı",
      });
    }

    // Check product stock / Məhsul stokunu yoxla
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: "Product not found or inactive / Məhsul tapılmadı və ya qeyri-aktiv" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock / Kifayət qədər stok yoxdur" },
        { status: 400 }
      );
    }

    // Update item quantity / Elementin miqdarını yenilə
    const updatedItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
      data: {
        quantity: quantity,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Cart item updated / Səbət elementi yeniləndi",
    });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update cart / Səbəti yeniləmək uğursuz" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart or clear cart / Səbətdən element çıxar və ya səbəti təmizlə
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      // Remove specific item / Müəyyən elementi çıxar
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId,
          },
        },
      });

      if (!existingItem) {
        return NextResponse.json(
          { success: false, error: "Item not found in cart / Element səbətdə tapılmadı" },
          { status: 404 }
        );
      }

      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId: productId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Item removed from cart / Element səbətdən çıxarıldı",
      });
    } else {
      // Clear entire cart / Bütün səbəti təmizlə
      await prisma.cartItem.deleteMany({
        where: {
          userId: session.user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Cart cleared / Səbət təmizləndi",
      });
    }
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete from cart / Səbətdən silmək uğursuz" },
      { status: 500 }
    );
  }
}
