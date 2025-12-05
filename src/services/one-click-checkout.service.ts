/**
 * One-Click Checkout Service / Bir Klik Ödəniş Xidməti
 * Business logic for one-click checkout operations
 * Bir klik ödəniş əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { createOrder } from "./order.service";
import { parsePrice } from "@/lib/utils/price-helpers";

export interface OneClickCheckoutData {
  userId: string;
  productId: string;
  quantity: number;
  addressId?: string; // Use saved address / Saxlanılmış ünvanı istifadə et
  paymentMethodId?: string; // Use saved payment method / Saxlanılmış ödəniş metodunu istifadə et
}

/**
 * Get user's default address / İstifadəçinin default ünvanını al
 */
export async function getDefaultAddress(userId: string) {
  const address = await prisma.addresses.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  if (!address) {
    // Get first address if no default / Default yoxdursa ilk ünvanı al
    const firstAddress = await prisma.addresses.findFirst({
      where: { userId },
    });
    return firstAddress;
  }

  return address;
}

/**
 * Get user's default payment method / İstifadəçinin default ödəniş metodunu al
 */
export async function getDefaultPaymentMethod(userId: string) {
  // Note: Payment methods might be stored in a separate table or payment provider
  // Qeyd: Ödəniş metodları ayrı cədvəldə və ya ödəniş provayderində saxlanıla bilər
  // For now, return a default payment method / Hələlik default ödəniş metodunu qaytar
  return {
    type: "card",
    // In production, fetch from payment provider (Stripe, PayPal, etc.)
    // Production-da ödəniş provayderindən (Stripe, PayPal və s.) alın
  };
}

/**
 * Create one-click checkout order / Bir klik ödəniş sifarişi yarat
 */
export async function createOneClickCheckout(data: OneClickCheckoutData) {
  // Get product / Məhsulu al
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  if (!product.isActive || !product.isPublished || !product.isApproved) {
    throw new Error("Product is not available / Məhsul mövcud deyil");
  }

  if (product.stock < data.quantity) {
    throw new Error("Insufficient stock / Kifayət qədər stok yoxdur");
  }

  // Get default address / Default ünvanı al
  let shippingAddress;
  if (data.addressId) {
    const address = await prisma.addresses.findUnique({
      where: { id: data.addressId },
    });
    if (!address || address.userId !== data.userId) {
      throw new Error("Address not found or does not belong to user / Ünvan tapılmadı və ya istifadəçiyə aid deyil");
    }
    shippingAddress = {
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    };
  } else {
    const defaultAddress = await getDefaultAddress(data.userId);
    if (!defaultAddress) {
      throw new Error("No address found. Please add an address first / Ünvan tapılmadı. Əvvəlcə ünvan əlavə edin");
    }
    shippingAddress = {
      street: defaultAddress.street,
      city: defaultAddress.city,
      state: defaultAddress.state,
      zipCode: defaultAddress.zipCode,
      country: defaultAddress.country,
    };
  }

  // Get payment method / Ödəniş metodunu al
  let paymentMethod = "card"; // Default
  if (data.paymentMethodId) {
    // In production, fetch from payment provider
    // Production-da ödəniş provayderindən alın
    const savedPaymentMethod = await getDefaultPaymentMethod(data.userId);
    paymentMethod = savedPaymentMethod.type;
  } else {
    const defaultPaymentMethod = await getDefaultPaymentMethod(data.userId);
    paymentMethod = defaultPaymentMethod.type;
  }

  // Create order / Sifariş yarat
  const orderData = {
    items: [
      {
        productId: data.productId,
        quantity: data.quantity,
      },
    ],
    shippingAddress,
    paymentMethod,
    notes: "One-click checkout order / Bir klik ödəniş sifarişi",
  };

  const order = await createOrder(orderData, data.userId);

  logger.info("One-click checkout order created / Bir klik ödəniş sifarişi yaradıldı", {
    orderId: Array.isArray(order) ? order[0].id : order.id,
    userId: data.userId,
    productId: data.productId,
  });

  return Array.isArray(order) ? order[0] : order;
}

/**
 * Check if user is eligible for one-click checkout / İstifadəçinin bir klik ödəniş üçün uyğun olub olmadığını yoxla
 */
export async function checkOneClickEligibility(userId: string): Promise<{
  eligible: boolean;
  reasons: string[];
  hasAddress: boolean;
  hasPaymentMethod: boolean;
}> {
  const address = await getDefaultAddress(userId);
  const paymentMethod = await getDefaultPaymentMethod(userId);

  const reasons: string[] = [];
  let eligible = true;

  if (!address) {
    eligible = false;
    reasons.push("No saved address / Saxlanılmış ünvan yoxdur");
  }

  if (!paymentMethod) {
    eligible = false;
    reasons.push("No saved payment method / Saxlanılmış ödəniş metodu yoxdur");
  }

  return {
    eligible,
    reasons,
    hasAddress: !!address,
    hasPaymentMethod: !!paymentMethod,
  };
}

