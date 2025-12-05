/**
 * Filter Context / Filter Konteksti
 * Provides global filter state management with URL persistence
 * URL persistence ilə qlobal filter state idarəetməsi təmin edir
 */

"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductFilters, parseFilterQuery, buildFilterQuery, mergeFilters, clearFilters, hasActiveFilters } from '@/lib/filters/filter-builder';

interface FilterContextType {
  filters: ProductFilters;
  setFilters: (filters: ProductFilters | ((prev: ProductFilters) => ProductFilters)) => void;
  updateFilter: <K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

interface FilterProviderProps {
  children: ReactNode;
  initialFilters?: ProductFilters;
}

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFiltersState] = useState<ProductFilters>(() => {
    // Initialize from URL or initialFilters / URL-dən və ya initialFilters-dən başlat
    if (typeof window !== 'undefined') {
      const urlFilters = parseFilterQuery(window.location.search);
      return mergeFilters(initialFilters || {}, urlFilters);
    }
    return initialFilters || {};
  });

  // Update URL when filters change / Filter-lər dəyişəndə URL-i yenilə
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const queryString = buildFilterQuery(filters);
    const currentUrl = new URL(window.location.href);
    const newSearchParams = new URLSearchParams(queryString || '');

    // Preserve search query if exists / Əgər varsa axtarış sorğusunu qoru
    const searchQuery = currentUrl.searchParams.get('q');
    if (searchQuery) {
      newSearchParams.set('q', searchQuery);
    }

    // Update URL without page reload / Səhifəni yeniləmədən URL-i yenilə
    const newUrl = `${currentUrl.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Sync filters with URL changes / Filter-ləri URL dəyişiklikləri ilə sinxronlaşdır
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlFilters = parseFilterQuery(window.location.search);
    setFiltersState(prevFilters => {
      // Only update if URL filters are different / Yalnız URL filter-ləri fərqlidirsə yenilə
      const currentQuery = buildFilterQuery(prevFilters);
      const urlQuery = buildFilterQuery(urlFilters);
      if (currentQuery !== urlQuery) {
        return urlFilters;
      }
      return prevFilters;
    });
  }, [searchParams]);

  const setFilters = useCallback((newFilters: ProductFilters | ((prev: ProductFilters) => ProductFilters)) => {
    setFiltersState(prevFilters => {
      if (typeof newFilters === 'function') {
        return newFilters(prevFilters);
      }
      return newFilters;
    });
  }, []);

  const updateFilter = useCallback(<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]) => {
    setFiltersState(prevFilters => ({
      ...prevFilters,
      [key]: value,
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFiltersState(clearFilters());
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters || {});
  }, [initialFilters]);

  const hasActiveFiltersValue = hasActiveFilters(filters);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        updateFilter,
        clearAllFilters,
        hasActiveFilters: hasActiveFiltersValue,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

/**
 * Hook to use filter context / Filter kontekstini istifadə etmək üçün hook
 */
export function useFilters(): FilterContextType {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider / useFilters FilterProvider daxilində istifadə edilməlidir');
  }
  return context;
}

