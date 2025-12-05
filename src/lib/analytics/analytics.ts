/**
 * Analytics Service / Analytics Xidməti
 * Provides analytics tracking for user behavior, conversions, and product performance
 * İstifadəçi davranışı, konversiyalar və məhsul performansı üçün analytics izləmə təmin edir
 */

import { logger } from '@/lib/utils/logger';
import {
  sendGA4Event,
  trackGA4PageView,
  trackGA4Purchase,
  trackGA4AddToCart,
  trackGA4Search,
  isGoogleAnalyticsEnabled,
} from './google-analytics';

/**
 * Event types / Hadisə tipləri
 */
export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'product_click'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'checkout_complete'
  | 'purchase'
  | 'search'
  | 'filter'
  | 'category_view'
  | 'wishlist_add'
  | 'wishlist_remove'
  | 'review_submit'
  | 'signup'
  | 'login'
  | 'logout';

/**
 * Analytics event interface / Analytics hadisə interfeysi
 */
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

/**
 * Product performance metrics / Məhsul performans metrikaları
 */
export interface ProductMetrics {
  productId: string;
  views: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
  conversionRate: number;
  averageRating: number;
  reviewCount: number;
}

/**
 * Sales analytics / Satış analitikası
 */
export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ productId: string; revenue: number; orders: number }>;
  topCategories: Array<{ categoryId: string; revenue: number; orders: number }>;
  period: {
    start: string;
    end: string;
  };
}

// In-memory event storage (in production, use database or external analytics service)
// Yaddaşda hadisə saxlama (production-da veritabanı və ya xarici analytics xidməti istifadə edin)
const eventStore: AnalyticsEvent[] = [];

/**
 * Track analytics event / Analytics hadisəsini izlə
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Store event locally / Hadisəni lokal olaraq saxla
    eventStore.push(enrichedEvent);

    // Log event / Hadisəni log et
    logger.info('Analytics event tracked / Analytics hadisəsi izlənildi', {
      type: enrichedEvent.type,
      userId: enrichedEvent.userId,
      properties: enrichedEvent.properties,
    });

    // Send to Google Analytics 4 if enabled / Əgər aktivdirsə Google Analytics 4-ə göndər
    if (isGoogleAnalyticsEnabled()) {
      try {
        await sendGA4Event(
          enrichedEvent.type,
          enrichedEvent.properties || {},
          enrichedEvent.userId,
          enrichedEvent.sessionId
        );
      } catch (gaError) {
        logger.error('Failed to send event to GA4 / Hadisəni GA4-ə göndərmək uğursuz oldu', gaError instanceof Error ? gaError : new Error(String(gaError)));
      }
    }
  } catch (error) {
    logger.error('Failed to track analytics event / Analytics hadisəsini izləmək uğursuz oldu', error, event);
  }
}

/**
 * Track page view / Səhifə baxışını izlə
 */
export async function trackPageView(path: string, userId?: string, sessionId?: string): Promise<void> {
  trackEvent({
    type: 'page_view',
    userId,
    sessionId,
    properties: {
      path,
    },
  });

  // Also send to GA4 / Həmçinin GA4-ə göndər
  if (isGoogleAnalyticsEnabled()) {
    try {
      await trackGA4PageView(path, undefined, userId, sessionId);
    } catch (error) {
      logger.error('Failed to track page view in GA4 / GA4-də səhifə baxışını izləmək uğursuz oldu', error);
    }
  }
}

/**
 * Track product view / Məhsul baxışını izlə
 */
export function trackProductView(productId: string, userId?: string, sessionId?: string): void {
  trackEvent({
    type: 'product_view',
    userId,
    sessionId,
    properties: {
      productId,
    },
  });
}

/**
 * Track add to cart / Səbətə əlavə etməni izlə
 */
export async function trackAddToCart(productId: string, quantity: number, price: number, userId?: string, sessionId?: string, productName?: string): Promise<void> {
  trackEvent({
    type: 'add_to_cart',
    userId,
    sessionId,
    properties: {
      productId,
      quantity,
      price,
      value: quantity * price,
    },
  });

  // Also send to GA4 / Həmçinin GA4-ə göndər
  if (isGoogleAnalyticsEnabled() && productName) {
    try {
      await trackGA4AddToCart(productId, productName, price, quantity, userId, sessionId);
    } catch (error) {
      logger.error('Failed to track add to cart in GA4 / GA4-də səbətə əlavə etməni izləmək uğursuz oldu', error);
    }
  }
}

/**
 * Track purchase / Alışı izlə
 */
export async function trackPurchase(
  orderId: string,
  totalAmount: number,
  items: Array<{ productId: string; quantity: number; price: number; name?: string }>,
  userId?: string,
  sessionId?: string,
  currency: string = 'USD'
): Promise<void> {
  trackEvent({
    type: 'purchase',
    userId,
    sessionId,
    properties: {
      orderId,
      totalAmount,
      items,
      itemCount: items.length,
    },
  });

  // Also send to GA4 / Həmçinin GA4-ə göndər
  if (isGoogleAnalyticsEnabled()) {
    try {
      const ga4Items = items.map((item) => ({
        item_id: item.productId,
        item_name: item.name || item.productId,
        price: item.price,
        quantity: item.quantity,
      }));

      await trackGA4Purchase(orderId, totalAmount, currency, ga4Items, userId, sessionId);
    } catch (error) {
      logger.error('Failed to track purchase in GA4 / GA4-də alışı izləmək uğursuz oldu', error);
    }
  }
}

