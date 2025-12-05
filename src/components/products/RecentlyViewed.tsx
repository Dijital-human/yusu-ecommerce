/**
 * Recently Viewed Products Component / Son Baxılan Məhsullar Komponenti
 * Displays recently viewed products with filters and sorting / Filtrlər və sıralama ilə son baxılan məhsulları göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { ProductGrid } from "./ProductGrid";
import { Button } from "@/components/ui/Button";
import { Eye, Filter, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface RecentlyViewedProps {
  limit?: number;
  showFilters?: boolean;
  showClearAll?: boolean;
}

export function RecentlyViewed({
  limit = 20,
  showFilters = true,
  showClearAll = true,
}: RecentlyViewedProps) {
  const { products, clearAll, isLoading } = useRecentlyViewed();
  const t = useTranslations("products");
  const tNav = useTranslations("navigation");
  
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortBy, setSortBy] = useState<"date" | "price" | "rating">("date");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    let filtered = [...products];

    // Filter by category / Kateqoriyaya görə filtrlə
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.category?.name === categoryFilter
      );
    }

    // Sort products / Məhsulları sırala
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return (b.viewedAt as number) - (a.viewedAt as number);
        case "price":
          return a.price - b.price;
        case "rating":
          // Note: Rating might not be available in recently viewed / Qeyd: Rating son baxılanlarda mövcud olmaya bilər
          return 0;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered.slice(0, limit));
  }, [products, sortBy, categoryFilter, limit]);

  // Get unique categories / Unikal kateqoriyaları al
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  );

  const productGridData = filteredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    images: Array.isArray(p.images) ? p.images[0] : p.images,
    stock: p.stock || 1,
  }));

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t("loading") || "Loading..."}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Eye className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {t("noRecentlyViewed") || "No recently viewed products"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t("noRecentlyViewedDesc") || "Start browsing products to see them here"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters / Filtrlərlə header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {tNav("recentlyViewed") || "Recently Viewed"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} {t("products") || "products"}
            </p>
          </div>
        </div>

        {showClearAll && (
          <Button
            variant="outline"
            onClick={clearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4 mr-2" />
            {t("clearAll") || "Clear All"}
          </Button>
        )}
      </div>

      {/* Filters / Filtrlər */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("filter") || "Filter"}:
            </span>
          </div>

          {/* Category filter / Kateqoriya filtri */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            <option value="all">{t("allCategories") || "All Categories"}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort / Sırala */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "price" | "rating")}
            className="min-w-[150px] px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            <option value="date">{t("sortByDate") || "Sort by Date"}</option>
            <option value="price">{t("sortByPrice") || "Sort by Price"}</option>
            <option value="rating">{t("sortByRating") || "Sort by Rating"}</option>
          </select>
        </div>
      )}

      {/* Products grid / Məhsullar grid */}
      <ProductGrid products={productGridData} isLoading={false} />
    </div>
  );
}
