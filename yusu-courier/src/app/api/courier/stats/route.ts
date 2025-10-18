import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

/**
 * GET /api/courier/stats
 * Fetches statistics for the authenticated courier.
 * Authenticated user must be a COURIER.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing courier statistics or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "COURIER") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const courierId = session.user.id;

    // Get total deliveries count
    // Ümumi çatdırılma sayını al
    const totalDeliveries = await prisma.order.count({
      where: { courierId },
    });

    // Get pending deliveries count
    // Gözləyən çatdırılma sayını al
    const pendingDeliveries = await prisma.order.count({
      where: { 
        courierId,
        status: OrderStatus.PROCESSING,
      },
    });

    // Get completed deliveries count
    // Tamamlanmış çatdırılma sayını al
    const completedDeliveries = await prisma.order.count({
      where: { 
        courierId,
        status: OrderStatus.DELIVERED,
      },
    });

    // Get today's deliveries count
    // Bu günkü çatdırılma sayını al
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await prisma.order.count({
      where: {
        courierId,
        status: OrderStatus.DELIVERED,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get total earnings (from completed deliveries)
    // Ümumi qazancı al (tamamlanmış çatdırılmalardan)
    const earningsResult = await prisma.order.aggregate({
      where: {
        courierId,
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalEarnings = earningsResult._sum.totalAmount || 0;

    // Placeholder for average rating (can be implemented with reviews later)
    // Orta reytinq üçün yer tutucu (daha sonra rəylər ilə tətbiq edilə bilər)
    const averageRating = 4.5; // Example rating / Nümunə reytinq

    return NextResponse.json({
      totalDeliveries,
      pendingDeliveries,
      completedDeliveries,
      todayDeliveries,
      totalEarnings,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching courier stats:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
