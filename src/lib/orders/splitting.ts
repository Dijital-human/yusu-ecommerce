/**
 * Order Splitting Service / Sifariş Bölgüsü Xidməti
 * Advanced order splitting functionality / Təkmilləşdirilmiş sifariş bölgüsü funksionallığı
 */

import { logger } from '@/lib/utils/logger';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  sellerId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryDate?: Date;
}

export interface OrderSplit {
  sellerId?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  deliveryDate?: Date;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

export interface SplitOptions {
  splitBySeller?: boolean;
  splitByAddress?: boolean;
  splitByDeliveryDate?: boolean;
  customAddresses?: Array<{
    itemIds: string[];
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>;
  customDeliveryDates?: Array<{
    itemIds: string[];
    deliveryDate: Date;
  }>;
}

/**
 * Split order by seller / Sifarişi satıcıya görə böl
 */
export function splitBySeller(items: OrderItem[]): OrderSplit[] {
  const splits = new Map<string, OrderSplit>();

  items.forEach((item) => {
    const sellerId = item.sellerId || 'default';
    
    if (!splits.has(sellerId)) {
      splits.set(sellerId, {
        sellerId,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      });
    }

    const split = splits.get(sellerId)!;
    split.items.push(item);
    split.subtotal += item.price * item.quantity;
  });

  // Calculate totals / Cəmləri hesabla
  Array.from(splits.values()).forEach((split) => {
    split.total = split.subtotal + split.shipping;
  });

  return Array.from(splits.values());
}

/**
 * Split order by shipping address / Sifarişi çatdırılma ünvanına görə böl
 */
export function splitByAddress(items: OrderItem[], defaultAddress?: OrderSplit['shippingAddress']): OrderSplit[] {
  const splits = new Map<string, OrderSplit>();

  items.forEach((item) => {
    const address = item.shippingAddress || defaultAddress;
    if (!address) {
      logger.warn('Item missing shipping address, skipping / Elementdə çatdırılma ünvanı yoxdur, atlanır', { itemId: item.id });
      return;
    }

    const addressKey = `${address.street}-${address.city}-${address.zipCode}`;
    
    if (!splits.has(addressKey)) {
      splits.set(addressKey, {
        shippingAddress: address,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      });
    }

    const split = splits.get(addressKey)!;
    split.items.push(item);
    split.subtotal += item.price * item.quantity;
  });

  // Calculate totals / Cəmləri hesabla
  Array.from(splits.values()).forEach((split) => {
    split.total = split.subtotal + split.shipping;
  });

  return Array.from(splits.values());
}

/**
 * Split order by delivery date / Sifarişi çatdırılma tarixinə görə böl
 */
export function splitByDeliveryDate(items: OrderItem[]): OrderSplit[] {
  const splits = new Map<string, OrderSplit>();

  items.forEach((item) => {
    const deliveryDate = item.deliveryDate || new Date();
    const dateKey = deliveryDate.toISOString().split('T')[0];
    
    if (!splits.has(dateKey)) {
      splits.set(dateKey, {
        deliveryDate,
        items: [],
        subtotal: 0,
        shipping: 0,
        total: 0,
      });
    }

    const split = splits.get(dateKey)!;
    split.items.push(item);
    split.subtotal += item.price * item.quantity;
  });

  // Calculate totals / Cəmləri hesabla
  Array.from(splits.values()).forEach((split) => {
    split.total = split.subtotal + split.shipping;
  });

  return Array.from(splits.values());
}

/**
 * Advanced order splitting with multiple criteria / Çoxlu meyarlarla təkmilləşdirilmiş sifariş bölgüsü
 */
export function splitOrder(items: OrderItem[], options: SplitOptions): OrderSplit[] {
  let splits: OrderSplit[] = [];

  // First, split by seller if requested / Əvvəlcə, tələb olunarsa satıcıya görə böl
  if (options.splitBySeller) {
    splits = splitBySeller(items);
  } else {
    // Start with single split / Tək bölgü ilə başla
    splits = [{
      items,
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      shipping: 0,
      total: 0,
    }];
  }

  // Then, split by address if requested / Sonra, tələb olunarsa ünvana görə böl
  if (options.splitByAddress) {
    const newSplits: OrderSplit[] = [];
    splits.forEach((split) => {
      const addressSplits = splitByAddress(split.items, split.shippingAddress);
      newSplits.push(...addressSplits);
    });
    splits = newSplits;
  }

  // Apply custom addresses if provided / Təmin edilibsə xüsusi ünvanları tətbiq et
  if (options.customAddresses) {
    options.customAddresses.forEach((custom) => {
      const split = splits.find((s) => 
        s.items.some((item) => custom.itemIds.includes(item.id))
      );
      if (split) {
        split.shippingAddress = custom.address;
      }
    });
  }

  // Then, split by delivery date if requested / Sonra, tələb olunarsa çatdırılma tarixinə görə böl
  if (options.splitByDeliveryDate) {
    const newSplits: OrderSplit[] = [];
    splits.forEach((split) => {
      const dateSplits = splitByDeliveryDate(split.items);
      newSplits.push(...dateSplits);
    });
    splits = newSplits;
  }

  // Apply custom delivery dates if provided / Təmin edilibsə xüsusi çatdırılma tarixlərini tətbiq et
  if (options.customDeliveryDates) {
    options.customDeliveryDates.forEach((custom) => {
      const split = splits.find((s) => 
        s.items.some((item) => custom.itemIds.includes(item.id))
      );
      if (split) {
        split.deliveryDate = custom.deliveryDate;
      }
    });
  }

  // Calculate final totals / Son cəmləri hesabla
  splits.forEach((split) => {
    split.subtotal = split.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    split.total = split.subtotal + split.shipping;
  });

  return splits;
}

/**
 * Preview order splits / Sifariş bölgülərinin önizləməsi
 */
export function previewOrderSplits(items: OrderItem[], options: SplitOptions): {
  splits: OrderSplit[];
  totalOrders: number;
  totalAmount: number;
  summary: {
    bySeller: Record<string, number>;
    byAddress: Record<string, number>;
    byDate: Record<string, number>;
  };
} {
  const splits = splitOrder(items, options);
  
  const summary = {
    bySeller: {} as Record<string, number>,
    byAddress: {} as Record<string, number>,
    byDate: {} as Record<string, number>,
  };

  splits.forEach((split) => {
    if (split.sellerId) {
      summary.bySeller[split.sellerId] = (summary.bySeller[split.sellerId] || 0) + split.total;
    }
    if (split.shippingAddress) {
      const addressKey = `${split.shippingAddress.city}, ${split.shippingAddress.state}`;
      summary.byAddress[addressKey] = (summary.byAddress[addressKey] || 0) + split.total;
    }
    if (split.deliveryDate) {
      const dateKey = split.deliveryDate.toISOString().split('T')[0];
      summary.byDate[dateKey] = (summary.byDate[dateKey] || 0) + split.total;
    }
  });

  const totalAmount = splits.reduce((sum, split) => sum + split.total, 0);

  return {
    splits,
    totalOrders: splits.length,
    totalAmount,
    summary,
  };
}

