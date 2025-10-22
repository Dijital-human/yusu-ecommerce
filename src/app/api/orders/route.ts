/**
 * Orders API Route / Sifarişlər API Route-u
 * This file handles order operations (GET, POST)
 * Bu fayl sifariş əməliyyatlarını idarə edir (GET, POST)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/orders - Get user's orders / İstifadəçinin sifarişlərini əldə et
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const role = searchParams.get("role"); // customer, seller, courier, admin

    const skip = (page - 1) * limit;

    // Build where clause based on user role / İstifadəçi roluna əsasən where şərtini qur
    let where: any = {};

    if (role === "customer" || session.user.role === "CUSTOMER") {
      where.customerId = session.user.id;
    } else if (role === "seller" || session.user.role === "SELLER") {
      where.sellerId = session.user.id;
    } else if (role === "courier" || session.user.role === "COURIER") {
      where.courierId = session.user.id;
    }
    // Admin can see all orders / Admin bütün sifarişləri görə bilər

    if (status) {
      where.status = status;
    }

    // Get orders with pagination / Səhifələmə ilə sifarişləri əldə et
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          courier: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders / Sifarişləri əldə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create new order / Yeni sifariş yarat
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
    const {
      items,
      shippingAddress,
      paymentMethod,
      notes,
    } = body;

    // Validate input / Girişi yoxla
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order items are required / Sifariş elementləri tələb olunur" },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: "Shipping address is required / Çatdırılma ünvanı tələb olunur" },
        { status: 400 }
      );
    }

    // Get cart items to create order / Sifariş yaratmaq üçün səbət elementlərini əldə et
    const cartItems = await prisma.cartItem.findMany({
      where: {
        userId: session.user.id,
        productId: {
          in: items.map((item: any) => item.productId),
        },
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: "No items found in cart / Səbətdə element tapılmadı" },
        { status: 400 }
      );
    }

    // Group items by seller / Elementləri satıcıya görə qrupla
    const ordersBySeller = new Map();

    for (const cartItem of cartItems) {
      const sellerId = cartItem.product.sellerId;
      
      if (!ordersBySeller.has(sellerId)) {
        ordersBySeller.set(sellerId, {
          sellerId,
          items: [],
          totalAmount: 0,
        });
      }

      const orderData = ordersBySeller.get(sellerId);
      const itemQuantity = items.find((item: any) => item.productId === cartItem.productId)?.quantity || cartItem.quantity;
      
      orderData.items.push({
        productId: cartItem.productId,
        quantity: itemQuantity,
        price: cartItem.product.price,
      });
      
      orderData.totalAmount += Number(cartItem.product.price) * itemQuantity;
    }

    // Create orders for each seller / Hər satıcı üçün sifariş yarat
    const createdOrders = [];

    for (const [sellerId, orderData] of ordersBySeller) {
      const order = await prisma.order.create({
        data: {
          customerId: session.user.id,
          sellerId: sellerId,
          status: "PENDING",
          totalAmount: orderData.totalAmount,
          shippingAddress: JSON.stringify(shippingAddress),
          items: {
            create: orderData.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
      });

      createdOrders.push(order);
    }

    // Clear cart items / Səbət elementlərini təmizlə
    await prisma.cartItem.deleteMany({
      where: {
        userId: session.user.id,
        productId: {
          in: items.map((item: any) => item.productId),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: createdOrders,
      message: "Order created successfully / Sifariş uğurla yaradıldı",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order / Sifariş yaratmaq uğursuz" },
      { status: 500 }
    );
  }
}
