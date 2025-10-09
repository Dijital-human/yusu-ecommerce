'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, SortAsc, Grid, List, SlidersHorizontal } from 'lucide-react';
import ProductGrid from './ProductGrid';
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

// Category interface / Kateqoriya interfeysi
interface Category {
  _id: string;
  name: {
    az: string;
    en: string;
    ru: string;
  };
  slug: string;
  children?: Category[];
}

// ProductList props interface / ProductList props interfeysi
interface ProductListProps {
  products: Product[];
  categories: Category[];
  language?: 'az' | 'en' | 'ru';
  className?: string;
}

// Sort options / Sıralama seçimləri
const sortOptions = [
  { value: 'name', label: 'Ad / Name' },
  { value: 'price', label: 'Qiymət / Price' },
  { value: 'createdAt', label: 'Tarix / Date' },
  { value: 'views', label: 'Baxış / Views' },
  { value: 'sales', label: 'Satış / Sales' },
  { value: 'rating', label: 'Reytinq / Rating' },
];

// ProductList komponenti / ProductList component
const ProductList: React.FC<ProductListProps> = ({
  products,
  categories,
  language = 'az',
  className = '',
}) => {
  // State / Vəziyyət
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Get unique brands / Unikal brendləri əldə et
  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  // Filter and sort products / Məhsulları filter et və sırala
  useEffect(() => {
    let filtered = [...products];

    // Search filter / Axtarış filteri
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter / Kateqoriya filteri
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category._id === selectedCategory);
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
          aValue = a.name[language];
          bValue = b.name[language];
          break;
        case 'price':
          aValue = a.price.current;
          bValue = b.price.current;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'views':
          aValue = a.views;
          bValue = b.views;
          break;
        case 'sales':
          aValue = a.sales;
          bValue = b.sales;
          break;
        case 'rating':
          aValue = a.rating.average;
          bValue = b.rating.average;
          break;
        default:
          aValue = a.name[language];
          bValue = b.name[language];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy, sortOrder, language]);

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
    <div className={`w-full ${className}`}>
      {/* Header / Başlıq */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Məhsullar / Products
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredProducts.length} məhsul tapıldı / {filteredProducts.length} products found
        </p>
      </div>

      {/* Search and filters / Axtarış və filterlər */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search / Axtarış */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Məhsul axtarın / Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Filters toggle / Filterlər toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <SlidersHorizontal size={20} />
            <span>Filterlər / Filters</span>
          </button>

          {/* Sort / Sıralama */}
          <div className="flex items-center space-x-2">
            <SortAsc size={20} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary-600 text-white'
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
                  Kateqoriya / Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Bütün kateqoriyalar / All categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name[language]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand filter / Brend filteri */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Brend / Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Bütün brendlər / All brands</option>
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
                  Qiymət aralığı / Price range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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
                Filterləri təmizlə / Clear filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products / Məhsullar */}
      {viewMode === 'grid' ? (
        <ProductGrid
          products={filteredProducts}
          language={language}
          columns={4}
        />
      ) : (
        <div className="space-y-4">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <ProductCard
                product={product}
                language={language}
                className="!shadow-none"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
