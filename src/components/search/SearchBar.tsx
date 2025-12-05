/**
 * Search Bar Component / Axtarış Çubuğu Komponenti
 * Trendyol & Alibaba style search bar with camera button and hover dropdown
 * Trendyol & Alibaba stilində kamera butonu və hover dropdown ilə axtarış çubuğu
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Search, Camera, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SearchDropdown } from "./SearchDropdown";
import { CameraModal } from "./CameraModal";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onCameraClick?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ 
  onSearch, 
  onCameraClick, 
  placeholder,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cameraButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const t = useTranslations("search");
  const tCommon = useTranslations("common");

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Handle search
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    saveSearch(searchQuery);
    setIsDropdownOpen(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  // Handle hover enter
  const handleMouseEnter = () => {
    // Kamera dropdown açıq olduqda search dropdown açılmasın
    if (isCameraOpen) {
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  // Handle hover leave
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  // Handle dropdown enter
  const handleDropdownEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsDropdownOpen(true);
  };

  // Handle dropdown leave
  const handleDropdownLeave = () => {
    setIsDropdownOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Handle camera click
  const handleCameraClick = () => {
    if (onCameraClick) {
      onCameraClick();
    } else {
      setIsCameraOpen(true);
      // Close search dropdown when camera dropdown opens
      setIsDropdownOpen(false);
    }
  };

  // Handle camera dropdown enter (keep dropdown open)
  const handleCameraDropdownEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Don't open search dropdown, keep it closed when camera dropdown is open
  };

  // Handle camera dropdown leave (close camera dropdown)
  const handleCameraDropdownLeave = () => {
    // Close camera dropdown with timeout
    timeoutRef.current = setTimeout(() => {
      setIsCameraOpen(false);
    }, 200);
  };

  // Handle camera capture
  const handleCameraCapture = async (imageFile: File) => {
    try {
      // Convert image to base64 for visual search
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Store image in sessionStorage to avoid URL size limits / URL ölçü limitlərindən qaçınmaq üçün rəsmi sessionStorage-da saxla
        sessionStorage.setItem("pendingImageAnalysis", base64String);
        // Navigate to search page with flag / Bayraq ilə axtarış səhifəsinə yönləndir
        router.push(`/search?image=true`);
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      console.error("Error processing image:", error);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <>
      {/* Search Bar Container / Axtarış Çubuğu Konteyneri
          - Mobil: mx-2 (8px margin) / Mobile: mx-2 (8px margin)
          - Tablet/Desktop (1024px+): lg:max-w-lg lg:mx-4 (en artırılıb) / Tablet/Desktop (1024px+): lg:max-w-lg lg:mx-4 (width increased)
          - SearchBar-ın eni max-w-md-dən max-w-lg-ə artırılıb / SearchBar width increased from max-w-md to max-w-lg */}
      <div 
        ref={searchRef}
        className={`relative flex-1 max-w-full mx-2 lg:max-w-lg lg:mx-4 ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
      {/* Search Input / Axtarış Input-u - Alibaba Style - Enhanced Design / Təkmilləşdirilmiş Dizayn */}
      <div className="relative flex items-center bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 focus-within:border-primary-500 dark:focus-within:border-primary-400 focus-within:shadow-md focus-within:shadow-primary-500/20 transition-all duration-200">
        {/* Search Icon / Axtarış İkonu */}
        <Search className="absolute left-2 md:left-3 h-4 w-4 md:h-5 md:w-5 text-gray-400 dark:text-gray-500 flex-shrink-0 pointer-events-none" />
        
        {/* Input / Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("placeholder")}
          className="flex-1 bg-transparent border-none outline-none text-base md:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 pl-8 md:pl-10 pr-16 md:pr-20 py-2.5 md:py-2.5 touch-manipulation"
          autoComplete="off"
        />
        
        {/* Clear Button / Təmizləmə Düyməsi */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-10 md:right-12 top-1/2 -translate-y-1/2 p-1.5 md:p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label={tCommon("close")}
          >
            <X className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
        )}
        
        {/* Camera Button / Kamera Düyməsi - Alibaba Style with Separator - Enhanced Design / Təkmilləşdirilmiş Dizayn */}
        <button
          ref={cameraButtonRef}
          onClick={handleCameraClick}
          className="absolute right-0 top-0 bottom-0 px-3 md:px-4 py-2.5 bg-white dark:bg-gray-800 border-l-2 border-gray-300 dark:border-gray-600 rounded-r-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30 transition-colors group flex items-center justify-center touch-manipulation min-w-[44px]"
          aria-label={t("cameraSearch")}
        >
          <Camera className="h-5 w-5 md:h-5 md:w-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
        </button>
      </div>

      {/* Search Dropdown / Axtarış Dropdown-u */}
      {isDropdownOpen && (
        <SearchDropdown
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
          onSearch={handleSearch}
          recentSearches={recentSearches}
          currentQuery={query}
          onMouseEnter={handleDropdownEnter}
          onMouseLeave={handleDropdownLeave}
          onRemoveRecent={(search) => {
            const updated = recentSearches.filter(s => s !== search);
            setRecentSearches(updated);
          }}
        />
      )}

      {/* Camera Modal / Kamera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        buttonRef={cameraButtonRef}
        onMouseEnter={handleCameraDropdownEnter}
        onMouseLeave={handleCameraDropdownLeave}
      />
      </div>
    </>
  );
}

