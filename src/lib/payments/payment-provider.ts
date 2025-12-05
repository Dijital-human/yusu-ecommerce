/**
 * Payment Provider Abstraction / Ödəniş Provider Abstraction
 * Provides unified interface for multiple payment providers
 * Müxtəlif ödəniş provider-ləri üçün birləşdirilmiş interfeys təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Payment method types / Ödəniş metodu tipləri
 */
export type PaymentMethodType = 
  | 'stripe'
  | 'paypal'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer'
  | 'cash_on_delivery';

/**
 * Payment status / Ödəniş statusu
 */
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'canceled'
  | 'refunded';

/**
 * Payment result interface / Ödəniş nəticəsi interfeysi
 */
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  status: PaymentStatus;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Payment request interface / Ödəniş sorğusu interfeysi
 */
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  userId: string;
  paymentMethod: PaymentMethodType;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Payment provider interface / Ödəniş provider interfeysi
 */
export interface PaymentProvider {
  /**
   * Get provider name / Provider adını al
   */
  getName(): string;

  /**
   * Check if provider is enabled / Provider-in aktiv olub-olmadığını yoxla
   */
  isEnabled(): boolean;

  /**
   * Create payment / Ödəniş yarat
   */
  createPayment(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Verify payment / Ödənişi yoxla
   */
  verifyPayment(paymentId: string): Promise<PaymentResult>;

  /**
   * Refund payment / Ödənişi geri qaytar
   */
  refundPayment(paymentId: string, amount?: number): Promise<PaymentResult>;

  /**
   * Cancel payment / Ödənişi ləğv et
   */
  cancelPayment(paymentId: string): Promise<PaymentResult>;
}

/**
 * Stripe Payment Provider / Stripe Ödəniş Provider-i
 */
class StripeProvider implements PaymentProvider {
  private stripe: any;
  private enabled: boolean;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    this.enabled = !!stripeKey;

    if (this.enabled) {
      try {
        const Stripe = require('stripe').default;
        this.stripe = new Stripe(stripeKey, {
          apiVersion: '2025-09-30.clover',
        });
      } catch (error) {
        logger.error('Failed to initialize Stripe / Stripe-i başlatmaq uğursuz oldu', error);
        this.enabled = false;
      }
    }
  }

