/**
 * Multiple Payment Methods Service / Çoxsaylı Ödəniş Metodları Xidməti
 * Supports Stripe, PayPal, Apple Pay, Google Pay
 * Stripe, PayPal, Apple Pay, Google Pay dəstəkləyir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Payment method types / Ödəniş metod tipləri
 */
export enum PaymentMethodType {
  CARD = 'card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  INSTALLMENT = 'installment',
}

/**
 * Payment status / Ödəniş statusu
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

/**
 * Payment intent interface / Ödəniş intent interfeysi
 */
interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  paymentMethod: PaymentMethodType;
  metadata?: Record<string, string>;
}

/**
 * Payment result interface / Ödəniş nəticəsi interfeysi
 */
interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  message?: string;
  redirectUrl?: string;
}

/**
 * Stripe Payment Handler / Stripe Ödəniş Handler-i
 */
class StripePaymentHandler {
  private stripe: any = null;

  async initialize(): Promise<boolean> {
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('Stripe not configured / Stripe konfiqurasiya edilməyib');
      return false;
    }

    try {
      const Stripe = await import('stripe');
      this.stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      return true;
    } catch (error) {
      logger.error('Failed to initialize Stripe / Stripe-ı başlatmaq uğursuz oldu', error);
      return false;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent | null> {
    if (!this.stripe) await this.initialize();
    if (!this.stripe) return null;

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents / Sentlərə çevir
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      });

      return {
        id: intent.id,
        amount,
        currency,
        status: this.mapStripeStatus(intent.status),
        clientSecret: intent.client_secret,
        paymentMethod: PaymentMethodType.CARD,
        metadata,
      };
    } catch (error) {
      logger.error('Failed to create Stripe payment intent / Stripe ödəniş intent yaratmaq uğursuz oldu', error);
      return null;
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    if (!this.stripe) await this.initialize();
    if (!this.stripe) {
      return { success: false, status: PaymentStatus.FAILED, message: 'Stripe not initialized / Stripe başladılmayıb' };
    }

    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: intent.status === 'succeeded',
        transactionId: intent.id,
        status: this.mapStripeStatus(intent.status),
      };
    } catch (error) {
      logger.error('Failed to confirm Stripe payment / Stripe ödənişini təsdiqləmək uğursuz oldu', error);
      return { success: false, status: PaymentStatus.FAILED, message: 'Payment confirmation failed / Ödəniş təsdiqi uğursuz oldu' };
    }
  }

  async createApplePaySession(
    amount: number,
    currency: string,
    merchantId: string
  ): Promise<any> {
    if (!this.stripe) await this.initialize();
    if (!this.stripe) return null;

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          apple_pay: 'true',
        },
      });

      return {
        clientSecret: intent.client_secret,
        merchantId,
      };
    } catch (error) {
      logger.error('Failed to create Apple Pay session / Apple Pay sessiyası yaratmaq uğursuz oldu', error);
      return null;
    }
  }

  async createGooglePaySession(
    amount: number,
    currency: string
  ): Promise<any> {
    if (!this.stripe) await this.initialize();
    if (!this.stripe) return null;

    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        payment_method_types: ['card'],
        metadata: {
          google_pay: 'true',
        },
      });

      return {
        clientSecret: intent.client_secret,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      };
    } catch (error) {
      logger.error('Failed to create Google Pay session / Google Pay sessiyası yaratmaq uğursuz oldu', error);
      return null;
    }
  }

  private mapStripeStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: PaymentStatus.PENDING,
      requires_confirmation: PaymentStatus.PENDING,
      requires_action: PaymentStatus.PROCESSING,
      processing: PaymentStatus.PROCESSING,
      succeeded: PaymentStatus.SUCCEEDED,
      canceled: PaymentStatus.CANCELLED,
    };
    return statusMap[status] || PaymentStatus.PENDING;
  }

  async refund(paymentIntentId: string, amount?: number): Promise<PaymentResult> {
    if (!this.stripe) await this.initialize();
    if (!this.stripe) {
      return { success: false, status: PaymentStatus.FAILED, message: 'Stripe not initialized / Stripe başladılmayıb' };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: refund.status === 'succeeded',
        transactionId: refund.id,
        status: refund.status === 'succeeded' 
          ? (amount ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED)
          : PaymentStatus.FAILED,
      };
    } catch (error) {
      logger.error('Failed to process Stripe refund / Stripe geri ödəməsini emal etmək uğursuz oldu', error);
      return { success: false, status: PaymentStatus.FAILED, message: 'Refund failed / Geri ödəmə uğursuz oldu' };
    }
  }
}

