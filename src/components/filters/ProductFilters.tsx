/**
 * Product Filters Component / Məhsul Filtrləri Komponenti
 * Trendyol-style sidebar filters with price range, brand, rating, etc.
 * Trendyol stilində yan panel filtrlər - qiymət aralığı, marka, reytinq və s.
 */

"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { 
  X, 
  Filter,
  DollarSign,
  Star,
  Tag,
  Palette,
  Ruler
} from "lucide-react";
import { useTranslations } from "next-intl";

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  priceRange?: { min: number; max: number };
}

export interface FilterState {
  priceRange: [number, number];
  brands: string[];
  rating: number;
  colors: string[];
  sizes: string[];
  inStock: boolean;
  onSale: boolean;
  categories?: string[]; // Multiple category selection / Çoxlu kateqoriya seçimi
  sellers?: string[]; // Multiple seller selection / Çoxlu satıcı seçimi
}

export function ProductFilters({ 
  onFilterChange, 
  initialFilters,
  priceRange = { min: 0, max: 10000 }
}: ProductFiltersProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    priceRange: [priceRange.min, priceRange.max],
    brands: [],
    rating: 0,
    colors: [],
    sizes: [],
    inStock: false,
    onSale: false,
  });

  const [selectedBrands, setSelectedBrands] = useState<string[]>(filters.brands);
  const [selectedColors, setSelectedColors] = useState<string[]>(filters.colors);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(filters.sizes);

  // Mock data - in real app, these would come from API
  const brands = ["Brand A", "Brand B", "Brand C", "Brand D"];
  const colors = ["Red", "Blue", "Green", "Black", "White"];
  const sizes = ["S", "M", "L", "XL", "XXL"];

  const handlePriceChange = (values: number[]) => {
    const newFilters = { ...filters, priceRange: [values[0], values[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter(b => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(newBrands);
    const newFilters = { ...filters, brands: newBrands };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleColorToggle = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter(c => c !== color)
      : [...selectedColors, color];
    setSelectedColors(newColors);
    const newFilters = { ...filters, colors: newColors };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    const newFilters = { ...filters, sizes: newSizes };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleRatingChange = (rating: number) => {
    const newFilters = { ...filters, rating };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleToggle = (key: 'inStock' | 'onSale') => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      priceRange: [priceRange.min, priceRange.max],
      brands: [],
      rating: 0,
      colors: [],
      sizes: [],
      inStock: false,
      onSale: false,
    };
    setFilters(clearedFilters);
    setSelectedBrands([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.priceRange[0] !== priceRange.min || 
    filters.priceRange[1] !== priceRange.max ||
    filters.brands.length > 0 ||
    filters.rating > 0 ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0 ||
    filters.inStock ||
    filters.onSale;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
      {/* Header / Başlıq */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">{t("filter")}</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            {tCommon("clear")}
          </Button>
        )}
      </div>

      {/* Price Range / Qiymət Aralığı */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">{t("priceRange")}</h4>
        </div>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            min={priceRange.min}
            max={priceRange.max}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>{tCommon("currency", { value: filters.priceRange[0] })}</span>
            <span>{tCommon("currency", { value: filters.priceRange[1] })}</span>
          </div>
        </div>
      </div>

      {/* Rating / Reytinq */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">{t("rating")}</h4>
        </div>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRatingChange(filters.rating === rating ? 0 : rating)}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                filters.rating === rating
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands / Markalar */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">{t("brands")}</h4>
        </div>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Colors / Rənglər */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">{t("colors")}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                selectedColors.includes(color)
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes / Ölçülər */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Ruler className="h-4 w-4 text-gray-600" />
          <h4 className="font-semibold text-gray-900">{t("sizes")}</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                selectedSizes.includes(size)
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters / Sürətli Filtrlər */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900">{t("quickFilters")}</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={() => handleToggle("inStock")}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t("inStockOnly")}</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={() => handleToggle("onSale")}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t("onSale")}</span>
          </label>
        </div>
      </div>
    </div>
  );
}

