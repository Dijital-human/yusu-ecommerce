'use client';

import React from 'react';
import ProductCard from './ProductCard';

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

// ProductGrid props interface / ProductGrid props interfeysi
interface ProductGridProps {
  products: Product[];
  language?: 'az' | 'en' | 'ru';
  showWishlist?: boolean;
  showQuickView?: boolean;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

// ProductGrid komponenti / ProductGrid component
const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  language = 'az',
  showWishlist = true,
  showQuickView = true,
  columns = 4,
  className = '',
  loading = false,
  error = null,
}) => {
  // Grid columns mapping / Grid sütun mapping
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  // Loading skeleton / Yükləmə skeleti
  const ProductSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse">
      <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-t-lg"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  // Error state / Xəta vəziyyəti
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-semibold mb-2">
          Xəta baş verdi / Error occurred
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {error}
        </div>
      </div>
    );
  }

  // Empty state / Boş vəziyyət
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">
          Məhsul tapılmadı / No products found
        </div>
        <div className="text-gray-400 dark:text-gray-500">
          Axtarış meyarlarınızı dəyişdirin və ya yenidən cəhd edin / Try changing your search criteria
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Products grid / Məhsullar grid */}
      <div className={`grid ${gridCols[columns]} gap-6`}>
        {loading ? (
          // Loading skeletons / Yükləmə skeletləri
          Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))
        ) : (
          // Products / Məhsullar
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              language={language}
              showWishlist={showWishlist}
              showQuickView={showQuickView}
            />
          ))
        )}
      </div>
      
      {/* Load more button / Daha çox yüklə düyməsi */}
      {!loading && products.length > 0 && (
        <div className="text-center mt-8">
          <button className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors duration-200">
            Daha çox yüklə / Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
