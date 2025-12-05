/**
 * Advanced Search Bar Component / Təkmilləşdirilmiş Axtarış Çubuğu Komponenti
 * Enterprise-level search with voice, visual search, and suggestions
 * Səs, vizual axtarış və təkliflərlə enterprise səviyyəli axtarış
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { 
  Search, 
  Camera, 
  Mic, 
  X, 
  Clock, 
  TrendingUp, 
  Sparkles,
  Loader2,
  ArrowRight,
  MicOff
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import Image from "next/image";

/**
 * Search suggestion interface / Axtarış təklifi interfeysi
 */
interface SearchSuggestion {
  type: "product" | "category" | "brand" | "query";
  text: string;
  subtext?: string;
  image?: string;
  url?: string;
  count?: number;
}

/**
 * Trending search interface / Trend axtarış interfeysi
 */
interface TrendingSearch {
  query: string;
  count: number;
  trend: "up" | "stable" | "down";
}

interface AdvancedSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function AdvancedSearchBar({
  onSearch,
  placeholder,
  className = "",
  autoFocus = false,
}: AdvancedSearchBarProps) {
  const router = useRouter();
  const t = useTranslations("search");
  
  // State
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Debounced query / Gecikdirilmiş sorğu
  const debouncedQuery = useDebounce(query, 300);

  // Load recent searches / Son axtarışları yüklə
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }

    // Load trending searches / Trend axtarışları yüklə
    loadTrendingSearches();
  }, []);

  // Fetch suggestions when query changes / Sorğu dəyişdikdə təklifləri al
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Handle click outside / Kənar kliki idarə et
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load trending searches / Trend axtarışları yüklə
  const loadTrendingSearches = async () => {
    try {
      const response = await fetch("/api/search/trending");
      if (response.ok) {
        const data = await response.json();
        setTrendingSearches(data.trending || []);
      }
    } catch (error) {
      // Use fallback trending searches / Fallback trend axtarışlarını istifadə et
      setTrendingSearches([
        { query: "iPhone 15 Pro", count: 15420, trend: "up" },
        { query: "Samsung Galaxy S24", count: 12350, trend: "up" },
        { query: "Laptop Gaming", count: 9870, trend: "stable" },
        { query: "Wireless Earbuds", count: 8650, trend: "up" },
        { query: "Smart Watch", count: 7230, trend: "stable" },
      ]);
    }
  };

  // Fetch suggestions / Təklifləri al
  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save search / Axtarışı saxla
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Handle search / Axtarışı idarə et
  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    saveSearch(searchQuery);
    setIsOpen(false);
    setQuery(searchQuery);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle suggestion click / Təklif klikini idarə et
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.url) {
      router.push(suggestion.url);
    } else {
      handleSearch(suggestion.text);
    }
  };

  // Handle keyboard navigation / Klaviatura naviqasiyasını idarə et
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [...suggestions, ...recentSearches.slice(0, 3).map((s) => ({ type: "query" as const, text: s }))];
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          handleSuggestionClick(items[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  // Initialize voice search / Səsli axtarışı başlat
  const initVoiceSearch = useCallback(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert(t("voiceNotSupported") || "Voice search is not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "az-AZ";

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setQuery(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (query.trim()) {
        handleSearch(query);
      }
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };
  }, [query, t]);

  // Toggle voice search / Səsli axtarışı aç/bağla
  const toggleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        initVoiceSearch();
      }
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Handle camera search / Kamera axtarışını idarə et
  const handleCameraSearch = () => {
    setIsCameraOpen(true);
    // Camera modal will handle the rest / Kamera modal-ı qalan hissəni idarə edəcək
  };

  // Clear query / Sorğunu təmizlə
  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Remove recent search / Son axtarışı sil
  const removeRecentSearch = (search: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== search);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Container / Axtarış Input Konteyneri */}
      <div className={`relative flex items-center bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-200 ${
        isOpen 
          ? "border-primary-500 shadow-lg shadow-primary-500/20" 
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}>
        {/* Search Icon / Axtarış İkonu */}
        <div className="pl-4">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        {/* Input / Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t("placeholder") || "Search products, brands, categories..."}
          className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 px-3 py-3.5 text-base"
          autoComplete="off"
          autoFocus={autoFocus}
        />

        {/* Action Buttons / Hərəkət Düymələri */}
        <div className="flex items-center gap-1 pr-2">
          {/* Clear Button / Təmizləmə Düyməsi */}
          {query && (
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={t("clear") || "Clear"}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Divider / Ayırıcı */}
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          {/* Voice Search / Səsli Axtarış */}
          <button
            onClick={toggleVoiceSearch}
            className={`p-2 rounded-lg transition-all ${
              isListening 
                ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label={isListening ? t("stopVoice") || "Stop" : t("voiceSearch") || "Voice search"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          {/* Camera Search / Kamera Axtarışı */}
          <button
            onClick={handleCameraSearch}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label={t("cameraSearch") || "Camera search"}
          >
            <Camera className="w-5 h-5" />
          </button>
          
          {/* Search Button / Axtarış Düyməsi */}
          <button
            onClick={() => handleSearch(query)}
            className="ml-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">{t("search") || "Search"}</span>
          </button>
        </div>
      </div>

      {/* Dropdown / Açılan Menyu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Voice Listening Indicator / Səs Dinləmə Göstəricisi */}
          {isListening && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
              <div className="relative">
                <Mic className="w-5 h-5 text-red-500" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              </div>
              <span className="text-red-600 dark:text-red-400 text-sm">
                {t("listening") || "Listening... Speak now"}
              </span>
            </div>
          )}

          {/* Suggestions / Təkliflər */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                {t("suggestions") || "Suggestions"}
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    selectedIndex === index 
                      ? "bg-primary-50 dark:bg-primary-900/20" 
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {suggestion.image ? (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                      <Image
                        src={suggestion.image}
                        alt={suggestion.text}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {suggestion.text}
                    </div>
                    {suggestion.subtext && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestion.subtext}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches / Son Axtarışlar */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {t("recentSearches") || "Recent Searches"}
              </div>
              {recentSearches.slice(0, 5).map((search) => (
                <button
                  key={search}
                  onClick={() => handleSearch(search)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{search}</span>
                  </div>
                  <button
                    onClick={(e) => removeRecentSearch(search, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all"
                    aria-label={t("remove") || "Remove"}
                  >
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches / Trend Axtarışlar */}
          {!query && trendingSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100 dark:border-gray-700">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3 h-3" />
                {t("trending") || "Trending Now"}
              </div>
              <div className="flex flex-wrap gap-2 p-2">
                {trendingSearches.slice(0, 6).map((item) => (
                  <button
                    key={item.query}
                    onClick={() => handleSearch(item.query)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {item.trend === "up" && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results / Nəticə Yoxdur */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("noResults") || "No suggestions found. Press Enter to search."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdvancedSearchBar;

