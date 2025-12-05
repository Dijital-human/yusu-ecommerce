/**
 * Filter Panel Component / Filter Paneli Komponenti
 * Advanced filter panel with collapsible sections
 * Açıla-bağlana bilən bölmələrlə təkmilləşdirilmiş filter paneli
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { FilterState } from '@/components/filters/ProductFilters';

interface FilterPanelProps {
  filters: FilterState;
  priceRange: { min: number; max: number };
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearAll: () => void;
  availableBrands?: string[];
  availableSellers?: Array<{ id: string; name: string }>;
  availableCategories?: Array<{ id: string; name: string }>;
}

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  count?: number;
}

function FilterSection({ title, isOpen, onToggle, children, count }: FilterSectionProps) {
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {isOpen && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

export function FilterPanel({
  filters,
  priceRange,
  onFilterChange,
  onClearAll,
  availableBrands = [],
  availableSellers = [],
  availableCategories = [],
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    rating: true,
    category: true,
    brand: false,
    seller: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const activeFilterCount = 
    (filters.priceRange[0] !== priceRange.min || filters.priceRange[1] !== priceRange.max ? 1 : 0) +
    filters.brands.length +
    (filters.rating > 0 ? 1 : 0) +
    filters.colors.length +
    filters.sizes.length +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {activeFilterCount} active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Price Range / Qiymət Aralığı */}
        <FilterSection
          title="Price Range"
          isOpen={openSections.price}
          onToggle={() => toggleSection('price')}
          count={filters.priceRange[0] !== priceRange.min || filters.priceRange[1] !== priceRange.max ? 1 : 0}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                <Input
                  type="number"
                  value={filters.priceRange[0]}
                  onChange={(e) => {
                    const min = Math.max(priceRange.min, Math.min(priceRange.max, Number(e.target.value)));
                    onFilterChange({
                      priceRange: [min, filters.priceRange[1]],
                    });
                  }}
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                <Input
                  type="number"
                  value={filters.priceRange[1]}
                  onChange={(e) => {
                    const max = Math.max(priceRange.min, Math.min(priceRange.max, Number(e.target.value)));
                    onFilterChange({
                      priceRange: [filters.priceRange[0], max],
                    });
                  }}
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
            </div>
            {/* Price Range Slider / Qiymət Aralığı Slider */}
            <div className="relative">
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceRange[0]}
                onChange={(e) => {
                  const min = Number(e.target.value);
                  if (min <= filters.priceRange[1]) {
                    onFilterChange({ priceRange: [min, filters.priceRange[1]] });
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={priceRange.min}
                max={priceRange.max}
                value={filters.priceRange[1]}
                onChange={(e) => {
                  const max = Number(e.target.value);
                  if (max >= filters.priceRange[0]) {
                    onFilterChange({ priceRange: [filters.priceRange[0], max] });
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer absolute top-0"
              />
            </div>
          </div>
        </FilterSection>

        {/* Rating Filter / Reytinq Filter */}
        <FilterSection
          title="Rating"
          isOpen={openSections.rating}
          onToggle={() => toggleSection('rating')}
          count={filters.rating > 0 ? 1 : 0}
        >
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.rating === rating}
                  onChange={() => onFilterChange({ rating: filters.rating === rating ? 0 : rating })}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  {rating}+ Stars
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Category Filter / Kateqoriya Filter */}
        {availableCategories.length > 0 && (
          <FilterSection
            title="Categories"
            isOpen={openSections.category}
            onToggle={() => toggleSection('category')}
            count={filters.categories?.length || 0}
          >
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableCategories.map((category) => (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category.id) || false}
                    onChange={(e) => {
                      const currentCategories = filters.categories || [];
                      if (e.target.checked) {
                        onFilterChange({ categories: [...currentCategories, category.id] });
                      } else {
                        onFilterChange({ categories: currentCategories.filter(id => id !== category.id) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Brand Filter / Marka Filter */}
        {availableBrands.length > 0 && (
          <FilterSection
            title="Brands"
            isOpen={openSections.brand}
            onToggle={() => toggleSection('brand')}
            count={filters.brands.length}
          >
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableBrands.map((brand) => (
                <label key={brand} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.brands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFilterChange({ brands: [...filters.brands, brand] });
                      } else {
                        onFilterChange({ brands: filters.brands.filter(b => b !== brand) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Seller Filter / Satıcı Filter */}
        {availableSellers.length > 0 && (
          <FilterSection
            title="Sellers"
            isOpen={openSections.seller}
            onToggle={() => toggleSection('seller')}
            count={filters.sellers?.length || 0}
          >
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableSellers.map((seller) => (
                <label key={seller.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.sellers?.includes(seller.id) || false}
                    onChange={(e) => {
                      const currentSellers = filters.sellers || [];
                      if (e.target.checked) {
                        onFilterChange({ sellers: [...currentSellers, seller.id] });
                      } else {
                        onFilterChange({ sellers: currentSellers.filter(id => id !== seller.id) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{seller.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}
      </CardContent>
    </Card>
  );
}