/**
 * Track search / Axtarışı izlə
 */
export async function trackSearch(query: string, resultCount: number, userId?: string, sessionId?: string): Promise<void> {
  trackEvent({
    type: 'search',
    userId,
    sessionId,
    properties: {
      query,
      resultCount,
    },
  });

  // Also send to GA4 / Həmçinin GA4-ə göndər
  if (isGoogleAnalyticsEnabled()) {
    try {
      await trackGA4Search(query, resultCount, userId, sessionId);
    } catch (error) {
      logger.error('Failed to track search in GA4 / GA4-də axtarışı izləmək uğursuz oldu', error);
    }
  }
}

/**
 * Get product metrics / Məhsul metrikalarını al
 */
export async function getProductMetrics(productId: string, startDate?: Date, endDate?: Date): Promise<ProductMetrics | null> {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days / Default: son 30 gün
    const end = endDate || new Date();

    const events = eventStore.filter(event => {
      if (event.timestamp) {
        const eventDate = new Date(event.timestamp);
        return eventDate >= start && eventDate <= end;
      }
      return false;
    });

    const productEvents = events.filter(event => 
      event.properties?.productId === productId
    );

    const views = productEvents.filter(e => e.type === 'product_view').length;
    const clicks = productEvents.filter(e => e.type === 'product_click').length;
    const addToCarts = productEvents.filter(e => e.type === 'add_to_cart').length;
    const purchases = productEvents.filter(e => e.type === 'purchase' && 
      e.properties?.items?.some((item: any) => item.productId === productId)
    ).length;

    const conversionRate = views > 0 ? (purchases / views) * 100 : 0;

    // TODO: Get average rating and review count from database
    // TODO: Veritabanından orta reytinq və rəy sayını al
    const averageRating = 0;
    const reviewCount = 0;

    return {
      productId,
      views,
      clicks,
      addToCarts,
      purchases,
      conversionRate,
      averageRating,
      reviewCount,
    };
  } catch (error) {
    logger.error('Failed to get product metrics / Məhsul metrikalarını almaq uğursuz oldu', error, { productId });
    return null;
  }
}

/**
 * Get sales analytics / Satış analitikasını al
 */
export async function getSalesAnalytics(startDate?: Date, endDate?: Date): Promise<SalesAnalytics | null> {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days / Default: son 30 gün
    const end = endDate || new Date();

    const events = eventStore.filter(event => {
      if (event.timestamp) {
        const eventDate = new Date(event.timestamp);
        return eventDate >= start && eventDate <= end;
      }
      return false;
    });

    const purchaseEvents = events.filter(e => e.type === 'purchase');

    let totalRevenue = 0;
    const productRevenue: Record<string, { revenue: number; orders: number }> = {};
    const categoryRevenue: Record<string, { revenue: number; orders: number }> = {};

    purchaseEvents.forEach(event => {
      const totalAmount = event.properties?.totalAmount || 0;
      totalRevenue += totalAmount;

      const items = event.properties?.items || [];
      items.forEach((item: any) => {
        const productId = item.productId;
        const itemRevenue = item.quantity * item.price;

        if (!productRevenue[productId]) {
          productRevenue[productId] = { revenue: 0, orders: 0 };
        }
        productRevenue[productId].revenue += itemRevenue;
        productRevenue[productId].orders += 1;

        // TODO: Get category from product
        // TODO: Məhsuldan kateqoriyanı al
      });
    });

    const totalOrders = purchaseEvents.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const topProducts = Object.entries(productRevenue)
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const topCategories = Object.entries(categoryRevenue)
      .map(([categoryId, data]) => ({ categoryId, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProducts,
      topCategories,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to get sales analytics / Satış analitikasını almaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Get user behavior analytics / İstifadəçi davranış analitikasını al
 */
export async function getUserBehaviorAnalytics(userId: string, startDate?: Date, endDate?: Date): Promise<Record<string, any> | null> {
  try {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const events = eventStore.filter(event => {
      if (event.userId === userId && event.timestamp) {
        const eventDate = new Date(event.timestamp);
        return eventDate >= start && eventDate <= end;
      }
      return false;
    });

    const pageViews = events.filter(e => e.type === 'page_view').length;
    const productViews = events.filter(e => e.type === 'product_view').length;
    const addToCarts = events.filter(e => e.type === 'add_to_cart').length;
    const purchases = events.filter(e => e.type === 'purchase').length;
    const searches = events.filter(e => e.type === 'search').length;

    return {
      userId,
      pageViews,
      productViews,
      addToCarts,
      purchases,
      searches,
      conversionRate: pageViews > 0 ? (purchases / pageViews) * 100 : 0,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    };
  } catch (error) {
    logger.error('Failed to get user behavior analytics / İstifadəçi davranış analitikasını almaq uğursuz oldu', error, { userId });
    return null;
  }
}

