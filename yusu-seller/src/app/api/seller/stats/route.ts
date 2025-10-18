import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

// GET /api/seller/stats - Get seller's statistics / Satıcının statistikalarını al
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

    const sellerId = session.user.id;

    // Get total products count
    // Ümumi məhsul sayını al
    const totalProducts = await prisma.product.count({
      where: {
        sellerId,
        isActive: true,
      },
    });

    // Get total orders count
    // Ümumi sifariş sayını al
    const totalOrders = await prisma.order.count({
      where: {
        sellerId,
      },
    });

    // Get total revenue
    // Ümumi gəliri al
    const revenueResult = await prisma.order.aggregate({
      where: {
        sellerId,
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Get pending orders count
    // Gözləyən sifariş sayını al
    const pendingOrders = await prisma.order.count({
      where: {
        sellerId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json(
      { error: "Internal server error / Daxili server xətası" },
      { status: 500 }
    );
  }
}
