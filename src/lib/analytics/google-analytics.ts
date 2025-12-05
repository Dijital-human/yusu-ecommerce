/**
 * Google Analytics 4 Integration / Google Analytics 4 İnteqrasiyası
 * Provides GA4 event tracking / GA4 hadisə izləməsi təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Check if Google Analytics is enabled / Google Analytics-in aktiv olub-olmadığını yoxla
 */
export function isGoogleAnalyticsEnabled(): boolean {
  const enabled = process.env.GA_ENABLED !== 'false';
  return enabled && !!(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID
  );
}

/**
 * Get Google Analytics Measurement ID / Google Analytics Measurement ID-ni al
 */
export function getGAMeasurementId(): string | null {
  return (
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.GA_MEASUREMENT_ID ||
    null
  );
}

/**
 * Send event to Google Analytics 4 / Google Analytics 4-ə hadisə göndər
 * This function sends events to GA4 Measurement Protocol API
 * Bu funksiya hadisələri GA4 Measurement Protocol API-yə göndərir
 */
export async function sendGA4Event(
  eventName: string,
  parameters: Record<string, any> = {},
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  if (!isGoogleAnalyticsEnabled()) {
    logger.debug('Google Analytics is not enabled / Google Analytics aktiv deyil');
    return false;
  }

  const measurementId = getGAMeasurementId();
  if (!measurementId) {
    logger.warn('Google Analytics Measurement ID is not configured / Google Analytics Measurement ID konfiqurasiya edilməyib');
    return false;
  }

  try {
    const apiSecret = process.env.GA_API_SECRET;
    if (!apiSecret) {
      logger.warn('Google Analytics API Secret is not configured / Google Analytics API Secret konfiqurasiya edilməyib');
      return false;
    }

    const clientId = sessionId || `client_${Date.now()}_${Math.random()}`;
    const payload = {
      client_id: clientId,
      user_id: userId,
      events: [
        {
          name: eventName,
          params: {
            ...parameters,
            engagement_time_msec: 100,
            session_id: sessionId,
          },
        },
      ],
    };

    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Failed to send GA4 event / GA4 hadisəsini göndərmək uğursuz oldu', new Error(`HTTP ${response.status}`), {
        eventName,
        status: response.status,
      });
      return false;
    }

    logger.debug('GA4 event sent successfully / GA4 hadisəsi uğurla göndərildi', {
      eventName,
      userId,
    });

    return true;
  } catch (error) {
    logger.error('Failed to send GA4 event / GA4 hadisəsini göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
      eventName,
    });
    return false;
  }
}

/**
 * Track page view in GA4 / GA4-də səhifə baxışını izlə
 */
export async function trackGA4PageView(
  path: string,
  title?: string,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  return sendGA4Event(
    'page_view',
    {
      page_path: path,
      page_title: title,
    },
    userId,
    sessionId
  );
}

/**
 * Track purchase in GA4 / GA4-də alışı izlə
 */
export async function trackGA4Purchase(
  transactionId: string,
  value: number,
  currency: string = 'USD',
  items: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  return sendGA4Event(
    'purchase',
    {
      transaction_id: transactionId,
      value,
      currency,
      items,
    },
    userId,
    sessionId
  );
}

/**
 * Track add to cart in GA4 / GA4-də səbətə əlavə etməni izlə
 */
export async function trackGA4AddToCart(
  itemId: string,
  itemName: string,
  price: number,
  quantity: number,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  return sendGA4Event(
    'add_to_cart',
    {
      currency: 'USD',
      value: price * quantity,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          price,
          quantity,
        },
      ],
    },
    userId,
    sessionId
  );
}

/**
 * Track search in GA4 / GA4-də axtarışı izlə
 */
export async function trackGA4Search(
  searchTerm: string,
  resultCount: number,
  userId?: string,
  sessionId?: string
): Promise<boolean> {
  return sendGA4Event(
    'search',
    {
      search_term: searchTerm,
      result_count: resultCount,
    },
    userId,
    sessionId
  );
}

