/**
 * Checkout Utilities / Ödəniş Utility-ləri
 * Provides utilities for checkout process
 * Ödəniş prosesi üçün utility-lər təmin edir
 */

// CartItem type definition / CartItem tip tərifi
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number | string | any;
    images: string;
    stock: number;
    sellerId?: string;
    seller?: {
      id?: string;
      name: string | null;
    } | null;
  };
}

/**
 * Order split by seller / Satıcıya görə sifariş bölgüsü
 */
export interface OrderSplit {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  total: number;
}

/**
 * Split cart items by seller / Səbət elementlərini satıcıya görə böl
 */
export function splitCartBySeller(items: CartItem[]): OrderSplit[] {
  const ordersBySeller = new Map<string, OrderSplit>();

  items.forEach(item => {
    // Get sellerId from product - API-dən gələn product-dan sellerId-ni al
    // CartContext-də product.seller yoxdur, amma API-dən gələndə sellerId olmalıdır
    // For now, use productId as fallback and group by productId / Hələlik, productId-ni fallback kimi istifadə et və productId-yə görə qrupla
    const sellerId = (item.product as any).sellerId || item.productId; // Fallback to productId if sellerId not available
    const sellerName = (item.product as any).seller?.name || (item.product as any).sellerName || `Seller ${sellerId.slice(0, 8)}`;

    if (!ordersBySeller.has(sellerId)) {
      ordersBySeller.set(sellerId, {
        sellerId,
        sellerName,
        items: [],
        subtotal: 0,
        total: 0,
      });
    }

    const orderSplit = ordersBySeller.get(sellerId)!;
    orderSplit.items.push(item);
    
    const itemPrice = typeof item.product.price === 'object' 
      ? Number(item.product.price) 
      : typeof item.product.price === 'string'
      ? parseFloat(item.product.price)
      : item.product.price;
    
    const itemSubtotal = itemPrice * item.quantity;
    orderSplit.subtotal += itemSubtotal;
    orderSplit.total += itemSubtotal;
  });

  return Array.from(ordersBySeller.values());
}

/**
 * Calculate shipping cost / Çatdırılma xərclərini hesabla
 * This is a simple fallback function. For accurate rates, use the shipping API.
 * Bu sadə fallback funksiyadır. Dəqiq tariflər üçün shipping API istifadə edin.
 */
export function calculateShipping(items: CartItem[], address?: any): number {
  // Simple calculation - for accurate rates, use /api/shipping/rates
  // Sadə hesablama - dəqiq tariflər üçün /api/shipping/rates istifadə edin
  const subtotal = items.reduce((sum, item) => {
    const itemPrice = typeof item.product.price === 'object' 
      ? Number(item.product.price) 
      : typeof item.product.price === 'string'
      ? parseFloat(item.product.price)
      : item.product.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  // Free shipping for orders over 50 / 50-dən yuxarı sifarişlər üçün pulsuz çatdırılma
  return subtotal >= 50 ? 0 : 5;
}

/**
 * Validate shipping address / Çatdırılma ünvanını yoxla
 */
export function validateShippingAddress(address: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!address.street || address.street.trim().length === 0) {
    errors.push('Street address is required / Küçə ünvanı tələb olunur');
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.push('City is required / Şəhər tələb olunur');
  }

  if (!address.state || address.state.trim().length === 0) {
    errors.push('State/Province is required / Rayon/Ərazi tələb olunur');
  }

  if (!address.zipCode || address.zipCode.trim().length === 0) {
    errors.push('ZIP/Postal code is required / Poçt indeksi tələb olunur');
  }

  if (!address.country || address.country.trim().length === 0) {
    errors.push('Country is required / Ölkə tələb olunur');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate payment method / Ödəniş metodunu yoxla
 */
export function validatePaymentMethod(paymentMethod: {
  type: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  nameOnCard?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!paymentMethod.type) {
    errors.push('Payment method type is required / Ödəniş metodu tipi tələb olunur');
    return { valid: false, errors };
  }

  // For card payments, validate card details / Kart ödənişləri üçün kart təfərrüatlarını yoxla
  if (paymentMethod.type === 'card' || paymentMethod.type === 'stripe') {
    if (!paymentMethod.cardNumber || paymentMethod.cardNumber.replace(/\s/g, '').length < 13) {
      errors.push('Valid card number is required / Etibarlı kart nömrəsi tələb olunur');
    }

    if (!paymentMethod.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentMethod.expiryDate)) {
      errors.push('Valid expiry date (MM/YY) is required / Etibarlı son istifadə tarixi (MM/YY) tələb olunur');
    }

    if (!paymentMethod.cvv || paymentMethod.cvv.length < 3) {
      errors.push('Valid CVV is required / Etibarlı CVV tələb olunur');
    }

    if (!paymentMethod.nameOnCard || paymentMethod.nameOnCard.trim().length === 0) {
      errors.push('Name on card is required / Kartdakı ad tələb olunur');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format order summary / Sifariş xülasəsini formatla
 */
export function formatOrderSummary(orderSplits: OrderSplit[]): {
  totalItems: number;
  totalSubtotal: number;
  totalShipping: number;
  totalAmount: number;
} {
  const totalItems = orderSplits.reduce((sum, split) => 
    sum + split.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  const totalSubtotal = orderSplits.reduce((sum, split) => sum + split.subtotal, 0);
  const totalShipping = orderSplits.reduce((sum, split) => sum + (split.shipping || 0), 0);
  const totalAmount = totalSubtotal + totalShipping;

  return {
    totalItems,
    totalSubtotal,
    totalShipping,
    totalAmount,
  };
}

