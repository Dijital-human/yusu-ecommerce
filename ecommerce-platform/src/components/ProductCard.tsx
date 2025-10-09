'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { useStore, useCartActions } from '@/lib/store/useStore';

// Product interface / Məhsul interfeysi
interface Product {
  _id: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  slug: string;
  price: {
    current: number;
    original?: number;
    currency: 'AZN' | 'USD' | 'EUR';
  };
  images: string[];
  category: {
    _id: string;
    name: {
      az: string;
      en: string;
      ru: string;
    };
    slug: string;
  };
  brand?: string;
  tags: string[];
  stock: {
    quantity: number;
    trackStock: boolean;
  };
  rating: {
    average: number;
    count: number;
  };
  views: number;
  sales: number;
  featured: boolean;
  isActive: boolean;
}

// ProductCard props interface / ProductCard props interfeysi
interface ProductCardProps {
  product: Product;
  language?: 'az' | 'en' | 'ru';
  showWishlist?: boolean;
  showQuickView?: boolean;
  className?: string;
}

// ProductCard komponenti / ProductCard component
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language = 'az',
  showWishlist = true,
  showQuickView = true,
  className = '',
}) => {
  const { addToCart } = useCartActions();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = React.useState(false);

  // Handle add to cart / Səbətə əlavə et
  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price.current,
        quantity: 1,
        image: product.images[0] || '/placeholder-product.jpg',
      });
      
      // Show success message / Uğur mesajı göstər
      // Burada toast notification əlavə edə bilərsiniz
    } catch (error) {
      console.error('Səbətə əlavə etmək mümkün olmadı / Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wishlist toggle / Wishlist toggle
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    // Burada wishlist API çağırısı əlavə edə bilərsiniz
  };

  // Calculate discount percentage / Endirim faizini hesabla
  const discountPercentage = product.price.original && product.price.original > product.price.current
    ? Math.round(((product.price.original - product.price.current) / product.price.original) * 100)
    : 0;

  // Format price / Qiyməti formatla
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('az-AZ', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Check if product is in stock / Məhsulun stokda olub-olmadığını yoxla
  const isInStock = product.stock.trackStock ? product.stock.quantity > 0 : true;

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {/* Product Image / Məhsul şəkli */}
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name[language]}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Discount badge / Endirim nişanı */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Featured badge / Əsas nişanı */}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Əsas / Featured
          </div>
        )}
        
        {/* Action buttons / Əməliyyat düymələri */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            {/* Quick view button / Sürətli baxış düyməsi */}
            {showQuickView && (
              <button
                onClick={() => setShowQuickViewModal(true)}
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                title="Sürətli baxış / Quick view"
              >
                <Eye size={16} />
              </button>
            )}
            
            {/* Wishlist button / Wishlist düyməsi */}
            {showWishlist && (
              <button
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                }`}
                title={isWishlisted ? 'Wishlist-dən çıxar / Remove from wishlist' : 'Wishlist-ə əlavə et / Add to wishlist'}
              >
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Product Info / Məhsul məlumatları */}
      <div className="p-4">
        {/* Category / Kateqoriya */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {product.category.name[language]}
        </div>
        
        {/* Product Name / Məhsul adı */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 hover:text-primary-600 transition-colors duration-200">
            {product.name[language]}
          </h3>
        </Link>
        
        {/* Brand / Brend */}
        {product.brand && (
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
            {product.brand}
          </div>
        )}
        
        {/* Rating / Reytinq */}
        {product.rating.count > 0 && (
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${
                    i < Math.floor(product.rating.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              ({product.rating.count})
            </span>
          </div>
        )}
        
        {/* Price / Qiymət */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price.current, product.price.currency)}
            </span>
            {product.price.original && product.price.original > product.price.current && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price.original, product.price.currency)}
              </span>
            )}
          </div>
        </div>
        
        {/* Stock status / Stok statusu */}
        <div className="text-xs mb-3">
          {isInStock ? (
            <span className="text-green-600 dark:text-green-400">
              Stokda / In stock
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              Stokda yoxdur / Out of stock
            </span>
          )}
        </div>
        
        {/* Add to cart button / Səbətə əlavə et düyməsi */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            isInStock && !isLoading
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>
                {isInStock ? 'Səbətə əlavə et / Add to cart' : 'Stokda yoxdur / Out of stock'}
              </span>
            </>
          )}
        </button>
      </div>
      
      {/* Quick view modal / Sürətli baxış modal */}
      {showQuickViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sürətli baxış / Quick view
              </h3>
              <button
                onClick={() => setShowQuickViewModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <Image
                src={product.images[0] || '/placeholder-product.jpg'}
                alt={product.name[language]}
                width={300}
                height={300}
                className="w-full h-48 object-cover rounded-md"
              />
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {product.name[language]}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary-600">
                    {formatPrice(product.price.current, product.price.currency)}
                  </span>
                  <button
                    onClick={handleAddToCart}
                    disabled={!isInStock || isLoading}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Əlavə edilir...' : 'Səbətə əlavə et'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
