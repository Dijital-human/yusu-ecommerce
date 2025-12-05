/**
 * Filter Persistence / Filter Saxlama
 * URL-based və localStorage-based filter persistence
 * URL əsaslı və localStorage əsaslı filter saxlanması
 */

import { FilterState } from '@/components/filters/ProductFilters';

const FILTER_STORAGE_KEY = 'yusu_product_filters';
const MAX_STORED_FILTERS = 5;

/**
 * Save filters to localStorage / Filtrləri localStorage-ə yadda saxla
 */
export function saveFiltersToStorage(filters: FilterState): void {
  try {
    const stored = getStoredFilters();
    const newFilter = {
      ...filters,
      savedAt: new Date().toISOString(),
    };
    
    // Remove duplicate if exists / Əgər varsa dublikatı sil
    const filtered = stored.filter(
      (f) => JSON.stringify(f) !== JSON.stringify(newFilter)
    );
    
    // Add to beginning / Əvvələ əlavə et
    filtered.unshift(newFilter);
    
    // Keep only last MAX_STORED_FILTERS / Yalnız son MAX_STORED_FILTERS-i saxla
    const toStore = filtered.slice(0, MAX_STORED_FILTERS);
    
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save filters to storage / Filtrləri yadda saxlamaq uğursuz oldu', error);
  }
}

/**
 * Get stored filters from localStorage / localStorage-dən saxlanmış filtrləri al
 */
export function getStoredFilters(): Array<FilterState & { savedAt?: string }> {
  try {
    const stored = localStorage.getItem(FILTER_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to get stored filters / Saxlanmış filtrləri almaq uğursuz oldu', error);
    return [];
  }
}

/**
 * Clear stored filters / Saxlanmış filtrləri təmizlə
 */
export function clearStoredFilters(): void {
  try {
    localStorage.removeItem(FILTER_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear stored filters / Saxlanmış filtrləri təmizləmək uğursuz oldu', error);
  }
}

/**
 * Convert filters to URL params / Filtrləri URL parametrlərinə çevir
 */
export function filtersToURLParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.priceRange[0] > 0) {
    params.set('minPrice', filters.priceRange[0].toString());
  }
  if (filters.priceRange[1] < 100000) {
    params.set('maxPrice', filters.priceRange[1].toString());
  }
  if (filters.brands.length > 0) {
    params.set('brands', filters.brands.join(','));
  }
  if (filters.rating > 0) {
    params.set('rating', filters.rating.toString());
  }
  if (filters.colors.length > 0) {
    params.set('colors', filters.colors.join(','));
  }
  if (filters.sizes.length > 0) {
    params.set('sizes', filters.sizes.join(','));
  }
  if (filters.inStock) {
    params.set('inStock', 'true');
  }
  if (filters.onSale) {
    params.set('onSale', 'true');
  }
  
  return params;
}

/**
 * Parse filters from URL params / URL parametrlərindən filtrləri parse et
 */
export function filtersFromURLParams(
  params: URLSearchParams,
  defaultPriceRange: { min: number; max: number }
): FilterState {
  const filters: FilterState = {
    priceRange: [
      parseFloat(params.get('minPrice') || defaultPriceRange.min.toString()),
      parseFloat(params.get('maxPrice') || defaultPriceRange.max.toString()),
    ] as [number, number],
    brands: params.get('brands')?.split(',').filter(Boolean) || [],
    rating: parseFloat(params.get('rating') || '0'),
    colors: params.get('colors')?.split(',').filter(Boolean) || [],
    sizes: params.get('sizes')?.split(',').filter(Boolean) || [],
    inStock: params.get('inStock') === 'true',
    onSale: params.get('onSale') === 'true',
  };
  
  return filters;
}

/**
 * Get active filter count / Aktiv filter sayını al
 */
export function getActiveFilterCount(filters: FilterState, defaultPriceRange: { min: number; max: number }): number {
  let count = 0;
  
  if (filters.priceRange[0] !== defaultPriceRange.min || filters.priceRange[1] !== defaultPriceRange.max) {
    count++;
  }
  if (filters.brands.length > 0) count++;
  if (filters.rating > 0) count++;
  if (filters.colors.length > 0) count++;
  if (filters.sizes.length > 0) count++;
  if (filters.inStock) count++;
  if (filters.onSale) count++;
  
  return count;
}

