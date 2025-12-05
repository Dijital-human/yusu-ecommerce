/**
 * Facebook Pixel Service / Facebook Pixel Xidməti
 * Provides Facebook Pixel tracking functionality
 * Facebook Pixel izləmə funksionallığı təmin edir
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, any>
    ) => void;
  }
}

/**
 * Initialize Facebook Pixel / Facebook Pixel-i initialize et
 */
export function initFacebookPixel(pixelId: string): void {
  if (typeof window === 'undefined') return;

  // Check if already initialized / Artıq initialize olunub-olunmadığını yoxla
  if (window.fbq) return;

  // Create script element / Script elementi yarat
  const script = document.createElement('script');
  script.innerHTML = `
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
  `;
  document.head.appendChild(script);
}

/**
 * Track AddToCart event / AddToCart event-ini izlə
 */
export function trackAddToCart(product: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'AddToCart', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
  });
}

/**
 * Track InitiateCheckout event / InitiateCheckout event-ini izlə
 */
export function trackInitiateCheckout(value: number, currency: string, contents: Array<{
  id: string;
  quantity: number;
  item_price: number;
}>): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'InitiateCheckout', {
    value,
    currency,
    contents,
  });
}

/**
 * Track Purchase event / Purchase event-ini izlə
 */
export function trackPurchase(orderId: string, value: number, currency: string, contents: Array<{
  id: string;
  quantity: number;
  item_price: number;
}>): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'Purchase', {
    value,
    currency,
    contents,
    order_id: orderId,
  });
}

/**
 * Track ViewContent event / ViewContent event-ini izlə
 */
export function trackViewContent(product: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'ViewContent', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
  });
}

/**
 * Track AddToWishlist event / AddToWishlist event-ini izlə
 */
export function trackAddToWishlist(product: {
  content_name: string;
  content_ids: string[];
  content_type: string;
  value: number;
  currency: string;
}): void {
  if (typeof window === 'undefined' || !window.fbq) return;

  window.fbq('track', 'AddToWishlist', {
    content_name: product.content_name,
    content_ids: product.content_ids,
    content_type: product.content_type,
    value: product.value,
    currency: product.currency,
  });
}

