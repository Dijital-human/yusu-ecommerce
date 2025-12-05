/**
 * Currency Switcher Component / Valyuta Dəyişdirici Komponent
 * Allows users to switch between supported currencies
 * İstifadəçilərə dəstəklənən valyutalar arasında keçid imkanı verir
 * Hover ilə açılan dropdown - Categories kimi
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { DollarSign, ChevronDown } from "lucide-react";

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', flag: '🇦🇿' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
];

interface CurrencySwitcherProps {
  inline?: boolean; // If true, render as inline list without dropdown / Əgər true-dursa, dropdown olmadan inline list kimi render et
  clickMode?: boolean; // If true, open on click instead of hover / Əgər true-dursa, hover əvəzinə klik ilə aç
  nested?: boolean; // If true, render as nested dropdown inside another dropdown / Əgər true-dursa, başqa dropdown içində nested dropdown kimi render et
}

export function CurrencySwitcher({ inline = false, clickMode = false, nested = false }: CurrencySwitcherProps = {}) {
  const [currency, setCurrency] = useState<string>('USD');
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load currency from localStorage / localStorage-dan valyuta yüklə
    const savedCurrency = localStorage.getItem('preferredCurrency');
    if (savedCurrency && currencies.find(c => c.code === savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const changeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    // Dispatch custom event for currency change / Valyuta dəyişikliyi üçün custom event göndər
    window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: newCurrency } }));
    setIsOpen(false);
  };

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsOpen(prev => !prev);
  };

  const handleMouseEnter = () => {
    if (clickMode) return; // Skip hover if click mode / Əgər klik modu varsa hover-i atla
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (clickMode) return; // Skip hover if click mode / Əgər klik modu varsa hover-i atla
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleMenuEnter = () => {
    if (clickMode) return; // Skip hover if click mode / Əgər klik modu varsa hover-i atla
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMenuLeave = () => {
    if (clickMode) return; // Skip hover if click mode / Əgər klik modu varsa hover-i atla
    setIsOpen(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Inline variant - just render the list / Inline variant - yalnız siyahını render et
  if (inline) {
    return (
      <div className="w-full space-y-1">
        {currencies.map((curr) => (
          <button
            key={curr.code}
            onClick={() => changeCurrency(curr.code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-200 rounded-lg ${
              currency === curr.code
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold"
                : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>{curr.flag}</span>
            <span className="flex-1 dark:text-gray-100">{curr.name}</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{curr.symbol} {curr.code}</span>
            {currency === curr.code && (
              <span className="text-primary-600 dark:text-primary-400 ml-2">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Nested variant - render as nested dropdown / Nested variant - nested dropdown kimi render et
  if (nested) {
    const nestedMenuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    
    // Close nested dropdown when clicking outside / Nested dropdown-u kənara klik olunduqda bağla
    useEffect(() => {
      if (!isOpen) return; // Dropdown açıq deyilsə, event listener əlavə etmə / Əgər dropdown açıq deyilsə, event listener əlavə etmə
      
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        // Check if click is on button or inside dropdown / Klikin button-da və ya dropdown-da olub-olmadığını yoxla
        const isClickOnButton = buttonRef.current?.contains(target);
        const isClickInsideDropdown = nestedMenuRef.current?.contains(target);
        
        // Only close if click is outside both / Yalnız hər ikisindən kənarda klik olunduqda bağla
        if (!isClickOnButton && !isClickInsideDropdown) {
          setIsOpen(false);
        }
      };

      // Use setTimeout to allow button click to process first / Button klikinin əvvəlcə işləməsi üçün setTimeout istifadə et
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }, [isOpen]);

    return (
      <div className="relative w-full" ref={nestedMenuRef} style={{ position: 'relative' }}>
        {/* Trigger Button / Trigger Düyməsi */}
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Toggle dropdown state / Dropdown state-ini dəyişdir
            setIsOpen(prev => !prev);
          }}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            <span className="font-medium">{currentCurrency.symbol} {currentCurrency.code}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Nested Dropdown / Nested Dropdown */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[70]"
            style={{ 
              position: 'absolute',
              minWidth: '224px'
            }}
            onClick={(e) => {
              // Prevent click from closing parent dropdown / Parent dropdown-un bağlanmasının qarşısını al
              e.stopPropagation();
            }}
          >
            <div className="py-1">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    changeCurrency(curr.code);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-200 ${
                    currency === curr.code
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{curr.flag}</span>
                  <span className="flex-1 dark:text-gray-100">{curr.name}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{curr.symbol} {curr.code}</span>
                  {currency === curr.code && (
                    <span className="text-primary-600 dark:text-primary-400 ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button / Trigger Düyməsi */}
      <button
        onClick={clickMode ? handleClick : undefined}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
          isOpen
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-primary-400 dark:hover:border-primary-500"
        }`}
      >
        <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        <span className="text-sm font-medium dark:text-gray-100">
          {currentCurrency.symbol} {currentCurrency.code}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Desktop Dropdown Menu / Desktop Dropdown Menyu */}
      {isOpen && (
        <div
          className="hidden md:block absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-100"
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="py-1">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => changeCurrency(curr.code)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-200 ${
                  currency === curr.code
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                    : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span>{curr.flag}</span>
                <span className="flex-1 dark:text-gray-100">{curr.name}</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{curr.symbol} {curr.code}</span>
                {currency === curr.code && (
                  <span className="text-blue-600 dark:text-blue-400 ml-2">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet / Mobil Bottom Sheet */}
      {isOpen && (
        <>
          <div 
            className="md:hidden fixed inset-0 bg-black/60 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl max-h-[60vh] overflow-y-auto opacity-100 animate-slide-up">
            {/* Drag handle / Sürükləmə tutacağı */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Header / Başlıq */}
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Valyuta Seçin
              </h3>
            </div>
            
            {/* Currencies list / Valyutalar siyahısı */}
            <div className="p-4 space-y-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => changeCurrency(curr.code)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-base text-left transition-colors duration-200 rounded-lg touch-manipulation min-h-[56px] ${
                    currency === curr.code
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                  }`}
                >
                  <span className="text-2xl">{curr.flag}</span>
                  <div className="flex-1 flex flex-col">
                    <span className="text-base font-medium">{curr.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{curr.symbol} {curr.code}</span>
                  </div>
                  {currency === curr.code && (
                    <span className="text-blue-600 dark:text-blue-400 text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

