import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";

/**
 * GET /api/courier/deliveries
 * Fetches deliveries for the authenticated courier.
 * Authenticated user must be a COURIER.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing courier deliveries or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "COURIER") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Build where clause
    // Where şərtini qur
    const whereClause: any = {
      courierId: session.user.id,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    const deliveries = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
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
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.order.count({
      where: whereClause,
    });

    // Format deliveries for easier consumption
    // Çatdırılmaları daha asan istifadə üçün formatla
    const formattedDeliveries = deliveries.map(delivery => ({
      id: delivery.id,
      orderId: delivery.id,
      customerName: delivery.customer?.name || "N/A",
      customerPhone: delivery.customer?.phone || "N/A",
      address: delivery.shippingAddress,
      status: delivery.status,
      createdAt: delivery.createdAt.toISOString(),
      totalAmount: delivery.totalAmount,
      items: delivery.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
      })),
    }));

    return NextResponse.json({
      deliveries: formattedDeliveries,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courier deliveries:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
