/**
 * Advanced Checkout Service / Təkmilləşdirilmiş Checkout Xidməti
 * Enterprise-level checkout with multiple steps
 * Çoxaddımlı enterprise səviyyəli checkout
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';
import { paymentService, PaymentMethodType, PaymentStatus } from '@/lib/payments/payment-methods';
import { currencyService, CurrencyCode } from '@/lib/currency/currency-service';
import { emitRealtimeEvent } from '@/lib/realtime/sse';

/**
 * Checkout step enum / Checkout addım enum-u
 */
export enum CheckoutStep {
  CART_REVIEW = 'cart_review',
  SHIPPING_ADDRESS = 'shipping_address',
  SHIPPING_METHOD = 'shipping_method',
  PAYMENT_METHOD = 'payment_method',
  ORDER_REVIEW = 'order_review',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Checkout session interface / Checkout sessiyası interfeysi
 */
export interface CheckoutSession {
  id: string;
  userId: string;
  cartId: string;
  currentStep: CheckoutStep;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethodType;
  currency: CurrencyCode;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
  giftCard?: GiftCard;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

/**
 * Shipping address interface / Çatdırılma ünvanı interfeysi
 */
export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}

/**
 * Shipping method interface / Çatdırılma metodu interfeysi
 */
export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: { min: number; max: number };
  carrier: string;
  trackingAvailable: boolean;
}

/**
 * Gift card interface / Hədiyyə kartı interfeysi
 */
export interface GiftCard {
  code: string;
  balance: number;
  amountUsed: number;
}

/**
 * Order item interface / Sifariş elementi interfeysi
 */
export interface CheckoutItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  stock: number;
  attributes?: Record<string, string>;
}

/**
 * Checkout result interface / Checkout nəticəsi interfeysi
 */
export interface CheckoutResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  paymentStatus?: PaymentStatus;
  redirectUrl?: string;
  error?: string;
}

/**
 * Advanced Checkout Service / Təkmilləşdirilmiş Checkout Xidməti
 */
class AdvancedCheckoutService {
  private readonly sessionExpiry = 30 * 60 * 1000; // 30 minutes / 30 dəqiqə

  /**
   * Create checkout session / Checkout sessiyası yarat
   */
  async createSession(userId: string, cartId: string, currency: CurrencyCode = 'AZN'): Promise<CheckoutSession> {
    try {
      // Get cart items / Səbət elementlərini al
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty / Səbət boşdur');
      }

      // Calculate totals / Cəmləri hesabla
      const subtotal = cart.items.reduce((sum, item) => {
        return sum + parseFloat(item.product.price.toString()) * item.quantity;
      }, 0);

      const session: CheckoutSession = {
        id: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        cartId,
        currentStep: CheckoutStep.CART_REVIEW,
        currency,
        subtotal,
        shippingCost: 0,
        tax: 0,
        discount: 0,
        total: subtotal,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + this.sessionExpiry),
      };

      logger.info('Checkout session created / Checkout sessiyası yaradıldı', {
        sessionId: session.id,
        userId,
        cartId,
      });

