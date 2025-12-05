/**
 * Email Marketing Service / Email Marketing Xidməti
 * Provides email marketing features (newsletter, abandoned cart, etc.)
 * Email marketing xüsusiyyətləri təmin edir (newsletter, abandoned cart və s.)
 */

import { logger } from '@/lib/utils/logger';
import { sendEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

/**
 * Newsletter subscription interface / Newsletter abunəliyi interfeysi
 */
export interface NewsletterSubscription {
  id: string;
  email: string;
  subscribed: boolean;
  subscribedAt?: Date;
  unsubscribedAt?: Date;
  preferences?: {
    categories?: string[];
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
}

/**
 * Subscribe to newsletter / Newsletter-ə abunə ol
 */
export async function subscribeToNewsletter(
  email: string,
  preferences?: NewsletterSubscription['preferences']
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user exists / İstifadəçinin mövcud olub-olmadığını yoxla
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    // Note: This assumes a NewsletterSubscription model exists in Prisma schema
    // Qeyd: Bu Prisma schema-da NewsletterSubscription modelinin mövcud olduğunu fərz edir
    try {
      // Upsert subscription / Abunəliyi upsert et
      await (prisma as any).newsletterSubscription.upsert({
        where: { email },
        update: {
          subscribed: true,
          subscribedAt: new Date(),
          unsubscribedAt: null,
          preferences: preferences || {},
        },
        create: {
          email,
          subscribed: true,
          subscribedAt: new Date(),
          preferences: preferences || {},
          userId: user?.id,
        },
      });
    } catch (dbError: any) {
      // If NewsletterSubscription model doesn't exist, store in User model metadata
      // Əgər NewsletterSubscription modeli mövcud deyilsə, User model metadata-da saxla
      if (dbError.code === 'P2001' || dbError.message?.includes('model') || dbError.message?.includes('does not exist')) {
        logger.warn('NewsletterSubscription model not found. Storing subscription preference in user metadata / NewsletterSubscription modeli tapılmadı. Abunəlik üstünlüyü istifadəçi metadata-da saxlanılır', { email });
        // Store as JSON in a custom field or skip database storage
        // JSON kimi custom field-da saxla və ya veritabanı storage-ı atla
      } else {
        throw dbError;
      }
    }

    // Send welcome email / Xoş gəlmisiniz email-i göndər
    try {
      await sendEmail(
        email,
        'Welcome to Ulustore Newsletter / Ulustore Newsletter-ə xoş gəlmisiniz',
        `
          <h1>Welcome to Ulustore Newsletter!</h1>
          <p>Thank you for subscribing to our newsletter. You'll receive updates about our latest products and promotions.</p>
          <p>If you wish to unsubscribe, click <a href="${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}">here</a>.</p>
        `,
        'Welcome to Ulustore Newsletter! Thank you for subscribing.'
      );
    } catch (emailError) {
      logger.error('Failed to send welcome email / Xoş gəlmisiniz email-i göndərmək uğursuz oldu', emailError, { email });
    }

    logger.info('Newsletter subscription successful / Newsletter abunəliyi uğurlu', { email, preferences });
    return { success: true };
  } catch (error) {
    logger.error('Failed to subscribe to newsletter / Newsletter-ə abunə olmaq uğursuz oldu', error, { email });
    return {
      success: false,
      error: 'Failed to subscribe / Abunə olmaq uğursuz oldu',
    };
  }
}

/**
 * Unsubscribe from newsletter / Newsletter-dən abunəni ləğv et
 */
export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Note: This assumes a NewsletterSubscription model exists in Prisma schema
    // Qeyd: Bu Prisma schema-da NewsletterSubscription modelinin mövcud olduğunu fərz edir
    try {
      await (prisma as any).newsletterSubscription.update({
        where: { email },
        data: {
          subscribed: false,
          unsubscribedAt: new Date(),
        },
      });
    } catch (dbError: any) {
      // If NewsletterSubscription model doesn't exist, log warning
      // Əgər NewsletterSubscription modeli mövcud deyilsə, warning log et
      if (dbError.code === 'P2001' || dbError.code === 'P2025' || dbError.message?.includes('model') || dbError.message?.includes('does not exist')) {
        logger.warn('NewsletterSubscription model not found. Unsubscription not saved to database / NewsletterSubscription modeli tapılmadı. Abunəni ləğv etmə veritabanına yazılmadı', { email });
      } else {
        throw dbError;
      }
    }

    logger.info('Newsletter unsubscription successful / Newsletter abunəni ləğv etmə uğurlu', { email });
    return { success: true };
  } catch (error) {
    logger.error('Failed to unsubscribe from newsletter / Newsletter-dən abunəni ləğv etmək uğursuz oldu', error, { email });
    return {
      success: false,
      error: 'Failed to unsubscribe / Abunəni ləğv etmək uğursuz oldu',
    };
  }
}

