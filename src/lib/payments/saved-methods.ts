/**
 * Saved Payment Methods Service / Saxlanılmış Ödəniş Metodları Xidməti
 * Stripe integration for saved payment methods / Saxlanılmış ödəniş metodları üçün Stripe inteqrasiyası
 */

import Stripe from 'stripe';
import { logger } from '@/lib/utils/logger';
import {
  createPaymentMethod,
  deletePaymentMethod,
  CreatePaymentMethodData,
} from '@/lib/db/payment-methods';

// Initialize Stripe / Stripe-i başlat
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

/**
 * Create payment method in Stripe and save to database / Stripe-da ödəniş metodu yarat və veritabanına saxla
 */
export async function createStripePaymentMethod(
  userId: string,
  paymentMethodId: string,
  saveToDatabase: boolean = true
): Promise<{ success: boolean; paymentMethod?: any; error?: string }> {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured / Stripe konfiqurasiya edilməyib');
    }

    // Retrieve payment method from Stripe / Stripe-dan ödəniş metodunu al
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!paymentMethod) {
      throw new Error('Payment method not found / Ödəniş metodu tapılmadı');
    }

    // Attach payment method to customer / Ödəniş metodunu müştəriyə əlavə et
    // TODO: Get or create Stripe customer ID for user / İstifadəçi üçün Stripe müştəri ID-sini al və ya yarat
    // await stripe.paymentMethods.attach(paymentMethodId, {
    //   customer: customerId,
    // });

    // Extract card details / Kart detallarını çıxar
    const card = paymentMethod.card;
    if (!card) {
      throw new Error('Card details not found / Kart detalları tapılmadı');
    }

    // Save to database if requested / Əgər tələb olunarsa veritabanına saxla
    if (saveToDatabase) {
      const paymentMethodData: CreatePaymentMethodData = {
        userId,
        type: 'card',
        last4: card.last4,
        brand: card.brand,
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        stripePaymentMethodId: paymentMethod.id,
        isDefault: false,
      };

      await createPaymentMethod(paymentMethodData);
    }

    return {
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: {
          brand: card.brand,
          last4: card.last4,
          expMonth: card.exp_month,
          expYear: card.exp_year,
        },
      },
    };
  } catch (error) {
    logger.error('Failed to create Stripe payment method / Stripe ödəniş metodu yaratmaq uğursuz oldu', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment method',
    };
  }
}

/**
 * Detach payment method from Stripe customer / Ödəniş metodunu Stripe müştərisindən ayır
 */
export async function detachStripePaymentMethod(
  paymentMethodId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured / Stripe konfiqurasiya edilməyib');
    }

    // Detach payment method from customer / Ödəniş metodunu müştəridən ayır
    await stripe.paymentMethods.detach(paymentMethodId);

    // Delete from database / Veritabanından sil
    await deletePaymentMethod(paymentMethodId, userId);

    return { success: true };
  } catch (error) {
    logger.error('Failed to detach Stripe payment method / Stripe ödəniş metodunu ayırmaq uğursuz oldu', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to detach payment method',
    };
  }
}

/**
 * List payment methods for Stripe customer / Stripe müştərisi üçün ödəniş metodlarının siyahısı
 */
export async function listStripePaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured / Stripe konfiqurasiya edilməyib');
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data;
  } catch (error) {
    logger.error('Failed to list Stripe payment methods / Stripe ödəniş metodlarının siyahısını almaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Set default payment method for Stripe customer / Stripe müştərisi üçün default ödəniş metodunu təyin et
 */
export async function setDefaultStripePaymentMethod(
  customerId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!stripe) {
      throw new Error('Stripe is not configured / Stripe konfiqurasiya edilməyib');
    }

    // Update customer's default payment method / Müştərinin default ödəniş metodunu yenilə
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return { success: true };
  } catch (error) {
    logger.error('Failed to set default Stripe payment method / Default Stripe ödəniş metodunu təyin etmək uğursuz oldu', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set default payment method',
    };
  }
}

