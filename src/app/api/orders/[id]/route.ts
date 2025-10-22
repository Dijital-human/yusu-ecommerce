/**
 * Order Detail API Route / Sifariş Təfərrüatı API Route-u
 * This file handles individual order operations (GET, PUT)
 * Bu fayl fərdi sifariş əməliyyatlarını idarə edir (GET, PUT)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/orders/[id] - Get single order / Tək sifariş əldə et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
            phone: true,
          },
        },
        courier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found / Sifariş tapılmadı" },
        { status: 404 }
      );
    }

    // Check if user has permission to view this order / İstifadəçinin bu sifarişi görə biləcəyini yoxla
    const canView = 
      order.customerId === session.user.id ||
      order.sellerId === session.user.id ||
      order.courierId === session.user.id ||
      session.user.role === "ADMIN";

    if (!canView) {
      return NextResponse.json(
        { success: false, error: "Access denied / Giriş qadağandır" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order / Sifariş əldə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/[id] - Update order status / Sifariş statusunu yenilə
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const body = await request.json();
    const { status, courierId, notes } = body;

    // Check if order exists / Sifarişin mövcud olduğunu yoxla
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found / Sifariş tapılmadı" },
        { status: 404 }
      );
    }

    // Check permissions based on user role / İstifadəçi roluna əsasən icazələri yoxla
    let canUpdate = false;
    let allowedStatuses: string[] = [];

    switch (session.user.role) {
      case "ADMIN":
        canUpdate = true;
        allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
        break;
      case "SELLER":
        canUpdate = existingOrder.sellerId === session.user.id;
        allowedStatuses = ["CONFIRMED", "SHIPPED", "CANCELLED"];
        break;
      case "COURIER":
        canUpdate = existingOrder.courierId === session.user.id;
        allowedStatuses = ["SHIPPED", "DELIVERED"];
        break;
      case "CUSTOMER":
        canUpdate = existingOrder.customerId === session.user.id;
        allowedStatuses = ["CANCELLED"]; // Only can cancel pending orders / Yalnız gözləyən sifarişləri ləğv edə bilər
        break;
    }

    if (!canUpdate) {
      return NextResponse.json(
        { success: false, error: "You don't have permission to update this order / Bu sifarişi yeniləmək icazəniz yoxdur" },
        { status: 403 }
      );
    }

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `You can only update status to: ${allowedStatuses.join(", ")} / Yalnız bu statuslara yeniləyə bilərsiniz: ${allowedStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate courier assignment / Kuryer təyinatını yoxla
    if (courierId && session.user.role === "ADMIN") {
      const courier = await prisma.user.findUnique({
        where: { id: courierId },
      });

      if (!courier || courier.role !== "COURIER") {
        return NextResponse.json(
          { success: false, error: "Invalid courier / Yanlış kuryer" },
          { status: 400 }
        );
      }
    }

    // Update order / Sifarişi yenilə
    const updateData: any = {};
    if (status) updateData.status = status;
    if (courierId) updateData.courierId = courierId;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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
            phone: true,
          },
        },
        courier: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully / Sifariş uğurla yeniləndi",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order / Sifarişi yeniləmək uğursuz" },
      { status: 500 }
    );
  }
}
