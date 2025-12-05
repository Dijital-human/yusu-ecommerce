/**
 * Partial Payment API Route / Qismən Ödəniş API Route-u
 * Handles partial payment operations
 * Qismən ödəniş əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, handleApiError } from "@/lib/api/response";
import {
  createPartialPayment,
  completePartialPayment,
  getPartialPaymentStatus,
  refundPartialPayment,
} from "@/services/partial-payment.service";

/**
 * POST /api/payments/partial - Create partial payment / Qismən ödəniş yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const body = await request.json();
    const { orderId, amount, paymentMethod, transactionId } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!orderId || !amount || !paymentMethod) {
      return badRequestResponse("Missing required fields / Tələb olunan sahələr çatışmır");
    }

    // Verify order belongs to user / Sifarişin istifadəçiyə aid olduğunu yoxla
    const { prisma } = await import("@/lib/db");
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return badRequestResponse("Order not found / Sifariş tapılmadı");
    }

    if (order.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const partialPayment = await createPartialPayment({
      orderId,
      amount,
      paymentMethod,
      transactionId,
    });

    return successResponse(partialPayment, "Partial payment created successfully / Qismən ödəniş uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create partial payment");
  }
}

/**
 * GET /api/payments/partial?orderId=xxx - Get partial payment status / Qismən ödəniş statusunu al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const action = searchParams.get("action");

    if (!orderId) {
      return badRequestResponse("Order ID is required / Sifariş ID-si tələb olunur");
    }

    // Verify order belongs to user / Sifarişin istifadəçiyə aid olduğunu yoxla
    const { prisma } = await import("@/lib/db");
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return badRequestResponse("Order not found / Sifariş tapılmadı");
    }

    if (order.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    if (action === "schedule") {
      const schedule = await getPaymentSchedule(orderId);
      return successResponse(schedule);
    } else if (action === "history") {
      const history = await getPaymentHistory(orderId);
      return successResponse(history);
    } else {
      const status = await getPartialPaymentStatus(orderId);
      return successResponse(status);
    }
  } catch (error) {
    return handleApiError(error, "get partial payment info");
  }
}

/**
 * GET /api/payments/partial/schedule - Get payment schedule / Ödəniş cədvəlini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const action = searchParams.get("action");

    if (!orderId) {
      return badRequestResponse("Order ID is required / Sifariş ID tələb olunur");
    }

    if (action === "schedule") {
      const schedule = await getPaymentSchedule(orderId);
      return successResponse(schedule);
    } else if (action === "history") {
      const history = await getPaymentHistory(orderId);
      return successResponse(history);
    } else {
      const status = await getPartialPaymentStatus(orderId);
      return successResponse(status);
    }
  } catch (error) {
    return handleApiError(error, "get partial payment info");
  }
}

/**
 * PUT /api/payments/partial/:id/complete - Complete partial payment / Qismən ödənişi tamamla
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const partialPaymentId = searchParams.get("id");

    if (!partialPaymentId || !action) {
      return badRequestResponse("Partial payment ID and action are required / Qismən ödəniş ID-si və əməliyyat tələb olunur");
    }

    // Verify partial payment belongs to user's order / Qismən ödənişin istifadəçinin sifarişinə aid olduğunu yoxla
    const { prisma } = await import("@/lib/db");
    const partialPayment = await (prisma as any).partialPayment.findUnique({
      where: { id: partialPaymentId },
      include: {
        order: true,
      },
    });

    if (!partialPayment) {
      return badRequestResponse("Partial payment not found / Qismən ödəniş tapılmadı");
    }

    if (partialPayment.order.customerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    if (action === "complete") {
      const result = await completePartialPayment(partialPaymentId);
      return successResponse(result, "Partial payment completed successfully / Qismən ödəniş uğurla tamamlandı");
    } else if (action === "refund") {
      const result = await refundPartialPayment(partialPaymentId);
      return successResponse(result, "Partial payment refunded successfully / Qismən ödəniş uğurla geri qaytarıldı");
    } else if (action === "reminder") {
      await sendPaymentReminder(partialPayment.orderId);
      return successResponse({ success: true, message: "Payment reminder sent / Ödəniş xatırlatması göndərildi" });
    } else {
      return badRequestResponse("Invalid action / Yanlış əməliyyat");
    }
  } catch (error) {
    return handleApiError(error, "update partial payment");
  }
}