      return session;
    } catch (error) {
      logger.error('Failed to create checkout session / Checkout sessiyası yaratmaq uğursuz oldu', error);
      throw error;
    }
  }

  /**
   * Update shipping address / Çatdırılma ünvanını yenilə
   */
  async setShippingAddress(
    session: CheckoutSession,
    address: ShippingAddress
  ): Promise<CheckoutSession> {
    session.shippingAddress = address;
    session.currentStep = CheckoutStep.SHIPPING_METHOD;
    session.updatedAt = new Date();

    logger.info('Shipping address set / Çatdırılma ünvanı təyin edildi', {
      sessionId: session.id,
      city: address.city,
      country: address.country,
    });

    return session;
  }

  /**
   * Set billing address / Faktura ünvanını təyin et
   */
  async setBillingAddress(
    session: CheckoutSession,
    address: ShippingAddress,
    sameAsShipping: boolean = false
  ): Promise<CheckoutSession> {
    if (sameAsShipping && session.shippingAddress) {
      session.billingAddress = { ...session.shippingAddress };
    } else {
      session.billingAddress = address;
    }
    session.updatedAt = new Date();

    return session;
  }

  /**
   * Get available shipping methods / Mövcud çatdırılma metodlarını al
   */
  async getShippingMethods(
    session: CheckoutSession
  ): Promise<ShippingMethod[]> {
    const address = session.shippingAddress;
    if (!address) {
      return [];
    }

    // Mock shipping methods - in production, integrate with shipping providers
    // Mock çatdırılma metodları - production-da çatdırılma provider-ləri ilə inteqrasiya et
    const methods: ShippingMethod[] = [
      {
        id: 'standard',
        name: 'Standard Delivery / Standart Çatdırılma',
        description: 'Delivered in 5-7 business days / 5-7 iş günü ərzində çatdırılır',
        price: session.subtotal > 100 ? 0 : 5.99,
        estimatedDays: { min: 5, max: 7 },
        carrier: 'Yusu Logistics',
        trackingAvailable: true,
      },
      {
        id: 'express',
        name: 'Express Delivery / Ekspress Çatdırılma',
        description: 'Delivered in 2-3 business days / 2-3 iş günü ərzində çatdırılır',
        price: 12.99,
        estimatedDays: { min: 2, max: 3 },
        carrier: 'Yusu Express',
        trackingAvailable: true,
      },
      {
        id: 'same_day',
        name: 'Same Day Delivery / Eyni Gün Çatdırılma',
        description: 'Delivered today (order before 2 PM) / Bu gün çatdırılır (saat 14:00-a qədər sifariş ver)',
        price: 24.99,
        estimatedDays: { min: 0, max: 0 },
        carrier: 'Yusu Same Day',
        trackingAvailable: true,
      },
    ];

    // Filter by country availability / Ölkə mövcudluğuna görə filtrlə
    if (address.country !== 'AZ') {
      return methods.filter((m) => m.id !== 'same_day');
    }

    return methods;
  }

  /**
   * Set shipping method / Çatdırılma metodunu təyin et
   */
  async setShippingMethod(
    session: CheckoutSession,
    methodId: string
  ): Promise<CheckoutSession> {
    const methods = await this.getShippingMethods(session);
    const method = methods.find((m) => m.id === methodId);

    if (!method) {
      throw new Error('Invalid shipping method / Yanlış çatdırılma metodu');
    }

    session.shippingMethod = method;
    session.shippingCost = method.price;
    session.currentStep = CheckoutStep.PAYMENT_METHOD;
    session.updatedAt = new Date();

    // Recalculate total / Cəmi yenidən hesabla
    this.recalculateTotal(session);

    logger.info('Shipping method set / Çatdırılma metodu təyin edildi', {
      sessionId: session.id,
      method: method.name,
      cost: method.price,
    });

    return session;
  }

  /**
   * Apply coupon code / Kupon kodunu tətbiq et
   */
  async applyCoupon(session: CheckoutSession, couponCode: string): Promise<{
    success: boolean;
    discount?: number;
    message: string;
  }> {
    try {
      // Validate coupon / Kuponu yoxla
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
        },
      });

      if (!coupon) {
        return { success: false, message: 'Invalid or expired coupon / Yanlış və ya müddəti bitmiş kupon' };
      }

      // Check minimum order amount / Minimum sifariş məbləğini yoxla
      if (coupon.minOrderAmount && session.subtotal < parseFloat(coupon.minOrderAmount.toString())) {
        return {
          success: false,
          message: `Minimum order amount is ${coupon.minOrderAmount} / Minimum sifariş məbləği ${coupon.minOrderAmount}`,
        };
      }

      // Check usage limit / İstifadə limitini yoxla
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { success: false, message: 'Coupon usage limit reached / Kupon istifadə limitinə çatdı' };
      }

      // Calculate discount / Endirimi hesabla
      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = session.subtotal * (parseFloat(coupon.discountValue.toString()) / 100);
        if (coupon.maxDiscount) {
          discount = Math.min(discount, parseFloat(coupon.maxDiscount.toString()));
        }
      } else {
        discount = parseFloat(coupon.discountValue.toString());
      }

      session.couponCode = couponCode.toUpperCase();
      session.discount = discount;
      session.updatedAt = new Date();
      this.recalculateTotal(session);

      logger.info('Coupon applied / Kupon tətbiq edildi', {
        sessionId: session.id,
        couponCode,
        discount,
      });

      return {
        success: true,
        discount,
        message: 'Coupon applied successfully / Kupon uğurla tətbiq edildi',
      };
    } catch (error) {
      logger.error('Failed to apply coupon / Kuponu tətbiq etmək uğursuz oldu', error);
      return { success: false, message: 'Failed to apply coupon / Kuponu tətbiq etmək uğursuz oldu' };
    }
  }

  /**
   * Remove coupon / Kuponu sil
   */
  async removeCoupon(session: CheckoutSession): Promise<CheckoutSession> {
    session.couponCode = undefined;
    session.discount = 0;
    session.updatedAt = new Date();
    this.recalculateTotal(session);

    return session;
  }

  /**
   * Apply gift card / Hədiyyə kartını tətbiq et
   */
  async applyGiftCard(session: CheckoutSession, giftCardCode: string): Promise<{
    success: boolean;
    balance?: number;
    message: string;
  }> {
    try {
      const giftCard = await prisma.giftCard.findFirst({
        where: {
          code: giftCardCode.toUpperCase(),
          isActive: true,
          expiresAt: { gte: new Date() },
        },
      });

      if (!giftCard || parseFloat(giftCard.balance.toString()) <= 0) {
        return { success: false, message: 'Invalid or empty gift card / Yanlış və ya boş hədiyyə kartı' };
      }

      const balance = parseFloat(giftCard.balance.toString());
      const amountToUse = Math.min(balance, session.total);

      session.giftCard = {
        code: giftCardCode.toUpperCase(),
        balance,
        amountUsed: amountToUse,
      };
      session.updatedAt = new Date();
      this.recalculateTotal(session);

      return {
        success: true,
        balance,
        message: `Gift card applied: ${amountToUse.toFixed(2)} / Hədiyyə kartı tətbiq edildi: ${amountToUse.toFixed(2)}`,
      };
    } catch (error) {
      logger.error('Failed to apply gift card / Hədiyyə kartını tətbiq etmək uğursuz oldu', error);
      return { success: false, message: 'Failed to apply gift card / Hədiyyə kartını tətbiq etmək uğursuz oldu' };
    }
  }

  /**
   * Set payment method / Ödəniş metodunu təyin et
   */
  async setPaymentMethod(
    session: CheckoutSession,
    method: PaymentMethodType
  ): Promise<CheckoutSession> {
    const availableMethods = paymentService.getAvailablePaymentMethods();

    if (!availableMethods.includes(method)) {
      throw new Error('Payment method not available / Ödəniş metodu mövcud deyil');
    }

    session.paymentMethod = method;
    session.currentStep = CheckoutStep.ORDER_REVIEW;
    session.updatedAt = new Date();

    return session;
  }

  /**
   * Recalculate total / Cəmi yenidən hesabla
   */
  private recalculateTotal(session: CheckoutSession): void {
    // Calculate tax (if applicable) / Vergini hesabla (tətbiq olunarsa)
    const taxRate = this.getTaxRate(session.shippingAddress?.country || 'AZ');
    session.tax = (session.subtotal - session.discount) * taxRate;

    // Calculate total / Cəmi hesabla
    session.total = session.subtotal + session.shippingCost + session.tax - session.discount;

    // Apply gift card / Hədiyyə kartını tətbiq et
    if (session.giftCard) {
      const giftCardAmount = Math.min(session.giftCard.balance, session.total);
      session.giftCard.amountUsed = giftCardAmount;
      session.total -= giftCardAmount;
    }

    // Ensure total is not negative / Cəmin mənfi olmadığından əmin ol
    session.total = Math.max(0, session.total);
  }

  /**
   * Get tax rate for country / Ölkə üçün vergi dərəcəsini al
   */
  private getTaxRate(country: string): number {
    const taxRates: Record<string, number> = {
      AZ: 0.18, // Azerbaijan VAT / Azərbaycan ƏDV
      US: 0.0, // No federal VAT / Federal ƏDV yoxdur
      UK: 0.20, // UK VAT / UK ƏDV
      DE: 0.19, // Germany VAT / Almaniya ƏDV
      TR: 0.18, // Turkey VAT / Türkiyə ƏDV
    };

    return taxRates[country] || 0;
  }

  /**
   * Process checkout / Checkout-u emal et
   */
  async processCheckout(session: CheckoutSession): Promise<CheckoutResult> {
    try {
      // Validate session / Sessiyanı yoxla
      if (!this.validateSession(session)) {
        return { success: false, error: 'Invalid checkout session / Yanlış checkout sessiyası' };
      }

      session.currentStep = CheckoutStep.PROCESSING;

      // Verify stock availability / Stok mövcudluğunu yoxla
      const stockCheck = await this.verifyStock(session);
      if (!stockCheck.success) {
        return { success: false, error: stockCheck.error };
      }

      // Create payment / Ödəniş yarat
      const payment = await paymentService.createPayment(
        session.paymentMethod!,
        session.total,
        session.currency,
        session.id,
        {
          userId: session.userId,
          cartId: session.cartId,
        }
      );

      if (!payment) {
        return { success: false, error: 'Failed to create payment / Ödəniş yaratmaq uğursuz oldu' };
      }

      // For redirect-based payments (PayPal) / Yönləndirmə əsaslı ödənişlər üçün (PayPal)
      if ('approvalUrl' in payment) {
        return {
          success: true,
          redirectUrl: payment.approvalUrl,
        };
      }

      // For client-side payments (Stripe) / Müştəri tərəfindən ödənişlər üçün (Stripe)
      if ('clientSecret' in payment) {
        return {
          success: true,
          orderId: session.id,
          paymentStatus: payment.status,
          redirectUrl: undefined, // Client handles payment / Müştəri ödənişi idarə edir
        };
      }

      // For manual payments (COD, Bank Transfer) / Manual ödənişlər üçün (Qapıda ödəmə, Bank Köçürməsi)
      const order = await this.createOrder(session);
      session.currentStep = CheckoutStep.COMPLETED;

      // Emit event / Hadisəni emit et
      emitRealtimeEvent('order.new', { orderId: order.id, userId: session.userId }, session.userId);

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentStatus: PaymentStatus.PENDING,
      };
    } catch (error) {
      logger.error('Checkout processing failed / Checkout emalı uğursuz oldu', error);
      session.currentStep = CheckoutStep.FAILED;
      return { success: false, error: 'Checkout failed / Checkout uğursuz oldu' };
    }
  }

  /**
   * Validate session / Sessiyanı yoxla
   */
  private validateSession(session: CheckoutSession): boolean {
    return !!(
      session.shippingAddress &&
      session.shippingMethod &&
      session.paymentMethod &&
      session.total > 0
    );
  }

  /**
   * Verify stock / Stoku yoxla
   */
  private async verifyStock(session: CheckoutSession): Promise<{ success: boolean; error?: string }> {
    const cart = await prisma.cart.findUnique({
      where: { id: session.cartId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return { success: false, error: 'Cart not found / Səbət tapılmadı' };
    }

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.product.name} / ${item.product.name} üçün kifayət qədər stok yoxdur`,
        };
      }
    }

    return { success: true };
  }

  /**
   * Create order / Sifariş yarat
   */
  private async createOrder(session: CheckoutSession): Promise<{ id: string; orderNumber: string }> {
    const orderNumber = `YS${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const cart = await prisma.cart.findUnique({
      where: { id: session.cartId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error('Cart not found / Səbət tapılmadı');
    }

    const order = await prisma.orders.create({
      data: {
        orderNumber,
        customerId: session.userId,
        status: 'PENDING',
        totalAmount: session.total,
        subtotalAmount: session.subtotal,
        shippingAmount: session.shippingCost,
        taxAmount: session.tax,
        discountAmount: session.discount,
        shippingAddress: JSON.stringify(session.shippingAddress),
        billingAddress: JSON.stringify(session.billingAddress || session.shippingAddress),
        paymentMethod: session.paymentMethod,
        notes: session.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            totalPrice: parseFloat(item.product.price.toString()) * item.quantity,
          })),
        },
      },
    });

    // Update product stock / Məhsul stokunu yenilə
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    // Clear cart / Səbəti təmizlə
    await prisma.cartItem.deleteMany({
      where: { cartId: session.cartId },
    });

    // Update coupon usage / Kupon istifadəsini yenilə
    if (session.couponCode) {
      await prisma.coupon.updateMany({
        where: { code: session.couponCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Update gift card balance / Hədiyyə kartı balansını yenilə
    if (session.giftCard && session.giftCard.amountUsed > 0) {
      await prisma.giftCard.updateMany({
        where: { code: session.giftCard.code },
        data: {
          balance: { decrement: session.giftCard.amountUsed },
        },
      });
    }

    logger.info('Order created / Sifariş yaradıldı', {
      orderId: order.id,
      orderNumber,
      userId: session.userId,
      total: session.total,
    });

    return { id: order.id, orderNumber };
  }
}

// Singleton instance / Singleton instance
export const advancedCheckoutService = new AdvancedCheckoutService();

