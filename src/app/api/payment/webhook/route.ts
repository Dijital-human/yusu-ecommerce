/**
 * Payment Webhook API Route / Ödəniş Webhook API Route-u
 * This file handles Stripe webhook events
 * Bu fayl Stripe webhook hadisələrini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No signature provided / İmza təmin edilmədi" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature / Yanlış imza" },
        { status: 400 }
      );
    }

    // Handle the event / Hadisəni idarə et
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed / Webhook emalı uğursuz" },
      { status: 500 }
    );
  }
}

// Handle successful payment / Uğurlu ödənişi idarə et
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error("No order ID in payment intent metadata");
      return;
    }

    // Update order status / Sifariş statusunu yenilə
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paidAt: new Date(),
      },
    });

    // Update product stock / Məhsul stokunu yenilə
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (order) {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    console.log(`Payment succeeded for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

// Handle failed payment / Uğursuz ödənişi idarə et
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error("No order ID in payment intent metadata");
      return;
    }

    // Update order status / Sifariş statusunu yenilə
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAYMENT_FAILED",
        paymentStatus: "FAILED",
      },
    });

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

// Handle canceled payment / Ləğv edilmiş ödənişi idarə et
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      console.error("No order ID in payment intent metadata");
      return;
    }

    // Update order status / Sifariş statusunu yenilə
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "CANCELED",
      },
    });

    console.log(`Payment canceled for order ${orderId}`);
  } catch (error) {
    console.error("Error handling payment cancellation:", error);
  }
}
