/**
 * Checkout Service / Ödəniş Xidməti
 * Business logic for checkout operations
 * Ödəniş əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/utils/logger";
import { orderIncludeBasic } from "@/lib/db/selectors";

export interface GuestCheckoutData {
  email: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: string;
  notes?: string;
}

export interface GuestOrderTracking {
  orderId: string;
  email: string;
  trackingToken: string;
  createdAt: Date;
}

/**
 * Create guest order / Qonaq sifarişi yarat
 */
export async function createGuestOrder(data: GuestCheckoutData) {
  // Validate email / Email-i yoxla
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error("Invalid email address / Etibarsız email ünvanı");
  }

  // Check if user exists with this email / Bu email ilə istifadəçinin mövcud olub olmadığını yoxla
  const existingUser = await prisma.users.findUnique({
    where: { email: data.email },
  });

  let userId: string;
  let isNewGuest = false;

  if (existingUser) {
    // User exists, use their ID / İstifadəçi mövcuddur, onun ID-sindən istifadə et
    userId = existingUser.id;
  } else {
    // Create temporary guest user / Müvəqqəti qonaq istifadəçi yarat
    // Note: In production, you might want to create a proper guest user record
    // Qeyd: Production-da düzgün qonaq istifadəçi qeydi yaratmaq istəyə bilərsiniz
    const guestUser = await prisma.users.create({
      data: {
        email: data.email,
        name: `Guest ${data.email.split('@')[0]}`,
        role: "CUSTOMER",
        isActive: true,
        emailVerified: false,
      } as any,
    });
    userId = guestUser.id;
    isNewGuest = true;
    logger.info("Guest user created / Qonaq istifadəçi yaradıldı", { userId, email: data.email });
  }

  // Create order using existing order service / Mövcud sifariş xidmətindən istifadə edərək sifariş yarat
  // Import order service
  const { createOrder } = await import("./order.service");
  
  const orderData = {
    items: data.items,
    shippingAddress: data.shippingAddress,
    paymentMethod: data.paymentMethod,
    notes: data.notes,
    guestEmail: data.email,
  };

  const orders = await createOrder(orderData, userId);

  // createOrder returns an array or single order / createOrder array və ya tək sifariş qaytarır
  const ordersArray = Array.isArray(orders) ? orders : [orders];
  const firstOrder = ordersArray[0];
  
  if (!firstOrder) {
    throw new Error("Failed to create order / Sifariş yaratmaq uğursuz oldu");
  }

  // Generate tracking token for guest order / Qonaq sifarişi üçün izləmə token-i yarat
  const trackingToken = generateTrackingToken(data.email, firstOrder.id);

  logger.info("Guest order created / Qonaq sifarişi yaradıldı", {
    orderId: firstOrder.id,
    email: data.email,
    isNewGuest,
  });

  return {
    orders: ordersArray,
    trackingToken,
    isNewGuest,
  };
}

/**
 * Track guest order by email and tracking token / Email və izləmə token-i ilə qonaq sifarişini izlə
 */
export async function trackGuestOrder(email: string, trackingToken: string) {
  // Get user by email / Email ilə istifadəçini al
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return [];
  }

  // Verify tracking token / İzləmə token-ini yoxla
  const orders = await prisma.orders.findMany({
    where: {
      customerId: user.id,
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days / Son 90 gün
      },
    },
    include: orderIncludeBasic as any, // Type assertion for Prisma include / Prisma include üçün type assertion
    orderBy: {
      createdAt: "desc",
    },
  });

  // Verify token matches / Token-in uyğun olduğunu yoxla
  const expectedToken = generateTrackingToken(email, orders[0]?.id || "");
  if (trackingToken !== expectedToken && orders.length > 0) {
    throw new Error("Invalid tracking token / Etibarsız izləmə token-i");
  }

  return orders;
}

/**
 * Get guest order by email / Email ilə qonaq sifarişini al
 */
export async function getGuestOrdersByEmail(email: string) {
  const user = await prisma.users.findUnique({
    where: { email },
  });

  if (!user) {
    return [];
  }

  const orders = await prisma.orders.findMany({
    where: {
      customerId: user.id,
    },
    include: orderIncludeBasic as any, // Type assertion for Prisma include / Prisma include üçün type assertion
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
}

/**
 * Generate tracking token for guest order / Qonaq sifarişi üçün izləmə token-i yarat
 */
function generateTrackingToken(email: string, orderId: string): string {
  // Simple token generation - in production, use a more secure method
  // Sadə token generasiyası - production-da daha təhlükəsiz metod istifadə edin
  const crypto = require("crypto");
  const secret = process.env.GUEST_ORDER_SECRET || "default-secret-change-in-production";
  const hash = crypto
    .createHmac("sha256", secret)
    .update(`${email}:${orderId}`)
    .digest("hex");
  return hash.substring(0, 16); // Use first 16 characters / İlk 16 simvolu istifadə et
}

/**
 * Verify guest order email / Qonaq sifariş email-ini yoxla
 */
export async function verifyGuestOrderEmail(email: string, orderId: string): Promise<boolean> {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return false;
  }

  const customer = await prisma.users.findUnique({
    where: { id: order.customerId },
  });

  if (!customer) {
    return false;
  }

  return customer.email === email;
}

