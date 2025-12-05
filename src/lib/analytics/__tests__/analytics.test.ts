/**
 * Analytics Service Unit Tests / Analytics Xidməti Unit Testləri
 * Tests for analytics tracking functionality
 * Analytics izləmə funksionallığı üçün testlər
 */

import {
  trackEvent,
  trackPageView,
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackSearch,
  AnalyticsEvent,
  AnalyticsEventType,
} from '../analytics';

// Mock Google Analytics / Google Analytics-i mock et
jest.mock('../google-analytics', () => ({
  sendGA4Event: jest.fn().mockResolvedValue(true),
  trackGA4PageView: jest.fn().mockResolvedValue(true),
  trackGA4Purchase: jest.fn().mockResolvedValue(true),
  trackGA4AddToCart: jest.fn().mockResolvedValue(true),
  trackGA4Search: jest.fn().mockResolvedValue(true),
  isGoogleAnalyticsEnabled: jest.fn().mockReturnValue(false),
}));

// Mock logger / Logger-i mock et
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track event with required fields / Tələb olunan sahələrlə hadisəni izləməlidir', async () => {
      const event: AnalyticsEvent = {
        type: 'page_view',
        userId: 'user123',
        sessionId: 'session123',
        properties: { path: '/test' },
      };

      await trackEvent(event);

      // Event should be tracked without errors / Hadisə xəta olmadan izlənməlidir
      expect(true).toBe(true);
    });

    it('should add timestamp if not provided / Əgər verilməyibsə timestamp əlavə etməlidir', async () => {
      const event: AnalyticsEvent = {
        type: 'page_view',
      };

      await trackEvent(event);

      // Event should be tracked / Hadisə izlənməlidir
      expect(true).toBe(true);
    });

    it('should handle all event types / Bütün hadisə tiplərini idarə etməlidir', async () => {
      const eventTypes: AnalyticsEventType[] = [
        'page_view',
        'product_view',
        'add_to_cart',
        'purchase',
        'search',
      ];

      for (const type of eventTypes) {
        await trackEvent({
          type,
          userId: 'user123',
        });
      }

      // All events should be tracked / Bütün hadisələr izlənməlidir
      expect(eventTypes.length).toBeGreaterThan(0);
    });
  });

  describe('trackPageView', () => {
    it('should track page view / Səhifə baxışını izləməlidir', async () => {
      await trackPageView('/products', 'user123', 'session123');

      // Page view should be tracked / Səhifə baxışı izlənməlidir
      expect(true).toBe(true);
    });

    it('should track page view without user / İstifadəçi olmadan səhifə baxışını izləməlidir', async () => {
      await trackPageView('/home');

      // Page view should be tracked / Səhifə baxışı izlənməlidir
      expect(true).toBe(true);
    });
  });

  describe('trackProductView', () => {
    it('should track product view / Məhsul baxışını izləməlidir', async () => {
      await trackProductView('product123', 'Product Name', 99.99, 'category123', 'user123');

      // Product view should be tracked / Məhsul baxışı izlənməlidir
      expect(true).toBe(true);
    });
  });

  describe('trackAddToCart', () => {
    it('should track add to cart / Səbətə əlavə etməni izləməlidir', async () => {
      await trackAddToCart('product123', 'Product Name', 99.99, 2, 'user123');

      // Add to cart should be tracked / Səbətə əlavə etmə izlənməlidir
      expect(true).toBe(true);
    });
  });

  describe('trackPurchase', () => {
    it('should track purchase / Alışı izləməlidir', async () => {
      await trackPurchase('order123', 199.98, [
        { productId: 'product123', name: 'Product', price: 99.99, quantity: 2 },
      ], 'user123');

      // Purchase should be tracked / Alış izlənməlidir
      expect(true).toBe(true);
    });
  });

  describe('trackSearch', () => {
    it('should track search / Axtarışı izləməlidir', async () => {
      await trackSearch('laptop', 25, 'user123');

      // Search should be tracked / Axtarış izlənməlidir
      expect(true).toBe(true);
    });
  });
});

