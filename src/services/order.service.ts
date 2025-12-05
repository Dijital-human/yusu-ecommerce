/**
 * Order Service / Sifariş Xidməti
 * Business logic for order operations
 * Sifariş əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { invalidateOrderCache, invalidateRelatedCaches } from "@/lib/cache/cache-invalidator";
import { orderIncludeBasic } from "@/lib/db/selectors";
import { getOrderWithBasic, getOrderDetailsForEmail } from "@/lib/db/queries/order-queries";
import { validateOrderItems, validateShippingAddress } from "@/lib/api/validators";
import { parsePrice } from "@/lib/utils/price-helpers";
import { reserveStock, confirmReservation, cancelReservation } from "@/lib/inventory/inventory-manager";
import { emitRealtimeEvent } from "@/lib/realtime/sse";
import { emitOrderStatusUpdate } from "@/lib/realtime/realtime-service";
import { sendOrderConfirmation } from "@/lib/email";
import { sendNewOrderEmailToSeller } from "@/lib/notifications/seller-order-email";
import { logger } from "@/lib/utils/logger";
import { emitOrderCreated, emitOrderUpdated, emitOrderCancelled, emitOrderCompleted, emitOrderPaymentSucceeded, emitOrderPaymentFailed } from "@/lib/events/order-events";

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateOrderData {
  items: OrderItemRequest[];
  shippingAddress: any;
  paymentMethod?: string;
  notes?: string;
  guestEmail?: string;
  couponCode?: string;
  promotionId?: string;
  discountAmount?: number;
}

interface OrderDataBySeller {
  sellerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

/**
 * Create order(s) from cart items / Səbət elementlərindən sifariş(lər) yarat
 * Handles order splitting by seller, stock reservation, and notifications
 * Satıcıya görə sifariş bölgüsü, stok rezervasiyası və bildirişləri idarə edir
 */
