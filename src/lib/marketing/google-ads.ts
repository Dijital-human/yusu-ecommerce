/**
 * Google Ads Service / Google Ads Xidməti
 * Provides Google Ads tracking functionality
 * Google Ads izləmə funksionallığı təmin edir
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

/**
 * Initialize Google Ads / Google Ads-i initialize et
 */
export function initGoogleAds(conversionId: string): void {
  if (typeof window === 'undefined') return;

  // Check if already initialized / Artıq initialize olunub-olunmadığını yoxla
  if (window.gtag) return;

  // Create script element / Script elementi yarat
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
  document.head.appendChild(script);

  // Initialize gtag / gtag-i initialize et
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag as any;

  gtag('js', new Date());
  gtag('config', conversionId);
}

/**
 * Track add_to_cart event / add_to_cart event-ini izlə
 */
export function trackAddToCart(product: {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
  }>;
}): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'add_to_cart', {
    currency: product.currency,
    value: product.value,
    items: product.items,
  });
}

/**
 * Track begin_checkout event / begin_checkout event-ini izlə
 */
export function trackBeginCheckout(value: number, currency: string, items: Array<{
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
}>): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'begin_checkout', {
    value,
    currency,
    items,
  });
}

/**
 * Track purchase event / purchase event-ini izlə
 */
export function trackPurchase(transactionId: string, value: number, currency: string, items: Array<{
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
}>): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value,
    currency,
    items,
  });
}

/**
 * Track view_item event / view_item event-ini izlə
 */
export function trackViewItem(product: {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
  }>;
}): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'view_item', {
    currency: product.currency,
    value: product.value,
    items: product.items,
  });
}

/**
 * Track add_to_wishlist event / add_to_wishlist event-ini izlə
 */
export function trackAddToWishlist(product: {
  currency: string;
  value: number;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
  }>;
}): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'add_to_wishlist', {
    currency: product.currency,
    value: product.value,
    items: product.items,
  });
}

