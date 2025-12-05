/**
 * Payment Intent API Route / Ödəniş Niyyəti API Route-u
 * This file creates Stripe payment intents for orders
 * Bu fayl sifarişlər üçün Stripe ödəniş niyyətləri yaradır
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { logger } from "@/lib/utils/logger";
import { createPayment, paymentProviderManager } from "@/lib/payments/payment-provider";
import { getOrderWithBasic } from "@/lib/db/queries/order-queries";
import { handleApiError } from "@/lib/api/error-handler";
import { trackAPITransaction, startAPMTransaction, endAPMTransaction, setAPMUser, trackAPMError } from "@/lib/monitoring/apm";
import { triggerAPIErrorAlert, triggerAPIResponseTimeAlert, triggerPaymentErrorAlert } from "@/lib/monitoring/alert-helpers";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let orderId: string | undefined;
  let userId: string | undefined;
  let transactionId: string | undefined;
  let paymentMethod: string = "stripe";
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    userId = session.user.id;
    
    // Set APM user context / APM istifadəçi konteksti təyin et
    setAPMUser(userId);
    
    // Start APM transaction / APM transaction başlat
    transactionId = startAPMTransaction('payment.create-intent', {
      userId,
    });
    const body = await request.json();
    const { orderId: bodyOrderId, amount, currency = "usd", paymentMethod: bodyPaymentMethod = "stripe" } = body;
    orderId = bodyOrderId;
    paymentMethod = bodyPaymentMethod;

    // Validate input / Girişi yoxla
    if (!orderId || !amount) {
      return NextResponse.json(
        { success: false, error: "Order ID and amount are required / Sifariş ID və məbləğ tələb olunur" },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user using query helper / Query helper istifadə edərək sifarişin mövcud olduğunu və istifadəçiyə aid olduğunu yoxla
    const order = await getOrderWithBasic(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found / Sifariş tapılmadı" },
        { status: 404 }
      );
    }

    // Verify order belongs to user / Sifarişin istifadəçiyə aid olduğunu yoxla
    if (order.customerId !== userId) {
      return NextResponse.json(
        { success: false, error: "Order not found / Sifariş tapılmadı" },
        { status: 404 }
      );
    }

    // Verify amount matches order total / Məbləğin sifariş cəminə uyğun olduğunu yoxla
    if (Number(amount) !== Number(order.totalAmount)) {
      return NextResponse.json(
        { success: false, error: "Amount mismatch / Məbləğ uyğunsuzluğu" },
        { status: 400 }
      );
    }

    // Check if payment method is available / Ödəniş metodunun mövcud olub-olmadığını yoxla
    if (!paymentProviderManager.isMethodAvailable(paymentMethod as any)) {
      return NextResponse.json(
        { success: false, error: `Payment method ${paymentMethod} is not available / Ödəniş metodu ${paymentMethod} mövcud deyil` },
        { status: 400 }
      );
    }

    // Create payment using provider / Provider istifadə edərək ödəniş yarat
    const paymentResult = await createPayment({
      orderId,
      amount: Number(amount),
      currency,
      userId,
      paymentMethod: paymentMethod as any,
      metadata: {
        orderId,
        userId,
      },
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error || "Failed to create payment / Ödəniş yaratmaq uğursuz" },
        { status: 500 }
      );
    }

    // Update order with payment information using order service / Order service istifadə edərək sifarişi ödəniş məlumatları ilə yenilə
    const { updateOrderPaymentInfo } = await import("@/services/order.service");
    try {
      await updateOrderPaymentInfo(orderId, {
      paymentIntentId: paymentResult.paymentId,
      status: paymentMethod === 'cash_on_delivery' || paymentMethod === 'bank_transfer' 
        ? "CONFIRMED" 
        : "PENDING_PAYMENT",
      paymentStatus: paymentMethod === 'cash_on_delivery' || paymentMethod === 'bank_transfer'
        ? "PENDING"
        : "PENDING",
      });
    } catch (updateError) {
      // Log error but don't fail the payment intent creation / Xətanı qeyd et amma ödəniş niyyəti yaratmanı uğursuz etmə
      logger.error("Failed to update order payment info", updateError, { orderId });
      // Payment webhook will handle the update / Payment webhook yeniləməni idarə edəcək
    }

    const duration = Date.now() - startTime;
    const response = NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentResult.clientSecret,
        paymentId: paymentResult.paymentId,
        redirectUrl: paymentResult.redirectUrl,
        paymentMethod,
        status: paymentResult.status,
        metadata: paymentResult.metadata,
      },
    });
    
    // Track APM transaction / APM transaction izlə
    trackAPITransaction('/api/payment/create-intent', 'POST', duration, response.status, {
      orderId,
      paymentMethod,
      amount,
      currency,
    });
    
    // End APM transaction / APM transaction bitir
    if (transactionId) {
      endAPMTransaction(transactionId, 'success');
    }
    
    // Check for high response time / Yüksək cavab vaxtını yoxla
    await triggerAPIResponseTimeAlert('/api/payment/create-intent', duration, 3000);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const currentUserId = userId; // Capture userId from outer scope / userId-ni xarici scope-dan tut
    
    logger.error("Error creating payment intent", error, { orderId, userId: currentUserId });
    
    // Track APM error / APM xətasını izlə
    trackAPMError(error instanceof Error ? error : new Error(String(error)), {
      endpoint: '/api/payment/create-intent',
      method: 'POST',
      duration,
      orderId,
      userId: currentUserId,
    });
    
    // End APM transaction with error / APM transaction-i xəta ilə bitir
    if (transactionId) {
      endAPMTransaction(transactionId, 'error');
    }
    
    // Trigger alert for payment error / Ödəniş xətası üçün alert tetiklə
    const alertMetadata: Record<string, any> = {
      endpoint: '/api/payment/create-intent',
    };
    if (currentUserId) {
      alertMetadata.userId = currentUserId;
    }
    
    if (orderId) {
      // Get payment provider name / Ödəniş provider adını al
      let providerName = 'unknown';
      try {
        const provider = paymentProviderManager.getProvider(paymentMethod as any);
        if (provider) {
          providerName = provider.getName();
        } else {
          providerName = paymentMethod || 'unknown';
        }
      } catch {
        providerName = paymentMethod || 'unknown';
      }
      
      await triggerPaymentErrorAlert(
        orderId,
        providerName,
        error instanceof Error ? error : new Error(String(error)),
        alertMetadata
      );
    } else {
      alertMetadata.operation = 'create_payment_intent';
      await triggerAPIErrorAlert('/api/payment/create-intent', 500, error instanceof Error ? error : new Error(String(error)), alertMetadata);
    }
    
    return handleApiError(error, "create payment intent");
  }
}
