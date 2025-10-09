'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore, useCartActions, useCart, useCartTotal, useCartCount } from '@/lib/store/useStore';

// Cart props interface / Cart props interfeysi
interface CartProps {
  language?: 'az' | 'en' | 'ru';
  showCheckout?: boolean;
  className?: string;
}

// Cart komponenti / Cart component
const Cart: React.FC<CartProps> = ({
  language = 'az',
  showCheckout = true,
  className = '',
}) => {
  // Store state / Store vəziyyəti
  const cart = useCart();
  const cartTotal = useCartTotal();
  const cartCount = useCartCount();
  const { updateCartItem, removeFromCart, clearCart } = useCartActions();

  // Local state / Lokal vəziyyət
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Handle quantity update / Miqdar yeniləmə
  const handleQuantityUpdate = async (id: string, newQuantity: number) => {
    setIsUpdating(id);
    try {
      updateCartItem(id, newQuantity);
    } catch (error) {
      console.error('Miqdar yenilənmədi / Failed to update quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle remove item / Məhsulu sil
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  // Handle clear cart / Səbəti təmizlə
  const handleClearCart = () => {
    if (confirm('Səbəti təmizləmək istədiyinizə əminsiniz? / Are you sure you want to clear the cart?')) {
      clearCart();
    }
  };

  // Format price / Qiyməti formatla
  const formatPrice = (price: number, currency: string = 'AZN') => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Empty cart / Boş səbət
  if (cart.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center ${className}`}>
        <ShoppingBag size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Səbətiniz boşdur / Your cart is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Alış-verişə başlamaq üçün məhsullar əlavə edin / Add products to start shopping
        </p>
        <Link
          href="/products"
          className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors duration-200"
        >
          <span>Məhsullara bax / Browse products</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className}`}>
      {/* Cart header / Səbət başlığı */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Səbət / Cart ({cartCount})
          </h2>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
            >
              Səbəti təmizlə / Clear cart
            </button>
          )}
        </div>
      </div>

      {/* Cart items / Səbət məhsulları */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {cart.map((item) => (
          <div key={item.id} className="p-6">
            <div className="flex items-center space-x-4">
              {/* Product image / Məhsul şəkli */}
              <div className="relative w-16 h-16 flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.name[language]}
                  fill
                  className="object-cover rounded-md"
                  sizes="64px"
                />
              </div>

              {/* Product info / Məhsul məlumatları */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {item.name[language]}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(item.price)}
                </p>
                {item.variant && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Variant: {item.variant}
                  </p>
                )}
              </div>

              {/* Quantity controls / Miqdar idarəçiləri */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                  disabled={isUpdating === item.id || item.quantity <= 1}
                  className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Minus size={16} />
                </button>
                
                <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                  {isUpdating === item.id ? '...' : item.quantity}
                </span>
                
                <button
                  onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                  disabled={isUpdating === item.id}
                  className="p-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Item total / Məhsul cəmi */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              {/* Remove button / Sil düyməsi */}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart summary / Səbət xülasəsi */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          {/* Subtotal / Alt cəmi */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Alt cəmi / Subtotal:
            </span>
            <span className="text-gray-900 dark:text-white">
              {formatPrice(cartTotal)}
            </span>
          </div>

          {/* Shipping / Çatdırılma */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Çatdırılma / Shipping:
            </span>
            <span className="text-gray-900 dark:text-white">
              {cartTotal > 100 ? 'Pulsuz / Free' : formatPrice(10)}
            </span>
          </div>

          {/* Tax / Vergi */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Vergi / Tax:
            </span>
            <span className="text-gray-900 dark:text-white">
              {formatPrice(cartTotal * 0.18)}
            </span>
          </div>

          {/* Total / Cəmi */}
          <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-3">
            <span className="text-gray-900 dark:text-white">
              Cəmi / Total:
            </span>
            <span className="text-gray-900 dark:text-white">
              {formatPrice(cartTotal + (cartTotal > 100 ? 0 : 10) + (cartTotal * 0.18))}
            </span>
          </div>
        </div>

        {/* Checkout button / Ödəniş düyməsi */}
        {showCheckout && (
          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Ödənişə keç / Proceed to checkout</span>
              <ArrowRight size={16} />
            </Link>
            
            <Link
              href="/products"
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>Alış-verişə davam et / Continue shopping</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