export async function createOrder(data: CreateOrderData, userId: string) {
  // Validate input / Girişi yoxla
  const validatedItems = validateOrderItems(data.items);
  if (validatedItems instanceof Response) {
    throw new Error("Invalid order items / Etibarsız sifariş elementləri");
  }

  const validatedShippingAddress = validateShippingAddress(data.shippingAddress);
  if (validatedShippingAddress instanceof Response) {
    throw new Error("Invalid shipping address / Etibarsız çatdırılma ünvanı");
  }

  // Get cart items to create order / Sifariş yaratmaq üçün səbət elementlərini əldə et
    const cartItems = await prisma.cart_items.findMany({
    where: {
      userId,
      productId: {
        in: validatedItems.map((item) => item.productId),
      },
    },
    include: {
      product: true,
    },
  });

  if (cartItems.length === 0) {
    throw new Error("No items found in cart / Səbətdə element tapılmadı");
  }

  // Group items by seller / Elementləri satıcıya görə qrupla
  const ordersBySeller = new Map<string, OrderDataBySeller>();

  for (const cartItem of cartItems) {
    const sellerId = cartItem.product.sellerId;
    
    if (!ordersBySeller.has(sellerId)) {
      ordersBySeller.set(sellerId, {
        sellerId,
        items: [],
        totalAmount: 0,
      });
    }

    const orderData = ordersBySeller.get(sellerId)!;
    const itemQuantity = validatedItems.find((item) => item.productId === cartItem.productId)?.quantity || cartItem.quantity;
    
    const itemPrice = parsePrice(cartItem.product.price);
    
    orderData.items.push({
      productId: cartItem.productId,
      quantity: itemQuantity,
      price: itemPrice,
    });
    
    orderData.totalAmount += itemPrice * itemQuantity;
  }

  // Apply promotion discount if provided / Təmin edilibsə promosiya endirimini tətbiq et
  let totalDiscountAmount = data.discountAmount || 0;
  if (totalDiscountAmount > 0 && ordersBySeller.size > 0) {
    // Distribute discount proportionally across orders / Endirimi sifarişlər arasında mütənasib paylaş
    const totalAmount = Array.from(ordersBySeller.values()).reduce((sum, order) => sum + order.totalAmount, 0);
    let remainingDiscount = totalDiscountAmount;
    let processedOrders = 0;

    for (const [sellerId, orderData] of ordersBySeller) {
      processedOrders++;
      const isLastOrder = processedOrders === ordersBySeller.size;
      
      if (isLastOrder) {
        // Last order gets remaining discount to avoid rounding errors / Son sifariş qalan endirimi alır (yuvarlaqlaşdırma xətalarını qarşısını almaq üçün)
        orderData.totalAmount = Math.max(0, orderData.totalAmount - remainingDiscount);
      } else {
        const orderDiscount = (orderData.totalAmount / totalAmount) * totalDiscountAmount;
        orderData.totalAmount = Math.max(0, orderData.totalAmount - orderDiscount);
        remainingDiscount -= orderDiscount;
      }
    }
  }

  // Reserve stock for all items before creating orders / Sifarişlər yaratmazdan əvvəl bütün elementlər üçün stok rezerv et
  const reservations: Array<{ reservationId: string; productId: string; quantity: number }> = [];
  
  for (const [sellerId, orderData] of ordersBySeller) {
    for (const item of orderData.items) {
      const reservation = await reserveStock(item.productId, item.quantity, undefined, userId);
      if (reservation) {
        reservations.push({
          reservationId: reservation.id,
          productId: item.productId,
          quantity: item.quantity,
        });
      } else {
        // Cancel all reservations if one fails / Əgər biri uğursuz olarsa bütün rezervasiyaları ləğv et
        for (const res of reservations) {
          await cancelReservation(res.reservationId);
        }
        throw new Error(`Insufficient stock for product ${item.productId} / Məhsul ${item.productId} üçün kifayət qədər stok yoxdur`);
      }
    }
  }

  // Create orders for each seller / Hər satıcı üçün sifariş yarat
  const createdOrders = [];
  let reservationIndex = 0;

  for (const [sellerId, orderData] of ordersBySeller) {
      const order = await prisma.orders.create({
      data: {
        customerId: userId,
        sellerId: sellerId,
        status: "PENDING",
        totalAmount: orderData.totalAmount,
        shippingAddress: typeof validatedShippingAddress === 'string' 
          ? validatedShippingAddress 
          : JSON.stringify(validatedShippingAddress),
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          })),
        },
      },
      include: orderIncludeBasic,
    });

    createdOrders.push(order);

    // Confirm stock reservations for this order / Bu sifariş üçün stok rezervasiyalarını təsdiq et
    for (const item of orderData.items) {
      const reservation = reservations[reservationIndex++];
      if (reservation) {
        await confirmReservation(reservation.reservationId);
      }
    }

    // Send order confirmation email to customer / Müştəriyə sifariş təsdiq email-i göndər
    try {
      if (order.customer?.email) {
        const orderItems = order.items.map((item: { product: { name: string }; quantity: number; price: number | string }) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: parsePrice(item.price),
        }));

        await sendOrderConfirmation({
          email: order.customer.email,
          name: order.customer.name || "Customer",
          orderId: order.id,
          totalAmount: parsePrice(order.totalAmount),
          items: orderItems,
        });
      }
    } catch (emailError) {
      logger.error("Failed to send order confirmation email / Sifariş təsdiq email-i göndərmək uğursuz oldu", emailError);
      // Don't fail the order creation if email fails / Email uğursuz olarsa sifariş yaratmanı uğursuz etmə
    }

    // Send new order notification to seller / Satıcıya yeni sifariş bildirişi göndər
    try {
      if (order.seller?.email) {
        // Get order details for email / Email üçün sifariş təfərrüatlarını al
        const orderDetails = await getOrderDetailsForEmail(order.id);
        
        if (orderDetails && orderDetails.customer && orderDetails.items) {
          const formattedOrder = {
            id: orderDetails.id,
            customer: {
              id: orderDetails.customer.id,
              name: orderDetails.customer.name,
              email: orderDetails.customer.email,
            },
            totalAmount: parsePrice(orderDetails.totalAmount),
            shippingAddress: typeof orderDetails.shippingAddress === 'string' 
              ? orderDetails.shippingAddress 
              : JSON.stringify(orderDetails.shippingAddress),
            items: orderDetails.items.map((item: { product: { id: string; name: string; images: any }; quantity: number; price: number | string }) => ({
              product: {
                id: item.product.id,
                name: item.product.name,
                price: parsePrice(item.price),
                images: item.product.images,
              },
              variant: null,
              quantity: item.quantity,
              price: parsePrice(item.price),
            })),
            createdAt: orderDetails.createdAt,
          };
          
          await sendNewOrderEmailToSeller(formattedOrder, order.seller.email);
        }
      }
    } catch (emailError) {
      logger.error("Failed to send seller order notification / Satıcıya sifariş bildirişi göndərmək uğursuz oldu", emailError, { orderId: order.id });
    }

    // Emit order created event / Sifariş yaradıldı event-i emit et
    try {
      emitOrderCreated(order, userId);
    } catch (eventError) {
      logger.error("Failed to emit order created event / Sifariş yaradıldı event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { orderId: order.id });
    }
  }

  // Clear cart items after successful order creation / Uğurlu sifariş yaratmadan sonra səbət elementlərini təmizlə
  try {
    await prisma.cart_items.deleteMany({
      where: {
        userId,
        productId: {
          in: validatedItems.map((item) => item.productId),
        },
      },
    });
  } catch (cartError) {
    logger.error("Failed to clear cart items / Səbət elementlərini təmizləmək uğursuz oldu", cartError, { userId });
    // Don't fail the order creation if cart clearing fails / Səbət təmizlənməsi uğursuz olarsa sifariş yaratmanı uğursuz etmə
  }

  // Invalidate order-related caches / Sifariş ilə əlaqəli cache-ləri ləğv et
  try {
    for (const order of createdOrders) {
      await invalidateOrderCache(order.id, userId);
    }
    // Also invalidate user cache for order lists / Həmçinin sifariş siyahıları üçün istifadəçi cache-ini ləğv et
    await invalidateRelatedCaches('user', userId);
  } catch (cacheError) {
    logger.error("Failed to invalidate order cache / Sifariş cache-ini ləğv etmək uğursuz oldu", cacheError, { userId });
    // Don't fail the order creation if cache invalidation fails / Cache invalidation uğursuz olarsa sifariş yaratmanı uğursuz etmə
  }

  return createdOrders;
}