  getName(): string {
    return 'stripe';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.enabled || !this.stripe) {
      return {
        success: false,
        status: 'failed',
        error: 'Stripe is not configured / Stripe konfiqurasiya edilməyib',
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents / Sentə çevir
        currency: request.currency.toLowerCase(),
        metadata: {
          orderId: request.orderId,
          userId: request.userId,
          ...request.metadata,
        },
        description: `Order #${request.orderId.slice(-8).toUpperCase()}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        status: 'pending',
        metadata: {
          paymentIntentId: paymentIntent.id,
        },
      };
    } catch (error) {
      logger.error('Stripe payment creation failed / Stripe ödəniş yaratmaq uğursuz oldu', error, { orderId: request.orderId });
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment creation failed / Ödəniş yaratmaq uğursuz oldu',
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    if (!this.enabled || !this.stripe) {
      return {
        success: false,
        status: 'failed',
        error: 'Stripe is not configured / Stripe konfiqurasiya edilməyib',
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);
      
      const statusMap: Record<string, PaymentStatus> = {
        'requires_payment_method': 'pending',
        'requires_confirmation': 'pending',
        'requires_action': 'processing',
        'processing': 'processing',
        'succeeded': 'succeeded',
        'canceled': 'canceled',
      };

      return {
        success: paymentIntent.status === 'succeeded',
        paymentId: paymentIntent.id,
        status: statusMap[paymentIntent.status] || 'failed',
        metadata: {
          paymentIntent: paymentIntent,
        },
      };
    } catch (error) {
      logger.error('Stripe payment verification failed / Stripe ödəniş yoxlaması uğursuz oldu', error, { paymentId });
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment verification failed / Ödəniş yoxlaması uğursuz oldu',
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    if (!this.enabled || !this.stripe) {
      return {
        success: false,
        status: 'failed',
        error: 'Stripe is not configured / Stripe konfiqurasiya edilməyib',
      };
    }

    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        success: true,
        paymentId: refund.id,
        status: 'refunded',
        metadata: {
          refundId: refund.id,
        },
      };
    } catch (error) {
      logger.error('Stripe refund failed / Stripe geri qaytarma uğursuz oldu', error, { paymentId });
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Refund failed / Geri qaytarma uğursuz oldu',
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResult> {
    if (!this.enabled || !this.stripe) {
      return {
        success: false,
        status: 'failed',
        error: 'Stripe is not configured / Stripe konfiqurasiya edilməyib',
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentId);

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: 'canceled',
        metadata: {
          paymentIntent: paymentIntent,
        },
      };
    } catch (error) {
      logger.error('Stripe payment cancellation failed / Stripe ödəniş ləğv etmək uğursuz oldu', error, { paymentId });
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Payment cancellation failed / Ödəniş ləğv etmək uğursuz oldu',
      };
    }
  }
}

/**
 * PayPal Payment Provider / PayPal Ödəniş Provider-i
 */
class PayPalProvider implements PaymentProvider {
  private enabled: boolean;
  private clientId?: string;
  private clientSecret?: string;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.enabled = !!(this.clientId && this.clientSecret);
  }

  getName(): string {
    return 'paypal';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get PayPal access token / PayPal access token al
   */
  private async getAccessToken(): Promise<string | null> {
    if (!this.clientId || !this.clientSecret) {
      return null;
    }

    const isSandbox = process.env.PAYPAL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    try {
      const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        logger.error('Failed to get PayPal access token / PayPal access token almaq uğursuz oldu', new Error(`HTTP ${response.status}`));
        return null;
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      logger.error('Failed to get PayPal access token / PayPal access token almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!this.enabled) {
      return {
        success: false,
        status: 'failed',
        error: 'PayPal is not configured / PayPal konfiqurasiya edilməyib',
      };
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return {
        success: false,
        status: 'failed',
        error: 'Failed to authenticate with PayPal / PayPal ilə autentifikasiya uğursuz oldu',
      };
    }

    const isSandbox = process.env.PAYPAL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    try {
      // Create PayPal order / PayPal sifarişi yarat
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: request.orderId,
            amount: {
              currency_code: request.currency || 'USD',
              value: request.amount.toFixed(2),
            },
            description: request.description || `Order ${request.orderId}`,
          },
        ],
        application_context: {
          brand_name: 'Ulustore',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXTAUTH_URL}/payment/paypal/return`,
          cancel_url: `${process.env.NEXTAUTH_URL}/payment/paypal/cancel`,
        },
      };

