/**
 * Payment Webhook API Route / Ödəniş Webhook API Route-u
 * This file handles Stripe webhook events
 * Bu fayl Stripe webhook hadisələrini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { logger } from "@/lib/utils/logger";
import { updateProductStock } from "@/lib/inventory/inventory-manager";
import { getOrderWithBasic } from "@/lib/db/queries/order-queries";
import { updateOrderPaymentStatus } from "@/services/order.service";
import { handleApiError } from "@/lib/api/error-handler";

// Stripe configuration - only initialize if API key is available
// Stripe konfiqurasiyası - yalnız API açarı mövcud olduqda başlat
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured / Stripe konfiqurasiyasını yoxla
    if (!stripe || !webhookSecret) {
      return NextResponse.json(
        { error: "Payment system not configured / Ödəniş sistemi konfiqurasiya edilməyib" },
        { status: 503 }
      );
    }

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
      logger.error("Webhook signature verification failed", err);
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
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook error", error);
    // Use standardized error handling / Standartlaşdırılmış error handling istifadə et
    return handleApiError(error, "process webhook");
  }
}

// Handle successful payment / Uğurlu ödənişi idarə et
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      logger.error("No order ID in payment intent metadata", undefined, { paymentIntentId: paymentIntent.id });
      return;
    }

    // Update order status using service layer / Service layer istifadə edərək sifariş statusunu yenilə
    await updateOrderPaymentStatus(orderId, {
      status: "CONFIRMED",
      paymentStatus: "PAID",
      paidAt: new Date(),
    });

    // Update product stock using inventory manager / Inventory manager istifadə edərək məhsul stokunu yenilə
    // Get order using query helper / Query helper ilə sifarişi al
    const order = await getOrderWithBasic(orderId);
    
    if (!order) {
      logger.error("Order not found in webhook / Webhook-da sifariş tapılmadı", { orderId });
      return NextResponse.json({ received: true });
    }

    // Update stock for each item / Hər element üçün stoku yenilə
    for (const item of order.items) {
      await updateProductStock(
        item.productId,
        item.quantity,
        'decrement',
        `Order ${orderId} payment confirmed / Sifariş ${orderId} ödənişi təsdiq edildi`
      );
    }

    const succeededOrderId = paymentIntent.metadata.orderId;
    logger.info(`Payment succeeded for order ${succeededOrderId}`, { orderId: succeededOrderId, paymentIntentId: paymentIntent.id });
  } catch (error) {
    const errorOrderId = paymentIntent.metadata.orderId;
    logger.error("Error handling payment success", error, { orderId: errorOrderId, paymentIntentId: paymentIntent.id });
  }
}

// Handle failed payment / Uğursuz ödənişi idarə et
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      logger.error("No order ID in payment intent metadata", undefined, { paymentIntentId: paymentIntent.id });
      return;
    }

    // Update order status using service layer / Service layer istifadə edərək sifariş statusunu yenilə
    await updateOrderPaymentStatus(orderId, {
      status: "PAYMENT_FAILED",
      paymentStatus: "FAILED",
    });

    const failedOrderId = paymentIntent.metadata.orderId;
    logger.info(`Payment failed for order ${failedOrderId}`, { orderId: failedOrderId, paymentIntentId: paymentIntent.id });
  } catch (error) {
    const errorOrderId = paymentIntent.metadata.orderId;
    logger.error("Error handling payment failure", error, { orderId: errorOrderId, paymentIntentId: paymentIntent.id });
  }
}

// Handle canceled payment / Ləğv edilmiş ödənişi idarə et
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      logger.error("No order ID in payment intent metadata", undefined, { paymentIntentId: paymentIntent.id });
      return;
    }

    // Update order status using service layer / Service layer istifadə edərək sifariş statusunu yenilə
    await updateOrderPaymentStatus(orderId, {
      status: "CANCELLED",
      paymentStatus: "CANCELED",
    });

    const canceledOrderId = paymentIntent.metadata.orderId;
    logger.info(`Payment canceled for order ${canceledOrderId}`, { orderId: canceledOrderId, paymentIntentId: paymentIntent.id });
  } catch (error) {
    const errorOrderId = paymentIntent.metadata.orderId;
    logger.error("Error handling payment cancellation", error, { orderId: errorOrderId, paymentIntentId: paymentIntent.id });
  }
}