/**
 * Update order status / Sifariş statusunu yenilə
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
  userId: string,
  userRole: string,
  courierId?: string
) {
  // Check if order exists / Sifarişin mövcud olduğunu yoxla
  const existingOrder = await getOrderWithBasic(orderId);

  if (!existingOrder) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  // Check permissions based on user role / İstifadəçi roluna əsasən icazələri yoxla
  let canUpdate = false;
  let allowedStatuses: string[] = [];

  switch (userRole) {
    case "ADMIN":
      canUpdate = true;
      allowedStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
      break;
    case "SELLER":
      canUpdate = existingOrder.sellerId === userId;
      allowedStatuses = ["CONFIRMED", "SHIPPED", "CANCELLED"];
      break;
    case "COURIER":
      canUpdate = existingOrder.courierId === userId;
      allowedStatuses = ["SHIPPED", "DELIVERED"];
      break;
    case "CUSTOMER":
      canUpdate = existingOrder.customerId === userId;
      allowedStatuses = ["CANCELLED"]; // Only can cancel pending orders / Yalnız gözləyən sifarişləri ləğv edə bilər
      break;
  }

  if (!canUpdate) {
    throw new Error("Unauthorized / Yetkisiz");
  }

  if (status && !allowedStatuses.includes(status)) {
    throw new Error(`You can only update status to: ${allowedStatuses.join(", ")} / Yalnız bu statuslara yeniləyə bilərsiniz: ${allowedStatuses.join(", ")}`);
  }

  // Validate courier assignment / Kuryer təyinatını yoxla
  if (courierId && userRole === "ADMIN") {
    const courier = await prisma.users.findUnique({
      where: { id: courierId },
    });

    if (!courier || courier.role !== "COURIER") {
      throw new Error("Invalid courier / Yanlış kuryer");
    }
  }

  // Update order / Sifarişi yenilə
  const updateData: Record<string, any> = {};
  if (status) updateData.status = status;
  if (courierId) updateData.courierId = courierId;

  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: updateData,
    include: orderIncludeBasic,
  });

  // Emit order updated event / Sifariş yeniləndi event-i emit et
  try {
    emitOrderUpdated(orderId, {
      status: updatedOrder.status,
      courierId: updatedOrder.courierId,
      previousStatus: existingOrder.status,
    }, userId);

    // Emit real-time status update / Real-time status yeniləməsini emit et
    await emitOrderStatusUpdate(orderId, updatedOrder.status, existingOrder.customerId);

    // Emit specific events based on status / Status-a görə xüsusi event-lər emit et
    if (status === 'CANCELLED' && existingOrder.status !== 'CANCELLED') {
      emitOrderCancelled(orderId, undefined, userId);
    } else if (status === 'DELIVERED' && existingOrder.status !== 'DELIVERED') {
      emitOrderCompleted(orderId, userId);
    }
  } catch (eventError) {
    logger.error("Failed to emit order updated event / Sifariş yeniləndi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { orderId });
  }

  // Invalidate order-related caches / Sifariş ilə əlaqəli cache-ləri ləğv et
  try {
    await invalidateOrderCache(orderId, existingOrder.customerId);
    // Also invalidate user cache for order lists / Həmçinin sifariş siyahıları üçün istifadəçi cache-ini ləğv et
    if (existingOrder.customerId) {
      await invalidateRelatedCaches('user', existingOrder.customerId);
    }
    if (existingOrder.sellerId) {
      await invalidateRelatedCaches('user', existingOrder.sellerId);
    }
  } catch (cacheError) {
    logger.error("Failed to invalidate order cache / Sifariş cache-ini ləğv etmək uğursuz oldu", cacheError instanceof Error ? cacheError : new Error(String(cacheError)), { orderId });
    // Don't fail the order update if cache invalidation fails / Cache invalidation uğursuz olarsa sifariş yeniləməsini uğursuz etmə
  }

  return updatedOrder;
}

/**
 * Get user orders / İstifadəçi sifarişlərini al
 */
