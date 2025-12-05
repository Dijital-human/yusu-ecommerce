/**
 * API Validation Helpers / API Validasiya Köməkçiləri
 * Reusable validation functions for API routes
 * API route-ları üçün təkrar istifadə olunan validasiya funksiyaları
 */

import { NextResponse } from "next/server";
import { badRequestResponse, notFoundResponse } from "./response";
import { prisma } from "@/lib/db";

/**
 * Validate product ID / Məhsul ID-ni yoxla
 */
export function validateProductId(productId: unknown): string | NextResponse {
  if (!productId || typeof productId !== 'string' || productId.trim() === '') {
    return badRequestResponse("Product ID is required / Məhsul ID tələb olunur");
  }
  return productId;
}

/**
 * Validate quantity / Miqdarı yoxla
 */
export function validateQuantity(quantity: unknown, min: number = 1): number | NextResponse {
  if (quantity === undefined || quantity === null) {
    return badRequestResponse("Quantity is required / Miqdar tələb olunur");
  }
  
  const numQuantity = typeof quantity === 'string' ? parseInt(quantity, 10) : Number(quantity);
  
  if (isNaN(numQuantity)) {
    return badRequestResponse("Quantity must be a number / Miqdar rəqəm olmalıdır");
  }
  
  if (numQuantity < min) {
    return badRequestResponse(`Quantity must be at least ${min} / Miqdar ən azı ${min} olmalıdır`);
  }
  
  return numQuantity;
}

/**
 * Validate and check product stock / Məhsul stokunu yoxla və yoxla
 */
export async function validateProductStock(
  productId: string, 
  quantity: number
): Promise<{ product: any; stock: number } | NextResponse> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || !product.isActive) {
    return notFoundResponse("Product");
  }

  if (product.stock < quantity) {
    return badRequestResponse("Insufficient stock / Kifayət qədər stok yoxdur");
  }

  return { product, stock: product.stock };
}

/**
 * Validate order items array / Sifariş elementləri massivini yoxla
 */
export function validateOrderItems(items: unknown): Array<{ productId: string; quantity: number }> | NextResponse {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return badRequestResponse("Order items are required / Sifariş elementləri tələb olunur");
  }

  const validatedItems: Array<{ productId: string; quantity: number }> = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') {
      return badRequestResponse("Invalid order item format / Yanlış sifariş elementi formatı");
    }

    const productId = validateProductId((item as any).productId);
    if (productId instanceof NextResponse) {
      return productId;
    }

    const quantity = validateQuantity((item as any).quantity);
    if (quantity instanceof NextResponse) {
      return quantity;
    }

    validatedItems.push({ productId, quantity });
  }

  return validatedItems;
}

/**
 * Validate shipping address / Çatdırılma ünvanını yoxla
 */
export function validateShippingAddress(shippingAddress: unknown): string | object | NextResponse {
  if (!shippingAddress) {
    return badRequestResponse("Shipping address is required / Çatdırılma ünvanı tələb olunur");
  }

  if (typeof shippingAddress === 'string' || typeof shippingAddress === 'object') {
    return shippingAddress;
  }

  return badRequestResponse("Invalid shipping address format / Yanlış çatdırılma ünvanı formatı");
}

/**
 * Validate email / Email-i yoxla
 */
export function validateEmail(email: unknown): string | NextResponse {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return badRequestResponse("Email is required / Email tələb olunur");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return badRequestResponse("Invalid email format / Yanlış email formatı");
  }

  return email;
}

/**
 * Validate order ID / Sifariş ID-ni yoxla
 */
export function validateOrderId(orderId: unknown): string | NextResponse {
  if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
    return badRequestResponse("Order ID is required / Sifariş ID tələb olunur");
  }
  return orderId;
}

