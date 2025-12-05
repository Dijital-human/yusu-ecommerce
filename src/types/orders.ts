/**
 * Order Type Definitions / Sifariş Tip Tərifləri
 * Centralized order-related type definitions
 * Mərkəzləşdirilmiş sifarişlə bağlı tip tərifləri
 */

import type { OrderItem as SharedOrderItem } from '@yusu/shared-types';

/**
 * Order Item for Email Notifications / Email Bildirişləri üçün Sifariş Elementi
 */
export interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
    images?: string | null;
  };
  variant?: {
    id: string;
    name: string;
  } | null;
  quantity: number;
  price: number;
}

/**
 * Order for Seller Email Notification / Satıcı Email Bildirişi üçün Sifariş
 */
export interface OrderForSellerEmail {
  id: string;
  customer: {
    id: string;
    name: string | null;
    email: string;
  };
  totalAmount: number;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: Date;
}

/**
 * Order Item Request (for API) / Sifariş Elementi Sorğusu (API üçün)
 */
export interface OrderItemRequest {
  productId: string;
  quantity: number;
  variantId?: string;
}

/**
 * Order Request (for API) / Sifariş Sorğusu (API üçün)
 */
export interface OrderRequest {
  items: OrderItemRequest[];
  shippingAddressId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  paymentMethod: string;
  paymentIntentId?: string;
}

/**
 * Re-export shared types / Paylaşılan tipləri yenidən export et
 */
export type { OrderItem as SharedOrderItem } from '@yusu/shared-types';

