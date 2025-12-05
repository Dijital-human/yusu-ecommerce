/**
 * Order Tracking API Route / Sifariş İzləmə API Route-u
 * This route handles order tracking by tracking number or order ID
 * Bu route izləmə nömrəsi və ya sifariş ID-si ilə sifariş izləməsini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import { getOrderForTracking } from "@/lib/db/queries/order-queries";
import { handleApiError } from "@/lib/api/error-handler";

// GET /api/orders/track - Track order by tracking number or order ID
// İzləmə nömrəsi və ya sifariş ID-si ilə sifariş izlə
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get("trackingNumber");
    const orderId = searchParams.get("orderId");
    const orderNumber = searchParams.get("orderNumber");

    // Validate input / Girişi yoxla
    if (!trackingNumber && !orderId && !orderNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Tracking number, order ID, or order number is required / İzləmə nömrəsi, sifariş ID və ya sifariş nömrəsi tələb olunur" 
        },
        { status: 400 }
      );
    }

    // Use query helper to get order / Sifarişi almaq üçün query helper istifadə et
    const order = await getOrderForTracking(orderId || undefined, trackingNumber || undefined, orderNumber || undefined);

    if (!order) {
      if (orderNumber && !orderNumber.match(/^YUSU-\d{4}-[A-Z0-9]{8}$/)) {
        return NextResponse.json(
          { success: false, error: "Invalid order number format / Yanlış sifariş nömrəsi formatı" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { 
          success: false, 
          error: "Order not found / Sifariş tapılmadı",
          message: "Please check your tracking number or order ID / Zəhmət olmasa izləmə nömrənizi və ya sifariş ID-nizi yoxlayın"
        },
        { status: 404 }
      );
    }

    // Parse shipping address / Çatdırılma ünvanını parse et
    let shippingAddress = null;
    try {
      shippingAddress = typeof order.shippingAddress === "string" 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress;
    } catch (e) {
      logger.error("Error parsing shipping address", e, { orderId: order.id });
    }

    // Build tracking timeline based on order status / Sifariş statusuna əsasən izləmə zaman xəttini qur
    const timeline = [];
    const now = new Date();

    // Order created / Sifariş yaradıldı
    timeline.push({
      status: "Order Placed",
      date: order.createdAt.toISOString().split("T")[0],
      time: order.createdAt.toISOString().split("T")[1].split(".")[0],
      location: "Online Store",
      completed: true,
      description: "Your order has been placed successfully / Sifarişiniz uğurla verildi",
    });

    // Order confirmed / Sifariş təsdiqləndi
    if (["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status)) {
      timeline.push({
        status: "Order Confirmed",
        date: order.updatedAt.toISOString().split("T")[0],
        time: order.updatedAt.toISOString().split("T")[1].split(".")[0],
        location: "Seller",
        completed: true,
        description: "Seller has confirmed your order / Satıcı sifarişinizi təsdiqlədi",
      });
    }

    // Order shipped / Sifariş göndərildi
    if (["SHIPPED", "DELIVERED"].includes(order.status)) {
      timeline.push({
        status: "Shipped",
        date: order.updatedAt.toISOString().split("T")[0],
        time: order.updatedAt.toISOString().split("T")[1].split(".")[0],
        location: shippingAddress?.city || "Warehouse",
        completed: true,
        description: "Your order is on the way / Sifarişiniz yoldadır",
      });
    }

    // Out for delivery / Çatdırılma üçün çıxıb
    if (order.status === "DELIVERED" && order.courierId) {
      timeline.push({
        status: "Out for Delivery",
        date: order.updatedAt.toISOString().split("T")[0],
        time: order.updatedAt.toISOString().split("T")[1].split(".")[0],
        location: shippingAddress?.city || "Local Area",
        completed: true,
        description: "Courier is delivering your order / Kuryer sifarişinizi çatdırır",
      });
    }

    // Delivered / Çatdırıldı
    if (order.status === "DELIVERED") {
      timeline.push({
        status: "Delivered",
        date: order.updatedAt.toISOString().split("T")[0],
        time: order.updatedAt.toISOString().split("T")[1].split(".")[0],
        location: shippingAddress?.street || "Your Address",
        completed: true,
        description: "Order has been delivered successfully / Sifariş uğurla çatdırıldı",
      });
    } else {
      // Estimated delivery / Təxmini çatdırılma
      const estimatedDate = new Date(order.createdAt);
      estimatedDate.setDate(estimatedDate.getDate() + 5); // 5 days estimate / 5 gün təxmin
      
      timeline.push({
        status: "Expected Delivery",
        date: estimatedDate.toISOString().split("T")[0],
        time: "Expected",
        location: shippingAddress?.street || "Your Address",
        completed: false,
        description: `Estimated delivery date / Təxmini çatdırılma tarixi: ${estimatedDate.toLocaleDateString()}`,
      });
    }

    // Generate tracking number (last 8 chars of order ID) / İzləmə nömrəsi yarat (sifariş ID-nin son 8 simvolu)
    const trackingNumberGenerated = `YUSU-${order.createdAt.getFullYear()}-${order.id.slice(-8).toUpperCase()}`;

    // Calculate estimated delivery / Təxmini çatdırılmanı hesabla
    const estimatedDelivery = new Date(order.createdAt);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: trackingNumberGenerated,
        trackingNumber: trackingNumberGenerated,
        status: order.status,
        estimatedDelivery: estimatedDelivery.toISOString(),
        carrier: order.courier?.name || "Yusu Delivery",
        shippingAddress: shippingAddress,
        customer: order.customer,
        seller: order.seller,
        courier: order.courier,
        items: order.items.map((item: { id: string; product: any; quantity: number; price: number }) => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus || "PENDING",
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        timeline: timeline,
      },
    });
  } catch (error) {
    return handleApiError(error, "track order");
  }
}