/**
 * PayPal Payment Handler / PayPal Ödəniş Handler-i
 */
class PayPalPaymentHandler {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private get baseUrl(): string {
    return process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  async getAccessToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      logger.warn('PayPal credentials not configured / PayPal kredensialları konfiqurasiya edilməyib');
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`PayPal auth failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get PayPal access token / PayPal giriş token-i almaq uğursuz oldu', error);
      return null;
    }
  }

  async createOrder(
    amount: number,
    currency: string,
    orderId: string
  ): Promise<{ id: string; approvalUrl: string } | null> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return null;

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: orderId,
              amount: {
                currency_code: currency.toUpperCase(),
                value: amount.toFixed(2),
              },
            },
          ],
          application_context: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`PayPal create order failed: ${response.statusText}`);
      }

      const order = await response.json();
      const approvalLink = order.links.find((link: any) => link.rel === 'approve');

      return {
        id: order.id,
        approvalUrl: approvalLink?.href || '',
      };
    } catch (error) {
      logger.error('Failed to create PayPal order / PayPal sifarişi yaratmaq uğursuz oldu', error);
      return null;
    }
  }

  async captureOrder(paypalOrderId: string): Promise<PaymentResult> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return { success: false, status: PaymentStatus.FAILED, message: 'PayPal not initialized / PayPal başladılmayıb' };
    }

    try {
      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`PayPal capture failed: ${response.statusText}`);
      }

      const capture = await response.json();
      const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id;

      return {
        success: capture.status === 'COMPLETED',
        transactionId: captureId || capture.id,
        status: capture.status === 'COMPLETED' ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
      };
    } catch (error) {
      logger.error('Failed to capture PayPal order / PayPal sifarişini çəkmək uğursuz oldu', error);
      return { success: false, status: PaymentStatus.FAILED, message: 'Capture failed / Çəkmə uğursuz oldu' };
    }
  }

  async refund(captureId: string, amount?: number, currency?: string): Promise<PaymentResult> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return { success: false, status: PaymentStatus.FAILED, message: 'PayPal not initialized / PayPal başladılmayıb' };
    }

    try {
      const body: any = {};
      if (amount && currency) {
        body.amount = {
          value: amount.toFixed(2),
          currency_code: currency.toUpperCase(),
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`PayPal refund failed: ${response.statusText}`);
      }

      const refund = await response.json();

      return {
        success: refund.status === 'COMPLETED',
        transactionId: refund.id,
        status: refund.status === 'COMPLETED' 
          ? (amount ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED)
          : PaymentStatus.FAILED,
      };
    } catch (error) {
      logger.error('Failed to process PayPal refund / PayPal geri ödəməsini emal etmək uğursuz oldu', error);
      return { success: false, status: PaymentStatus.FAILED, message: 'Refund failed / Geri ödəmə uğursuz oldu' };
    }
  }
}

/**
 * Unified Payment Service / Birləşdirilmiş Ödəniş Xidməti
 */
class PaymentService {
  private stripeHandler: StripePaymentHandler;
  private paypalHandler: PayPalPaymentHandler;

  constructor() {
    this.stripeHandler = new StripePaymentHandler();
    this.paypalHandler = new PayPalPaymentHandler();
  }

  /**
   * Get available payment methods / Mövcud ödəniş metodlarını al
   */
  getAvailablePaymentMethods(): PaymentMethodType[] {
    const methods: PaymentMethodType[] = [];

    if (process.env.STRIPE_SECRET_KEY) {
      methods.push(PaymentMethodType.CARD);
      methods.push(PaymentMethodType.APPLE_PAY);
      methods.push(PaymentMethodType.GOOGLE_PAY);
    }

    if (process.env.PAYPAL_CLIENT_ID) {
      methods.push(PaymentMethodType.PAYPAL);
    }

    // Always available / Həmişə mövcud
    methods.push(PaymentMethodType.BANK_TRANSFER);
    methods.push(PaymentMethodType.CASH_ON_DELIVERY);

    return methods;
  }

  /**
   * Create payment / Ödəniş yarat
   */
  async createPayment(
    method: PaymentMethodType,
    amount: number,
    currency: string,
    orderId: string,
    metadata?: Record<string, string>
  ): Promise<PaymentIntent | { id: string; approvalUrl: string } | null> {
    switch (method) {
      case PaymentMethodType.CARD:
      case PaymentMethodType.APPLE_PAY:
      case PaymentMethodType.GOOGLE_PAY:
        return this.stripeHandler.createPaymentIntent(amount, currency, { ...metadata, orderId });

      case PaymentMethodType.PAYPAL:
        return this.paypalHandler.createOrder(amount, currency, orderId);

      case PaymentMethodType.BANK_TRANSFER:
      case PaymentMethodType.CASH_ON_DELIVERY:
        return {
          id: `manual_${orderId}`,
          amount,
          currency,
          status: PaymentStatus.PENDING,
          paymentMethod: method,
          metadata,
        };

      default:
        logger.warn('Unsupported payment method / Dəstəklənməyən ödəniş metodu', { method });
        return null;
    }
  }

  /**
   * Confirm payment / Ödənişi təsdiqlə
   */
  async confirmPayment(
    method: PaymentMethodType,
    paymentId: string
  ): Promise<PaymentResult> {
    switch (method) {
      case PaymentMethodType.CARD:
      case PaymentMethodType.APPLE_PAY:
      case PaymentMethodType.GOOGLE_PAY:
        return this.stripeHandler.confirmPayment(paymentId);

      case PaymentMethodType.PAYPAL:
        return this.paypalHandler.captureOrder(paymentId);

      case PaymentMethodType.BANK_TRANSFER:
      case PaymentMethodType.CASH_ON_DELIVERY:
        return {
          success: true,
          transactionId: paymentId,
          status: PaymentStatus.PENDING,
          message: 'Payment pending confirmation / Ödəniş təsdiq gözləyir',
        };

      default:
        return {
          success: false,
          status: PaymentStatus.FAILED,
          message: 'Unsupported payment method / Dəstəklənməyən ödəniş metodu',
        };
    }
  }

  /**
   * Process refund / Geri ödəməni emal et
   */
  async refund(
    method: PaymentMethodType,
    paymentId: string,
    amount?: number,
    currency?: string
  ): Promise<PaymentResult> {
    switch (method) {
      case PaymentMethodType.CARD:
      case PaymentMethodType.APPLE_PAY:
      case PaymentMethodType.GOOGLE_PAY:
        return this.stripeHandler.refund(paymentId, amount);

      case PaymentMethodType.PAYPAL:
        return this.paypalHandler.refund(paymentId, amount, currency);

      default:
        return {
          success: true,
          transactionId: `refund_${paymentId}`,
          status: amount ? PaymentStatus.PARTIALLY_REFUNDED : PaymentStatus.REFUNDED,
          message: 'Manual refund required / Manual geri ödəmə tələb olunur',
        };
    }
  }

  /**
   * Create Apple Pay session / Apple Pay sessiyası yarat
   */
  async createApplePaySession(amount: number, currency: string): Promise<any> {
    const merchantId = process.env.APPLE_PAY_MERCHANT_ID || '';
    return this.stripeHandler.createApplePaySession(amount, currency, merchantId);
  }

  /**
   * Create Google Pay session / Google Pay sessiyası yarat
   */
  async createGooglePaySession(amount: number, currency: string): Promise<any> {
    return this.stripeHandler.createGooglePaySession(amount, currency);
  }
}

// Singleton instance / Singleton instance
export const paymentService = new PaymentService();

export {
  PaymentMethodType,
  PaymentStatus,
  type PaymentIntent,
  type PaymentResult,
  StripePaymentHandler,
  PayPalPaymentHandler,
};

