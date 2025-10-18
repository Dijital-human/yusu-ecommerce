import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

/**
 * GET /api/seller/orders/[id]
 * Fetches a specific order for the authenticated seller.
 * Authenticated user must be a SELLER and own the order.
 *
 * @param {Request} req - The incoming request.
 * @param {Object} params - Route parameters containing the order ID.
 * @returns {NextResponse} - A response containing the order or an error.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized / icazəsiz giriş" }, { status: 401 });
    }

    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
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
                price: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found / Sifariş tapılmadı" }, { status: 404 });
    }

    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to view this order / Bu sifarişə baxmaq üçün icazəniz yoxdur" }, { status: 403 });
    }

    // Format order for easier consumption
    // Sifarişi daha asan istifadə üçün formatla
    const formattedOrder = {
      id: order.id,
      customerName: order.customer?.name || "N/A",
      customerEmail: order.customer?.email || "N/A",
      total: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      shippingAddress: order.shippingAddress,
      items: order.items.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return NextResponse.json(formattedOrder, { status: 200 });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ message: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
