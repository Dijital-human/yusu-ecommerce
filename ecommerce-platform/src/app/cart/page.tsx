'use client';

import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, CreditCard, Truck, Shield } from 'lucide-react';

// Cart item interface / Səbət məhsulu interfeysi
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
  brand?: string;
}

// Cart page komponenti / Cart page component
export default function CartPage() {
  // State / Vəziyyət
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      productId: '1',
      name: 'Premium Wireless Headphones',
      price: 199.99,
      quantity: 1,
      image: '/placeholder-product.jpg',
      brand: 'TechBrand',
    },
    {
      id: '2',
      productId: '2',
      name: 'Smart Fitness Watch',
      price: 299.99,
      quantity: 2,
      image: '/placeholder-product.jpg',
      brand: 'FitTech',
    },
    {
      id: '3',
      productId: '3',
      name: 'Professional Camera Lens',
      price: 899.99,
      quantity: 1,
      image: '/placeholder-product.jpg',
      brand: 'PhotoPro',
    },
  ]);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Handle quantity update / Miqdar yeniləmə
  const handleQuantityUpdate = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setIsUpdating(id);
    try {
      setCartItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handle remove item / Məhsulu sil
  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Handle clear cart / Səbəti təmizlə
  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear the cart?')) {
      setCartItems([]);
    }
  };

  // Format price / Qiyməti formatla
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Calculate totals / Cəmləri hesabla
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.08; // 8% tax / 8% vergi
  const total = subtotal + shipping + tax;

  // Empty cart / Boş səbət
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add products to start shopping
            </p>
            <a
              href="/products"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <span>Browse products</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Başlıq */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {cartItems.length} items in your cart
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items / Səbət məhsulları */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {/* Cart header / Səbət başlığı */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Cart Items
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                    >
                      Clear cart
                    </button>
                  )}
                </div>
              </div>

              {/* Cart items list / Səbət məhsulları siyahısı */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product image / Məhsul şəkli */}
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      {/* Product info / Məhsul məlumatları */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {item.name}
                        </h3>
                        {item.brand && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.brand}
                          </p>
                        )}
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
            </div>
          </div>

          {/* Order summary / Sifariş xülasəsi */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3">
                {/* Subtotal / Alt cəmi */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Shipping / Çatdırılma */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>

                {/* Tax / Vergi */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(tax)}
                  </span>
                </div>

                {/* Total / Cəmi */}
                <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Checkout button / Ödəniş düyməsi */}
              <div className="mt-6 space-y-3">
                <a
                  href="/checkout"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Proceed to checkout</span>
                  <ArrowRight size={16} />
                </a>
                
                <a
                  href="/products"
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Continue shopping</span>
                </a>
              </div>

              {/* Security features / Təhlükəsizlik xüsusiyyətləri */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Shield size={16} />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck size={16} />
                    <span>Free shipping on orders over $100</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <CreditCard size={16} />
                    <span>Multiple payment methods</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