      const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('PayPal order creation failed / PayPal sifariş yaratma uğursuz oldu', new Error(JSON.stringify(errorData)), { orderId: request.orderId });
        return {
          success: false,
          status: 'failed',
          error: `PayPal API error: ${response.status} / PayPal API xətası: ${response.status}`,
        };
      }

      const order = await response.json();
      const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;

      if (!approvalUrl) {
        return {
          success: false,
          status: 'failed',
          error: 'PayPal approval URL not found / PayPal təsdiq URL-i tapılmadı',
        };
      }

      return {
        success: true,
        status: 'pending' as PaymentStatus,
        paymentId: order.id,
        redirectUrl: approvalUrl,
      };
    } catch (error) {
      logger.error('PayPal payment creation failed / PayPal ödəniş yaratma uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { orderId: request.orderId });
      return {
        success: false,
        status: 'failed',
        error: 'Failed to create PayPal payment / PayPal ödəniş yaratmaq uğursuz oldu',
      };
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    if (!this.enabled) {
      return {
        success: false,
        status: 'failed',
        error: 'PayPal is not configured / PayPal konfiqurasiya edilməyib',
      };
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return {
        success: false,
        status: 'failed',
        error: 'Failed to authenticate with PayPal / PayPal ilə autentifikasiya uğursuz oldu',
      };
    }

    const isSandbox = process.env.PAYPAL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    try {
      // Get order details / Sifariş detallarını al
      const response = await fetch(`${baseUrl}/v2/checkout/orders/${paymentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        logger.error('PayPal order verification failed / PayPal sifariş yoxlaması uğursuz oldu', new Error(`HTTP ${response.status}`), { paymentId });
        return {
          success: false,
          status: 'failed',
          error: `PayPal API error: ${response.status} / PayPal API xətası: ${response.status}`,
        };
      }

      const order = await response.json();
      const status = order.status?.toLowerCase();

      // Capture payment if approved / Əgər təsdiqlənibsə ödənişi tut
      if (status === 'approved') {
        const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${paymentId}/capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!captureResponse.ok) {
          logger.error('PayPal payment capture failed / PayPal ödəniş tutma uğursuz oldu', new Error(`HTTP ${captureResponse.status}`), { paymentId });
          return {
            success: false,
            status: 'failed',
            error: 'Failed to capture payment / Ödəniş tutmaq uğursuz oldu',
          };
        }

        const captureData = await captureResponse.json();
        const captureStatus = captureData.status?.toLowerCase();

        return {
          success: captureStatus === 'completed',
          status: (captureStatus === 'completed' ? 'completed' : 'failed') as PaymentStatus,
          paymentId: captureData.id || paymentId,
        };
      }

      return {
        success: status === 'completed',
        status: (status === 'completed' ? 'completed' : status === 'approved' ? 'pending' : 'failed') as PaymentStatus,
        paymentId: order.id,
      };
    } catch (error) {
      logger.error('PayPal payment verification failed / PayPal ödəniş yoxlaması uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { paymentId });
      return {
        success: false,
        status: 'failed',
        error: 'Failed to verify PayPal payment / PayPal ödəniş yoxlaması uğursuz oldu',
      };
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    if (!this.enabled) {
      return {
        success: false,
        status: 'failed',
        error: 'PayPal is not configured / PayPal konfiqurasiya edilməyib',
      };
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return {
        success: false,
        status: 'failed',
        error: 'Failed to authenticate with PayPal / PayPal ilə autentifikasiya uğursuz oldu',
      };
    }

    const isSandbox = process.env.PAYPAL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    try {
      // Get capture ID from payment / Ödənişdən capture ID al
      // Note: paymentId should be the capture ID, not the order ID
      // Qeyd: paymentId capture ID olmalıdır, order ID deyil
      const refundData: any = {
        amount: amount
          ? {
              value: amount.toFixed(2),
              currency_code: 'USD',
            }
          : undefined,
      };

      const response = await fetch(`${baseUrl}/v2/payments/captures/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('PayPal refund failed / PayPal geri qaytarma uğursuz oldu', new Error(JSON.stringify(errorData)), { paymentId });
        return {
          success: false,
          status: 'failed',
          error: `PayPal API error: ${response.status} / PayPal API xətası: ${response.status}`,
        };
      }

      const refund = await response.json();
      const refundStatus = refund.status?.toLowerCase();

      return {
        success: refundStatus === 'completed',
        status: (refundStatus === 'completed' ? 'completed' : 'pending') as PaymentStatus,
        paymentId: refund.id || paymentId,
      };
    } catch (error) {
      logger.error('PayPal refund failed / PayPal geri qaytarma uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { paymentId });
      return {
        success: false,
        status: 'failed',
        error: 'Failed to process PayPal refund / PayPal geri qaytarma uğursuz oldu',
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResult> {
    if (!this.enabled) {
      return {
        success: false,
        status: 'failed',
        error: 'PayPal is not configured / PayPal konfiqurasiya edilməyib',
      };
    }

    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      return {
        success: false,
        status: 'failed',
        error: 'Failed to authenticate with PayPal / PayPal ilə autentifikasiya uğursuz oldu',
      };
    }

    const isSandbox = process.env.PAYPAL_ENVIRONMENT === 'sandbox';
    const baseUrl = isSandbox
      ? 'https://api.sandbox.paypal.com'
      : 'https://api.paypal.com';

    try {
      // Cancel order / Sifarişi ləğv et
      const response = await fetch(`${baseUrl}/v2/checkout/orders/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error('PayPal cancellation failed / PayPal ləğv etmə uğursuz oldu', new Error(JSON.stringify(errorData)), { paymentId });
        return {
          success: false,
          status: 'failed',
          error: `PayPal API error: ${response.status} / PayPal API xətası: ${response.status}`,
        };
      }

      return {
        success: true,
        status: 'cancelled' as PaymentStatus,
        paymentId,
      };
    } catch (error) {
      logger.error('PayPal cancellation failed / PayPal ləğv etmə uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { paymentId });
      return {
        success: false,
        status: 'failed',
        error: 'Failed to cancel PayPal payment / PayPal ödənişi ləğv etmək uğursuz oldu',
      };
    }
  }
}

/**
 * Bank Transfer Payment Provider / Bank Transfer Ödəniş Provider-i
 */
class BankTransferProvider implements PaymentProvider {
  getName(): string {
    return 'bank_transfer';
  }

  isEnabled(): boolean {
    return true; // Always enabled / Həmişə aktiv
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Bank transfer doesn't require immediate payment / Bank transfer dərhal ödəniş tələb etmir
    return {
      success: true,
      paymentId: `bank_transfer_${request.orderId}_${Date.now()}`,
      status: 'pending',
      metadata: {
        instructions: 'Please transfer the amount to the bank account provided / Xahiş olunur məbləği təmin edilən bank hesabına köçürün',
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
      },
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    // Bank transfer verification requires manual review / Bank transfer yoxlaması manual yoxlama tələb edir
    return {
      success: false,
      status: 'pending',
      error: 'Bank transfer requires manual verification / Bank transfer manual yoxlama tələb edir',
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    // Bank transfer refund requires manual processing / Bank transfer geri qaytarma manual emal tələb edir
    return {
      success: false,
      status: 'failed',
      error: 'Bank transfer refund requires manual processing / Bank transfer geri qaytarma manual emal tələb edir',
    };
  }

  async cancelPayment(paymentId: string): Promise<PaymentResult> {
    return {
      success: true,
      paymentId,
      status: 'canceled',
    };
  }
}

/**
 * Cash on Delivery Payment Provider / Çatdırılma zamanı nağd ödəniş Provider-i
 */
class CashOnDeliveryProvider implements PaymentProvider {
  getName(): string {
    return 'cash_on_delivery';
  }

  isEnabled(): boolean {
    return true; // Always enabled / Həmişə aktiv
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Cash on delivery doesn't require immediate payment / Çatdırılma zamanı nağd ödəniş dərhal ödəniş tələb etmir
    return {
      success: true,
      paymentId: `cod_${request.orderId}_${Date.now()}`,
      status: 'pending',
      metadata: {
        instructions: 'Payment will be collected on delivery / Ödəniş çatdırılma zamanı toplanacaq',
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
      },
    };
  }

  async verifyPayment(paymentId: string): Promise<PaymentResult> {
    // Cash on delivery verification happens on delivery / Çatdırılma zamanı nağd ödəniş yoxlaması çatdırılma zamanı baş verir
    return {
      success: false,
      status: 'pending',
      error: 'Cash on delivery verification happens on delivery / Çatdırılma zamanı nağd ödəniş yoxlaması çatdırılma zamanı baş verir',
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    // Cash on delivery refund requires manual processing / Çatdırılma zamanı nağd ödəniş geri qaytarma manual emal tələb edir
    return {
      success: false,
      status: 'failed',
      error: 'Cash on delivery refund requires manual processing / Çatdırılma zamanı nağd ödəniş geri qaytarma manual emal tələb edir',
    };
  }

  async cancelPayment(paymentId: string): Promise<PaymentResult> {
    return {
      success: true,
      paymentId,
      status: 'canceled',
    };
  }
}

/**
 * Payment Provider Manager / Ödəniş Provider Meneceri
 */
class PaymentProviderManager {
  private providers: Map<PaymentMethodType, PaymentProvider> = new Map();

  constructor() {
    // Initialize providers / Provider-ləri başlat
    this.providers.set('stripe', new StripeProvider());
    this.providers.set('paypal', new PayPalProvider());
    this.providers.set('bank_transfer', new BankTransferProvider());
    this.providers.set('cash_on_delivery', new CashOnDeliveryProvider());
    
    // Apple Pay and Google Pay use Stripe under the hood / Apple Pay və Google Pay Stripe istifadə edir
    this.providers.set('apple_pay', new StripeProvider());
    this.providers.set('google_pay', new StripeProvider());
  }

  /**
   * Get payment provider / Ödəniş provider-i al
   */
  getProvider(method: PaymentMethodType): PaymentProvider | null {
    return this.providers.get(method) || null;
  }

  /**
   * Get available payment methods / Mövcud ödəniş metodlarını al
   */
  getAvailableMethods(): PaymentMethodType[] {
    const available: PaymentMethodType[] = [];
    
    this.providers.forEach((provider, method) => {
      if (provider.isEnabled()) {
        available.push(method);
      }
    });

    return available;
  }

  /**
   * Check if payment method is available / Ödəniş metodunun mövcud olub-olmadığını yoxla
   */
  isMethodAvailable(method: PaymentMethodType): boolean {
    const provider = this.providers.get(method);
    return provider ? provider.isEnabled() : false;
  }
}

// Global payment provider manager instance / Qlobal ödəniş provider meneceri instance
export const paymentProviderManager = new PaymentProviderManager();

/**
 * Create payment using provider / Provider istifadə edərək ödəniş yarat
 */
export async function createPayment(request: PaymentRequest): Promise<PaymentResult> {
  const provider = paymentProviderManager.getProvider(request.paymentMethod);
  
  if (!provider) {
    return {
      success: false,
      status: 'failed',
      error: `Payment method ${request.paymentMethod} is not supported / Ödəniş metodu ${request.paymentMethod} dəstəklənmir`,
    };
  }

  if (!provider.isEnabled()) {
    return {
      success: false,
      status: 'failed',
      error: `Payment method ${request.paymentMethod} is not enabled / Ödəniş metodu ${request.paymentMethod} aktiv deyil`,
    };
  }

  return await provider.createPayment(request);
}

/**
 * Verify payment using provider / Provider istifadə edərək ödənişi yoxla
 */
export async function verifyPayment(paymentId: string, method: PaymentMethodType): Promise<PaymentResult> {
  const provider = paymentProviderManager.getProvider(method);
  
  if (!provider) {
    return {
      success: false,
      status: 'failed',
      error: `Payment method ${method} is not supported / Ödəniş metodu ${method} dəstəklənmir`,
    };
  }

  return await provider.verifyPayment(paymentId);
}

/**
 * Refund payment using provider / Provider istifadə edərək ödənişi geri qaytar
 */
export async function refundPayment(paymentId: string, method: PaymentMethodType, amount?: number): Promise<PaymentResult> {
  const provider = paymentProviderManager.getProvider(method);
  
  if (!provider) {
    return {
      success: false,
      status: 'failed',
      error: `Payment method ${method} is not supported / Ödəniş metodu ${method} dəstəklənmir`,
    };
  }

  return await provider.refundPayment(paymentId, amount);
}

/**
 * Cancel payment using provider / Provider istifadə edərək ödənişi ləğv et
 */
export async function cancelPayment(paymentId: string, method: PaymentMethodType): Promise<PaymentResult> {
  const provider = paymentProviderManager.getProvider(method);
  
  if (!provider) {
    return {
      success: false,
      status: 'failed',
      error: `Payment method ${method} is not supported / Ödəniş metodu ${method} dəstəklənmir`,
    };
  }

  return await provider.cancelPayment(paymentId);
}