export async function getUserOrders(
  userId: string,
  userRole: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) {
  // Build where clause based on user role / İstifadəçi roluna əsasən where şərtini qur
  const where: Record<string, any> = {};

  if (userRole === "CUSTOMER") {
    where.customerId = userId;
  } else if (userRole === "SELLER") {
    where.sellerId = userId;
  } else if (userRole === "COURIER") {
    where.courierId = userId;
  }
  // Admin can see all orders / Admin bütün sifarişləri görə bilər

  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  // Get orders with pagination / Səhifələmə ilə sifarişləri əldə et
  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where,
      skip,
      take: limit,
      include: orderIncludeBasic,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.orders.count({ where }),
  ]);

  return { orders, total };
}

/**
 * Update order payment information / Sifariş ödəniş məlumatlarını yenilə
 * Used for updating payment intent ID and payment status / Ödəniş niyyəti ID və ödəniş statusunu yeniləmək üçün istifadə olunur
 */
export async function updateOrderPaymentInfo(
  orderId: string,
  data: {
    paymentIntentId?: string;
    status?: string;
    paymentStatus?: string;
  }
) {
  // Check if order exists / Sifarişin mövcud olduğunu yoxla
  const order = await getOrderWithBasic(orderId);
  if (!order) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  // Update order / Sifarişi yenilə
  const updateData: any = {};
  if (data.paymentIntentId !== undefined) updateData.paymentIntentId = data.paymentIntentId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;

  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: updateData,
    include: orderIncludeBasic,
  });

  // Emit order updated event / Sifariş yeniləndi event-i emit et
  try {
    emitOrderUpdated(orderId, {
      paymentIntentId: updatedOrder.paymentIntentId,
      paymentStatus: updatedOrder.paymentStatus,
      status: updatedOrder.status,
    }, order.customerId);

    // Emit real-time status update / Real-time status yeniləməsini emit et
    if (updatedOrder.status) {
      await emitOrderStatusUpdate(orderId, updatedOrder.status, order.customerId);
    }
  } catch (eventError) {
    logger.error("Failed to emit order updated event / Sifariş yeniləndi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { orderId });
  }

  return updatedOrder;
}

/**
 * Update order payment status / Sifariş ödəniş statusunu yenilə
 * Used for webhook handlers to update order status based on payment events
 * Webhook handler-ları üçün ödəniş hadisələrinə əsasən sifariş statusunu yeniləmək üçün istifadə olunur
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  data: {
    status: string;
    paymentStatus: string;
    paidAt?: Date;
  }
) {
  // Check if order exists / Sifarişin mövcud olduğunu yoxla
  const order = await getOrderWithBasic(orderId);
  if (!order) {
    throw new Error("Order not found / Sifariş tapılmadı");
  }

  const previousPaymentStatus = order.paymentStatus;

  // Update order / Sifarişi yenilə
  const updateData: any = {
    status: data.status,
    paymentStatus: data.paymentStatus,
  };
  
  if (data.paidAt !== undefined) {
    updateData.paidAt = data.paidAt;
  }

  const updatedOrder = await prisma.orders.update({
    where: { id: orderId },
    data: updateData,
    include: orderIncludeBasic,
  });

  // Emit payment events based on payment status / Ödəniş statusuna görə ödəniş event-ləri emit et
  try {
    emitOrderUpdated(orderId, {
      paymentStatus: updatedOrder.paymentStatus,
      status: updatedOrder.status,
      previousPaymentStatus,
    }, order.customerId);

    // Emit real-time status update / Real-time status yeniləməsini emit et
    if (updatedOrder.status) {
      await emitOrderStatusUpdate(orderId, updatedOrder.status, order.customerId);
    }

    // Emit specific payment events / Xüsusi ödəniş event-ləri emit et
    if (data.paymentStatus === 'PAID' && previousPaymentStatus !== 'PAID') {
      emitOrderPaymentSucceeded(orderId, updatedOrder.paymentIntentId || '', order.customerId);
    } else if (data.paymentStatus === 'FAILED' && previousPaymentStatus !== 'FAILED') {
      emitOrderPaymentFailed(orderId, order.customerId);
    }
  } catch (eventError) {
    logger.error("Failed to emit payment status event / Ödəniş statusu event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { orderId });
  }

  return updatedOrder;
}

