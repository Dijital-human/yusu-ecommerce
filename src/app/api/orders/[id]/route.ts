/**
 * Order Detail API Route / Sifariş Təfərrüatı API Route-u
 * This file handles individual order operations (GET, PUT)
 * Bu fayl fərdi sifariş əməliyyatlarını idarə edir (GET, PUT)
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, notFoundResponse, forbiddenResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { getOrderWithDetailed } from "@/lib/db/queries/order-queries";
import { validateOrderId } from "@/lib/api/validators";
import { updateOrderStatus } from "@/services/order.service";

// GET /api/orders/[id] - Get single order / Tək sifariş əldə et
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    // Validate order ID using helper / Helper ilə sifariş ID-ni yoxla
    const validatedOrderId = validateOrderId(orderId);
    if (validatedOrderId instanceof Response) {
      return validatedOrderId;
    }

    // Get order using query helper / Query helper ilə sifarişi al
    const result = await getOrderWithDetailed(validatedOrderId);
    if (result instanceof Response) {
      return result;
    }

    const order = result;

    // Check if user has permission to view this order / İstifadəçinin bu sifarişi görə biləcəyini yoxla
    const canView = 
      order.customerId === user.id ||
      order.sellerId === user.id ||
      order.courierId === user.id ||
      user.role === "ADMIN";

    if (!canView) {
      return forbiddenResponse();
    }

    return successResponse(order);
  } catch (error) {
    return handleApiError(error, "fetch order");
  }
}

// PUT /api/orders/[id] - Update order status / Sifariş statusunu yenilə
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const body = await request.json();
    const { status, courierId, notes } = body;

    // Validate order ID using helper / Helper ilə sifariş ID-ni yoxla
    const validatedOrderId = validateOrderId(orderId);
    if (validatedOrderId instanceof Response) {
      return validatedOrderId;
    }

    // Update order status using service layer / Service layer istifadə edərək sifariş statusunu yenilə
    const updatedOrder = await updateOrderStatus(
      validatedOrderId,
      status,
      user.id,
      user.role,
      courierId
    );

    // Get full order details using query helper / Query helper istifadə edərək tam sifariş təfərrüatlarını al
    const fullOrderResult = await getOrderWithDetailed(validatedOrderId);
    if (fullOrderResult instanceof Response) {
      return fullOrderResult;
    }

    return successResponse(fullOrderResult, "Order updated successfully / Sifariş uğurla yeniləndi");
  } catch (error) {
    return handleApiError(error, "update order");
  }
}
