/**
 * Header Component / Başlıq Komponenti
 * Modern header design inspired by yusu-admin and yusu-seller
 * Modern başlıq dizaynı yusu-admin və yusu-seller-dən ilhamlanaraq
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { usePathname as useNextPathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { routing } from "@/i18n/routing";
import { useCart } from "@/store/CartContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/Button";
import { Cart } from "@/components/cart/Cart";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { MegaMenu } from "@/components/navigation/MegaMenu";
import { SearchBar } from "@/components/search/SearchBar";
import { AuthDropdown } from "@/components/auth/AuthDropdown";
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  Heart,
  Package,
  Settings,
  ArrowRight,
  LogOut,
  ChevronDown,
  Grid3x3,
  Store,
  Globe,
  DollarSign,
  Check
} from "lucide-react";

import { useTranslations, useLocale } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const nextPathname = useNextPathname(); // Standard Next.js pathname
  
  // Extract locale from pathname (e.g., /az/products -> az)
  // Pathname-dən locale çıxar (məsələn, /az/products -> az)
  const getLocaleFromPathname = (pathname: string): string => {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    if (firstSegment && routing.locales.includes(firstSegment as any)) {
      return firstSegment;
    }
    return routing.defaultLocale;
  };
  
  // Use useLocale hook for real-time locale updates / Real-time locale yeniləmələri üçün useLocale hook-u istifadə et
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  
  // Languages array (sıralama: az, en, ru, tr, zh) / Languages array (order: az, en, ru, tr, zh)
  const languages = [
    { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  // Currencies array (sıralama: USD, AZN, EUR, TRY, RUB, CNY) / Currencies array (order: USD, AZN, EUR, TRY, RUB, CNY)
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', flag: '🇦🇿' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
    { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
  ];

  // Currency state / Valyuta state-i
  const [currency, setCurrency] = useState<string>('USD');

  // Load currency from localStorage / localStorage-dan valyuta yüklə
  useEffect(() => {
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Handle language change / Dil dəyişikliyini idarə et
  const handleLanguageChange = async (newLocale: string) => {
    // Don't do anything if same locale is selected / Eyni dil seçilibsə heç nə etmə
    if (locale === newLocale) {
      console.log('⚠️ Same locale selected, skipping');
      return;
    }
    
    if (typeof window === "undefined") {
      return;
    }
    
    // Debug: Log the language change / Debug: Dil dəyişikliyini logla
    console.log('🔄 Changing language from', locale, 'to', newLocale);
    
    // Save to localStorage / localStorage-a yaz
    localStorage.setItem("preferredLocale", newLocale);
    
    // Refresh session if authenticated / Əgər autentifikasiya olunubsa session-i yenilə
    if (isAuthenticated) {
      try {
        await refreshSession();
        console.log('✅ Session refreshed');
      } catch (error) {
        console.error('❌ Error refreshing session:', error);
      }
    }
    
    // Get current full pathname from window.location / window.location-dan cari tam pathname-i al
    const currentFullPath = window.location.pathname;
    console.log('📍 Current full path:', currentFullPath);
    
    // Remove current locale from pathname / Pathname-dən cari locale-i çıxar
    // Remove locale prefix (e.g., /az/products -> /products) / Locale prefiksini çıxar (məsələn, /az/products -> /products)
    const pathWithoutLocale = currentFullPath.replace(/^\/(az|en|ru|tr|zh)/, '') || '/';
    console.log('📍 Path without locale:', pathWithoutLocale);
    
    // Build new path with new locale / Yeni locale ilə yeni path qur
    const searchParams = window.location.search;
    const hash = window.location.hash;
    // Ensure path starts with / and doesn't have double slashes / Path-in / ilə başladığını və ikiqat slash olmadığını təmin et
    const cleanPath = pathWithoutLocale === '/' ? '' : pathWithoutLocale;
    const newPath = `/${newLocale}${cleanPath}${searchParams}${hash}`;
    
    // Debug: Log the new path / Debug: Yeni path-i logla
    console.log('🚀 Navigating to:', newPath);
    
    // Close dropdown immediately / Dropdown-u dərhal bağla
    setIsUserMenuOpen(false);
    
    // Navigate to new locale with full page reload / Tam səhifə yeniləməsi ilə yeni dilə keç
    // Use setTimeout to ensure dropdown closes before navigation / Naviqasiyadan əvvəl dropdown-un bağlandığını təmin etmək üçün setTimeout istifadə et
    // This prevents race conditions with Radix UI dropdown closing / Bu Radix UI dropdown bağlanması ilə race condition-ların qarşısını alır
    setTimeout(() => {
      try {
        console.log('✅ Setting window.location.href to:', newPath);
        // Use window.location.href for immediate navigation / Dərhal naviqasiya üçün window.location.href istifadə et
        window.location.href = newPath;
      } catch (error) {
        console.error('❌ Error navigating to new locale:', error);
        // Fallback: use window.location.replace if href fails / Fallback: href uğursuz olarsa window.location.replace istifadə et
        window.location.replace(newPath);
      }
    }, 50);
  };

  // Handle currency change / Valyuta dəyişikliyini idarə et
  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: newCurrency } }));
  };
  
  const { user, isAuthenticated, isLoading, handleSignOut, refreshSession } = useAuth();
  const { state: cartState } = useCart();
  const { canAccess } = usePermissions();
  const t = useTranslations("navigation");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");

  // External URLs from environment variables / Environment variable-lərdən external URL-lər
  // Satıcı və kuryer platformaları üçün URL-lər / URLs for seller and courier platforms
  const sellerUrl = process.env.NEXT_PUBLIC_SELLER_URL || 'https://seller.ulustore.com';
  const courierUrl = process.env.NEXT_PUBLIC_COURIER_URL || 'https://courier.ulustore.com';

  // Fetch categories from API with children
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await fetch("/api/categories?parentOnly=true&includeProducts=true");
        if (response.ok) {
          const result = await response.json();
          setCategories(result.data || []);
        }
      } catch (error) {
        // Error is handled silently - categories will just not show
        // Xəta səssiz idarə olunur - kateqoriyalar sadəcə göstərilməyəcək
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Force session refresh on mount only once
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        refreshSession();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run on mount

  // Cleanup timeout on unmount / Unmount-da timeout-u təmizlə
  useEffect(() => {
    return () => {
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
      }
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen);
  };

  const handleCategoryHover = (isHovering: boolean) => {
    // Clear any existing timeout / Mövcud timeout-u təmizlə
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    
    if (isHovering) {
      setIsMegaMenuOpen(true);
    } else {
      // Delay closing to allow mouse to move to menu / Menu-ya hərəkət etmək üçün bağlanmanı gecikdir
      megaMenuTimeoutRef.current = setTimeout(() => {
        setIsMegaMenuOpen(false);
        megaMenuTimeoutRef.current = null;
      }, 200);
    }
  };

  const handleMegaMenuEnter = () => {
    // Keep menu open when hovering over it / Menu-nun üzərinə gəldikdə açıq saxla
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  };

  const handleMegaMenuLeave = () => {
    // Close menu when leaving / Menu-dən çıxdıqda bağla
    setIsMegaMenuOpen(false);
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
      megaMenuTimeoutRef.current = null;
    }
  };

  const handleSignOutClick = () => {
    handleSignOut();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLinkClick = (e?: React.MouseEvent) => {
    // Don't prevent default - let Link handle navigation / Default-u dayandırma - Link naviqasiyanı idarə etsin
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Close dropdowns when clicking outside / Kənara klik olunduqda dropdown-ları bağla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        // Clear timeout before closing / Bağlamadan əvvəl timeout-u təmizlə
        if (userMenuTimeoutRef.current) {
          clearTimeout(userMenuTimeoutRef.current);
          userMenuTimeoutRef.current = null;
        }
        setIsUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
    };

    // Only listen for clicks when menu is open / Yalnız menu açıq olduqda klikləri dinlə
    if (isUserMenuOpen || isCategoriesOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Cleanup timeout on unmount / Unmount olunduqda timeout-u təmizlə
      if (userMenuTimeoutRef.current) {
        clearTimeout(userMenuTimeoutRef.current);
        userMenuTimeoutRef.current = null;
      }
      if (megaMenuTimeoutRef.current) {
        clearTimeout(megaMenuTimeoutRef.current);
        megaMenuTimeoutRef.current = null;
      }
    };
  }, [isUserMenuOpen, isCategoriesOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleMobileMenuClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleMobileMenuClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleMobileMenuClickOutside);
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    // Get current pathname and remove locale prefix for comparison
    const currentPath = nextPathname || '';
    // Remove locale prefix from current path (e.g., /az/products -> /products)
    const pathWithoutLocale = currentPath.replace(new RegExp(`^/${locale}(/|$)`), '/') || '/';
    // Remove locale prefix from href if present
    const hrefWithoutLocale = href.replace(new RegExp(`^/${locale}(/|$)`), '/') || '/';
    
    // Compare paths without locale prefix
    return pathWithoutLocale === hrefWithoutLocale || 
           pathWithoutLocale?.startsWith(hrefWithoutLocale + '/');
  };

  return (
    <>
      {/* Desktop Top Navigation / Desktop Üst Naviqasiya - yusu-seller stilində */}
      <header className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300">
        <div className="w-full max-w-[1920px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Loqo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <Link href="/" className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">U</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                  Ulustore
                </span>
              </Link>
            </div>

            {/* Navigation Items / Naviqasiya Elementləri - Alibaba Style */}
            <nav className="flex items-center space-x-2 flex-1 justify-center max-w-5xl mx-8">
              {/* Products Link / Məhsullar Linki - Alibaba Style */}
              <Link href="/products">
                <button
                  className={`px-5 py-2.5 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                    isActive("/products")
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                  }`}
                >
                  <Package className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm whitespace-nowrap">{t("products")}</span>
                </button>
              </Link>

              {/* Categories Mega Menu / Kateqoriya Mega Menyu - Alibaba Style */}
              <div 
                className="relative" 
                ref={categoriesRef}
                onMouseEnter={() => handleCategoryHover(true)}
                onMouseLeave={() => handleCategoryHover(false)}
              >
                <Link href="/categories">
                  <button
                    className={`px-5 py-2.5 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                      isActive("/categories") || isMegaMenuOpen
                        ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md hover:from-primary-600 hover:to-primary-700"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
                    }`}
                  >
                    <Grid3x3 className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm whitespace-nowrap">{t("categories")}</span>
                    <ChevronDown className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                </Link>
                
                {/* Mega Menu / Mega Menyu */}
                <MegaMenu
                  categories={categories}
                  isOpen={isMegaMenuOpen}
                  onClose={() => setIsMegaMenuOpen(false)}
                  onMouseEnter={handleMegaMenuEnter}
                  onMouseLeave={handleMegaMenuLeave}
                />
              </div>

              {/* Search Bar / Axtarış Çubuğu - 1024px+ üçün nav içində / Search Bar - Inside nav for 1024px+
                  Desktop-da (1024px+) SearchBar nav içində qalır və heç vaxt aşağıya düşmür
                  Desktop (1024px+) SearchBar stays inside nav and never moves down */}
              <div className="hidden lg:block">
                <SearchBar />
              </div>
            </nav>

            {/* Right Side Actions / Sağ Tərəf Əməliyyatları */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {/* Text Links / Yazı Linkləri - Satıcı Ol, Kuryer Ol, Dəstək */}
              <div className="hidden lg:flex items-center gap-3 text-sm">
                <a 
                  href={sellerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  {t("becomeSeller")}
                </a>
                <span className="text-gray-400">|</span>
                <a 
                  href={courierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  {t("becomeCourier")}
                </a>
                <span className="text-gray-400">|</span>
                <Link 
                  href="/support"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  {t("support")}
                </Link>
              </div>

              {/* Wishlist / İstək Siyahısı */}
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200"
                >
                  <Heart className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-md">
                    0
                  </span>
                </Button>
              </Link>

              {/* Cart / Səbət */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative h-10 w-10 text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartState.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold shadow-md">
                    {cartState.items.length}
                  </span>
                )}
              </Button>

              {/* User Menu / İstifadəçi Menyu */}
              {isAuthenticated ? (
                <div 
                  className="relative" 
                  ref={userMenuRef}
                >
                  <DropdownMenu 
                    open={isUserMenuOpen} 
                    onOpenChange={setIsUserMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap h-10 px-3 rounded-lg hover:bg-gray-100"
                        style={{ transition: 'none' }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md" style={{ transition: 'none' }}>
                          <span className="text-white font-bold text-sm">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="hidden xl:block ml-2 text-sm font-medium text-gray-700">
                          {user?.name || tCommon("user")}
                        </span>
                        <ChevronDown className="h-4 w-4 ml-1.5 text-gray-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-72 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50"
                    >
                      {/* User Info Header / İstifadəçi Məlumatları Başlığı */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate text-base">
                              {user?.name || tCommon("user")}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items / Menyu Elementləri */}
                      <div className="py-2">
                        {/* Profil / Profile */}
                        <div className="px-2">
                          <Link
                            href="/profile"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200 cursor-pointer"
                            onClick={handleLinkClick}
                          >
                            <User className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{t("myProfile")}</span>
                          </Link>
                        </div>

                        {/* Sifarişlər / Orders */}
                        <div className="px-2">
                          <Link
                            href="/orders"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200 cursor-pointer"
                            onClick={handleLinkClick}
                          >
                            <Package className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{t("myOrders")}</span>
                          </Link>
                        </div>

                        {/* İstək Siyahısı / Wishlist */}
                        <div className="px-2">
                          <Link
                            href="/wishlist"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200 cursor-pointer"
                            onClick={handleLinkClick}
                          >
                            <Heart className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{t("wishlist")}</span>
                          </Link>
                        </div>

                        {/* Language - Nested Dropdown / Nested Dropdown */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200 cursor-pointer">
                            <Globe className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{t('languageLabel')}</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="bg-white dark:bg-gray-800 opacity-100 z-[60]">
                            {languages.map((lang) => (
                              <DropdownMenuItem
                                key={lang.code}
                                onClick={(e) => {
                                  // Prevent default to avoid conflicts / Konfliktlərin qarşısını almaq üçün default-u dayandır
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  // Don't close dropdown here - let handleLanguageChange handle it / Dropdown-u burada bağlama - handleLanguageChange idarə etsin
                                  // Call handleLanguageChange directly / handleLanguageChange-i birbaşa çağır
                                  // This will trigger full page reload / Bu tam səhifə yeniləməsini təmin edəcək
                                  handleLanguageChange(lang.code);
                                }}
                                onSelect={(e) => {
                                  // Prevent default to avoid conflicts / Konfliktlərin qarşısını almaq üçün default-u dayandır
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  // Don't close dropdown here - let handleLanguageChange handle it / Dropdown-u burada bağlama - handleLanguageChange idarə etsin
                                  // Call handleLanguageChange directly / handleLanguageChange-i birbaşa çağır
                                  handleLanguageChange(lang.code);
                                }}
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </div>
                                {locale === lang.code && (
                                  <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Currency - Nested Dropdown / Nested Dropdown */}
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200 cursor-pointer">
                            <DollarSign className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{t('currencyLabel')}</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="bg-white dark:bg-gray-800 opacity-100 z-[60]">
                            {currencies.map((curr) => (
                              <DropdownMenuItem
                                key={curr.code}
                                onClick={() => handleCurrencyChange(curr.code)}
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <span>{curr.flag}</span>
                                  <span className="flex-1">{curr.name}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{curr.symbol} {curr.code}</span>
                                </div>
                                {currency === curr.code && (
                                  <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 ml-2" />
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        {/* Tənzimləmələr / Settings */}
                        <div className="px-2">
                          <Link
                            href="/settings"
                            className="flex items-center px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors duration-200 cursor-pointer"
                            onClick={handleLinkClick}
                          >
                            <Settings className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">{t("settings")}</span>
                          </Link>
                        </div>
                      </div>

                      {/* Footer - Çıxış / Footer - Sign Out */}
                      <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                        <DropdownMenuItem asChild>
                          <button
                            onClick={handleSignOutClick}
                            className="flex items-center w-full px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 rounded-lg transition-colors duration-200 cursor-pointer"
                          >
                            <LogOut className="h-5 w-5 mr-3" />
                            <span className="text-sm font-medium">{tAuth("signOut")}</span>
                          </button>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Desktop: AuthDropdown (hover ilə açılır) / Desktop: AuthDropdown (opens on hover) */}
                  {/* Mobile: AuthDropdown (kliklə açılır) / Mobile: AuthDropdown (opens on click) */}
                  <AuthDropdown />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation / Mobil Naviqasiya - Alibaba style mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md">
        <div className="flex flex-col">
          {/* Top Row - Logo and Actions / Üst Sıra - Loqo və Əməliyyatlar */}
          <div className="flex items-center justify-between h-14 px-3">
            {/* Logo / Loqo */}
            <Link href="/" className="flex items-center group flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                Ulustore
              </span>
            </Link>

            {/* Right Side Actions / Sağ Tərəf Əməliyyatları */}
            <div className="flex items-center space-x-3">
              {/* Become Seller Button (Mobile) / Satıcı Ol Düyməsi (Mobil) */}
              <a 
                href={sellerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20 touch-manipulation"
                  title={t("becomeSeller")}
                >
                  <Store className="h-5 w-5" />
                </Button>
              </a>

              {/* Cart / Səbət */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative h-10 w-10 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 touch-manipulation"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartState.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartState.items.length}
                  </span>
                )}
              </Button>

              {/* Mobile Menu Button / Mobil Menyu Düyməsi */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="h-10 w-10 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 touch-manipulation"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Search Bar Row / Axtarış Çubuğu Sırası - Alibaba style */}
          <div className="px-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <SearchBar className="max-w-none mx-0" />
          </div>
        </div>

        {/* Mobile Menu Slide-in / Mobil Menyu Slide-in - yusu-admin stilində */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl transform transition-transform duration-300 ease-in-out"
          >
            <div className="flex flex-col h-full">
              {/* Header / Başlıq */}
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">U</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Ulustore</h1>
                    <p className="text-sm text-slate-400">E-commerce</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items / Naviqasiya Elementləri */}
              <nav className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  <Link
                    href="/products"
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive("/products")
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    <Package className="h-5 w-5 mr-3" />
                    <span className="font-medium">{t("products")}</span>
                  </Link>

                  <Link
                    href="/categories"
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 ${
                      isActive("/categories")
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    <Grid3x3 className="h-5 w-5 mr-3" />
                    <span className="font-medium">{t("categories")}</span>
                  </Link>

                  {isAuthenticated && (
                    <>
                      <Link
                        href="/wishlist"
                        onClick={handleLinkClick}
                        className="flex items-center px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
                      >
                        <Heart className="h-5 w-5 mr-3" />
                        <span className="font-medium">{t("wishlist")}</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={handleLinkClick}
                        className="flex items-center px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
                      >
                        <Package className="h-5 w-5 mr-3" />
                        <span className="font-medium">{t("myOrders")}</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={handleLinkClick}
                        className="flex items-center px-3 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200"
                      >
                        <User className="h-5 w-5 mr-3" />
                        <span className="font-medium">{t("myProfile")}</span>
                      </Link>
                    </>
                  )}
                </div>
              </nav>

              {/* Language Switcher / Dil Dəyişdirici */}
              <div className="p-4 border-t border-slate-700">
                <LanguageSwitcher />
              </div>

              {/* User Profile / İstifadəçi Profili */}
              <div className="p-4 border-t border-slate-700">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{user?.name || tCommon("user")}</div>
                        <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={handleSignOutClick}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      {tAuth("signOut")}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    {/* Mobile: AuthDropdown (kliklə açılır) / Mobile: AuthDropdown (opens on click) */}
                    <div className="md:hidden">
                      <AuthDropdown />
                    </div>
                    {/* Desktop: Sign In və Sign Up linkləri (mobil menyuda görünmür) / Desktop: Sign In and Sign Up links (not visible in mobile menu) */}
                    <div className="hidden md:flex flex-col space-y-2">
                      <Link href="/auth/signin" onClick={handleLinkClick}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          {tAuth("signIn")}
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={handleLinkClick}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700">
                          {tAuth("signUp")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Spacer for fixed header / Fixed header üçün spacer */}
      <div className="h-16 lg:block hidden" />
      <div className="h-[88px] lg:hidden" />

      {/* Cart Sidebar / Səbət Yan Paneli */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setIsCartOpen(false)} 
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="h-full overflow-y-auto">
              <Cart onClose={() => setIsCartOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