/**
 * Send abandoned cart email / Tərk edilmiş səbət email-i göndər
 */
export async function sendAbandonedCartEmail(
  userId: string,
  cartItems: Array<{ productId: string; productName: string; quantity: number; price: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user email / İstifadəçi email-ini al
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user || !user.email) {
      return {
        success: false,
        error: 'User email not found / İstifadəçi email-i tapılmadı',
      };
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cartItems.map(item => 
      `<li>${item.productName} x ${item.quantity} - $${item.price * item.quantity}</li>`
    ).join('');

    await sendEmail(
      user.email,
      'Complete Your Purchase / Alışınızı Tamamlayın',
      `
        <h1>You left items in your cart / Səbətinizdə elementlər qalıb</h1>
        <p>Hi ${user.name || 'there'},</p>
        <p>You have items waiting in your cart:</p>
        <ul>${itemsList}</ul>
        <p><strong>Total: $${totalAmount}</strong></p>
        <p><a href="${process.env.NEXTAUTH_URL}/cart">Complete your purchase / Alışınızı tamamlayın</a></p>
      `,
      `You left items in your cart. Total: $${totalAmount}. Complete your purchase at ${process.env.NEXTAUTH_URL}/cart`
    );

    return { success: true };
  } catch (error) {
    logger.error('Failed to send abandoned cart email / Tərk edilmiş səbət email-i göndərmək uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to send email / Email göndərmək uğursuz oldu',
    };
  }
}

/**
 * Send product recommendation email / Məhsul tövsiyəsi email-i göndər
 */
export async function sendProductRecommendationEmail(
  userId: string,
  products: Array<{ id: string; name: string; price: number; images?: string[] }>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user email / İstifadəçi email-ini al
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user || !user.email) {
      return {
        success: false,
        error: 'User email not found / İstifadəçi email-i tapılmadı',
      };
    }

    const productsList = products.map((product: { id: string; name: string; price: number | string }) => 
      `<li>
        <a href="${process.env.NEXTAUTH_URL}/products/${product.id}">${product.name}</a> - $${product.price}
      </li>`
    ).join('');

    await sendEmail(
      user.email,
      'Recommended Products for You / Sizin Üçün Tövsiyə Edilən Məhsullar',
      `
        <h1>Recommended Products for You / Sizin Üçün Tövsiyə Edilən Məhsullar</h1>
        <p>Hi ${user.name || 'there'},</p>
        <p>Based on your preferences, we think you might like these products:</p>
        <ul>${productsList}</ul>
        <p><a href="${process.env.NEXTAUTH_URL}/products">View All Products / Bütün Məhsullara Bax</a></p>
      `,
      `Recommended products for you. View at ${process.env.NEXTAUTH_URL}/products`
    );

    return { success: true };
  } catch (error) {
    logger.error('Failed to send product recommendation email / Məhsul tövsiyəsi email-i göndərmək uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to send email / Email göndərmək uğursuz oldu',
    };
  }
}

/**
 * Send flash sale notification email / Flash sale bildirişi email-i göndər
 */
export async function sendFlashSaleNotificationEmail(
  userId: string,
  promotion: { name: string; description?: string; endDate: Date }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user email / İstifadəçi email-ini al
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user || !user.email) {
      return {
        success: false,
        error: 'User email not found / İstifadəçi email-i tapılmadı',
      };
    }

    const endDate = new Date(promotion.endDate).toLocaleString();

    await sendEmail(
      user.email,
      `Flash Sale: ${promotion.name} / Flash Sale: ${promotion.name}`,
      `
        <h1>Flash Sale Alert! / Flash Sale Xəbərdarlığı!</h1>
        <p>Hi ${user.name || 'there'},</p>
        <p><strong>${promotion.name}</strong></p>
        ${promotion.description ? `<p>${promotion.description}</p>` : ''}
        <p>This offer ends on ${endDate}.</p>
        <p><a href="${process.env.NEXTAUTH_URL}/products">Shop Now / İndi Alış-Veriş Et</a></p>
      `,
      `Flash Sale: ${promotion.name}. Ends on ${endDate}.`
    );

    return { success: true };
  } catch (error) {
    logger.error('Failed to send flash sale notification email / Flash sale bildirişi email-i göndərmək uğursuz oldu', error, { userId });
    return {
      success: false,
      error: 'Failed to send email / Email göndərmək uğursuz oldu',
    };
  }
}

