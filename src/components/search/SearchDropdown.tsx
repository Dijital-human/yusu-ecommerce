/**
 * Search Dropdown Component / Axtarış Dropdown Komponenti
 * Alibaba & Trendyol style search dropdown with trending searches
 * Alibaba & Trendyol stilində tez-tez axtarılanlar ilə axtarış dropdown-u
 */

"use client";

import { Clock, TrendingUp, X, Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  recentSearches?: string[];
  currentQuery?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onRemoveRecent?: (search: string) => void;
}

// Mock trending searches / Mock tez-tez axtarılanlar
const trendingSearches = [
  "Smartphone",
  "Laptop",
  "Headphones",
  "Watch",
  "Shoes",
  "Bag",
  "Camera",
  "Tablet",
  "Fitness",
  "Home Decor"
];

// Mock quick searches / Mock tez axtarışlar
const quickSearches = [
  { category: "Electronics", query: "smartphone" },
  { category: "Fashion", query: "shoes" },
  { category: "Home", query: "furniture" },
  { category: "Sports", query: "fitness" },
  { category: "Beauty", query: "skincare" },
  { category: "Books", query: "fiction" }
];

export function SearchDropdown({
  isOpen,
  onClose,
  onSearch,
  recentSearches = [],
  currentQuery = "",
  onMouseEnter,
  onMouseLeave,
  onRemoveRecent
}: SearchDropdownProps) {
  const t = useTranslations("search");
  const tCommon = useTranslations("common");

  if (!isOpen) return null;

  const handleSearchClick = (query: string) => {
    onSearch(query);
  };

  const handleRemoveRecent = (e: React.MouseEvent, search: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== search);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    if (onRemoveRecent) {
      onRemoveRecent(search);
    }
  };

  return (
    <>
      {/* Mobile Backdrop / Mobil Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-[90] md:hidden"
        onClick={onClose}
      />
      
      {/* Dropdown / Dropdown */}
      <div
        className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:left-0 md:top-full md:mt-2 bg-white dark:bg-gray-800 border-t md:border border-gray-200 dark:border-gray-700 md:rounded-lg shadow-2xl z-[100] md:z-50 max-h-[80vh] md:max-h-[500px] overflow-y-auto rounded-t-2xl md:rounded-t-lg opacity-100"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
      {/* Mobile drag handle / Mobil sürükləmə tutacağı */}
      <div className="md:hidden flex justify-center pt-3 pb-2">
        <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
      <div className="p-4 md:p-4 space-y-4 pb-6 md:pb-4">
        {/* Recent Searches / Son Axtarılanlar */}
        {recentSearches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t("recentSearches")}
                </h3>
              </div>
            </div>
            <div className="space-y-1">
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="w-full flex items-center justify-between px-4 py-3 md:px-3 md:py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 transition-colors group touch-manipulation min-h-[48px] md:min-h-0"
                >
                  <button
                    onClick={() => handleSearchClick(search)}
                    className="flex items-center space-x-3 md:space-x-2 flex-1 min-w-0 text-left"
                  >
                    <Clock className="h-5 w-5 md:h-4 md:w-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-base md:text-sm text-gray-700 dark:text-gray-300 truncate">
                      {search}
                    </span>
                  </button>
                  <button
                    onClick={(e) => handleRemoveRecent(e, search)}
                    className="opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 p-2 md:p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity touch-manipulation min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 flex items-center justify-center"
                    aria-label={tCommon("delete")}
                  >
                    <X className="h-4 w-4 md:h-3 md:w-3 text-gray-400 dark:text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Searches / Tez-tez Axtarılanlar - Alibaba Style */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary-500 dark:text-primary-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("trendingSearches")}
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(search)}
                className="px-4 py-2.5 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm md:text-sm font-medium rounded-full shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation min-h-[40px] md:min-h-0"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Searches / Tez Axtarışlar */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Search className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {t("quickSearches")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickSearches.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(item.query)}
                className="px-3 py-3 md:py-2 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 active:bg-gray-200 dark:active:bg-gray-500 border border-gray-200 dark:border-gray-600 rounded-lg transition-colors group touch-manipulation min-h-[64px] md:min-h-0"
              >
                <div className="text-xs md:text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {item.category}
                </div>
                <div className="text-sm md:text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {item.query}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Empty State / Boş Vəziyyət */}
        {recentSearches.length === 0 && (
          <div className="text-center py-6">
            <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("noRecentSearches")}
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}


