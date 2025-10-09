'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Grid, List, SlidersHorizontal, Star, Heart, ShoppingCart } from 'lucide-react';

// Product interface / Məhsul interfeysi
interface Product {
  id: string;
  name: string;
  slug: string;
  price: {
    current: number;
    original?: number;
    currency: string;
  };
  images: string[];
  category: {
    id: string;
    name: string;
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

// Product Card komponenti / Product Card component
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle add to cart / Səbətə əlavə et
  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // Add to cart logic / Səbətə əlavə etmə məntiqi
      console.log('Adding to cart:', product);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wishlist toggle / Wishlist toggle
  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
  };

  // Calculate discount percentage / Endirim faizini hesabla
  const discountPercentage = product.price.original && product.price.original > product.price.current
    ? Math.round(((product.price.original - product.price.current) / product.price.original) * 100)
    : 0;

  // Format price / Qiyməti formatla
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Check if product is in stock / Məhsulun stokda olub-olmadığını yoxla
  const isInStock = product.stock.trackStock ? product.stock.quantity > 0 : true;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Image / Məhsul şəkli */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.images[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount badge / Endirim nişanı */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}
        
        {/* Featured badge / Əsas nişanı */}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Featured
          </div>
        )}
        
        {/* Action buttons / Əməliyyat düymələri */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isWishlisted
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-800 hover:bg-gray-100'
              }`}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Info / Məhsul məlumatları */}
      <div className="p-4">
        {/* Category / Kateqoriya */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          {product.category.name}
        </div>
        
        {/* Product Name / Məhsul adı */}
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>
        
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
              In stock
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              Out of stock
            </span>
          )}
        </div>
        
        {/* Add to cart button / Səbətə əlavə et düyməsi */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock || isLoading}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
            isInStock && !isLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>
                {isInStock ? 'Add to cart' : 'Out of stock'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Products page komponenti / Products page component
export default function ProductsPage() {
  // State / Vəziyyət
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data / Mock məlumatlar
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      slug: 'premium-wireless-headphones',
      price: {
        current: 199.99,
        original: 249.99,
        currency: 'USD',
      },
      images: ['/placeholder-product.jpg'],
      category: {
        id: '1',
        name: 'Electronics',
        slug: 'electronics',
      },
      brand: 'TechBrand',
      tags: ['wireless', 'premium', 'audio'],
      stock: {
        quantity: 50,
        trackStock: true,
      },
      rating: {
        average: 4.5,
        count: 128,
      },
      views: 1250,
      sales: 89,
      featured: true,
      isActive: true,
    },
    {
      id: '2',
      name: 'Smart Fitness Watch',
      slug: 'smart-fitness-watch',
      price: {
        current: 299.99,
        currency: 'USD',
      },
      images: ['/placeholder-product.jpg'],
      category: {
        id: '2',
        name: 'Wearables',
        slug: 'wearables',
      },
      brand: 'FitTech',
      tags: ['fitness', 'smart', 'watch'],
      stock: {
        quantity: 25,
        trackStock: true,
      },
      rating: {
        average: 4.2,
        count: 95,
      },
      views: 980,
      sales: 67,
      featured: false,
      isActive: true,
    },
    {
      id: '3',
      name: 'Professional Camera Lens',
      slug: 'professional-camera-lens',
      price: {
        current: 899.99,
        original: 1099.99,
        currency: 'USD',
      },
      images: ['/placeholder-product.jpg'],
      category: {
        id: '3',
        name: 'Photography',
        slug: 'photography',
      },
      brand: 'PhotoPro',
      tags: ['camera', 'lens', 'professional'],
      stock: {
        quantity: 12,
        trackStock: true,
      },
      rating: {
        average: 4.8,
        count: 45,
      },
      views: 756,
      sales: 23,
      featured: true,
      isActive: true,
    },
    {
      id: '4',
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      price: {
        current: 399.99,
        currency: 'USD',
      },
      images: ['/placeholder-product.jpg'],
      category: {
        id: '4',
        name: 'Furniture',
        slug: 'furniture',
      },
      brand: 'ComfortPlus',
      tags: ['office', 'ergonomic', 'chair'],
      stock: {
        quantity: 8,
        trackStock: true,
      },
      rating: {
        average: 4.3,
        count: 156,
      },
      views: 1120,
      sales: 34,
      featured: false,
      isActive: true,
    },
  ];

  // Get unique brands / Unikal brendləri əldə et
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Get unique categories / Unikal kateqoriyaları əldə et
  const categories = Array.from(new Set(products.map(p => p.category.name)));

  // Filter and sort products / Məhsulları filter et və sırala
  useEffect(() => {
    let filtered = [...mockProducts];

    // Search filter / Axtarış filteri
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter / Kateqoriya filteri
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category.name === selectedCategory);
    }

    // Brand filter / Brend filteri
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Price range filter / Qiymət aralığı filteri
    filtered = filtered.filter(product =>
      product.price.current >= priceRange.min && product.price.current <= priceRange.max
    );

    // Sort products / Məhsulları sırala
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'price':
          aValue = a.price.current;
          bValue = b.price.current;
          break;
        case 'rating':
          aValue = a.rating.average;
          bValue = b.rating.average;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setProducts(filtered);
    setLoading(false);
  }, [searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, sortOrder]);

  // Clear filters / Filterləri təmizlə
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header / Başlıq */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Products
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {products.length} products found
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters / Axtarış və filterlər */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search / Axtarış */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Filters toggle / Filterlər toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
            </button>

            {/* Sort / Sıralama */}
            <div className="flex items-center space-x-2">
              <SortAsc size={20} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* View mode / Görünüş rejimi */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Filters panel / Filterlər paneli */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category filter / Kateqoriya filteri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand filter / Brend filteri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price range / Qiymət aralığı */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Clear filters / Filterləri təmizlə */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products / Məhsullar */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg font-semibold mb-2">
              No products found
            </div>
            <div className="text-gray-400 dark:text-gray-500">
              Try changing your search criteria
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
