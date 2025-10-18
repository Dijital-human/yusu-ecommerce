/**
 * Payment Intent API Route / Ödəniş Niyyəti API Route-u
 * This file creates Stripe payment intents for orders
 * Bu fayl sifarişlər üçün Stripe ödəniş niyyətləri yaradır
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

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
    const { orderId, amount, currency = "usd" } = body;

    // Validate input / Girişi yoxla
    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, error: "Order ID and amount are required / Sifariş ID və məbləğ tələb olunur" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user / Sifarişin mövcud olduğunu və istifadəçiyə aid olduğunu yoxla
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
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

    // Verify amount matches order total / Məbləğin sifariş cəminə uyğun olduğunu yoxla
    if (amount !== order.totalAmount) {
      return NextResponse.json(
        { success: false, error: "Amount mismatch / Məbləğ uyğunsuzluğu" },
        { status: 400 }
      );
    }

    // Create payment intent / Ödəniş niyyəti yarat
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents / Sentə çevir
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId,
        userId: session.user.id,
      },
      description: `Order #${orderId.slice(-8).toUpperCase()}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID / Sifarişi ödəniş niyyəti ID ilə yenilə
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentIntentId: paymentIntent.id,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create payment intent / Ödəniş niyyəti yaratmaq uğursuz" },
      { status: 500 }
    );
  }
}
