/**
 * Language Switcher Component / Dil Dəyişdirici Komponent
 * Allows users to switch between supported languages
 * İstifadəçilərə dəstəklənən dillər arasında keçid imkanı verir
 * Hover ilə açılan dropdown - Categories kimi
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Dil sıralaması: az, en, tr, ru, zh
const languages = [
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

interface LanguageSwitcherProps {
  inline?: boolean; // If true, render as inline list without dropdown / Əgər true-dursa, dropdown olmadan inline list kimi render et
  clickMode?: boolean; // If true, open on click instead of hover / Əgər true-dursa, hover əvəzinə klik ilə aç
  nested?: boolean; // If true, render as nested dropdown inside another dropdown / Əgər true-dursa, başqa dropdown içində nested dropdown kimi render et
}

export function LanguageSwitcher({ inline = false, clickMode = false, nested = false }: LanguageSwitcherProps = {}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (newLocale: string) => {
    // Navigate to new locale / Yeni dilə keç
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const currentLanguage = languages.find(l => l.code === locale);

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
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors duration-200 rounded-lg ${
              locale === lang.code
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold"
                : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <span>{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {locale === lang.code && (
              <span className="text-primary-600 dark:text-primary-400">✓</span>
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
      <div 
        className="relative w-full" 
        ref={nestedMenuRef} 
        style={{ position: 'relative' }}
      >
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
            <span>{currentLanguage?.flag}</span>
            <span className="font-medium">{currentLanguage?.name}</span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Nested Dropdown / Nested Dropdown */}
        {isOpen && (
          <div 
            className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[70]"
            style={{ 
              position: 'absolute',
              minWidth: '192px'
            }}
            onClick={(e) => {
              // Prevent click from closing parent dropdown / Parent dropdown-un bağlanmasının qarşısını al
              e.stopPropagation();
            }}
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    changeLanguage(lang.code);
                  }}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-200 ${
                    locale === lang.code
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {locale === lang.code && (
                    <span className="text-primary-600 dark:text-primary-400">✓</span>
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
            : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
        }`}
      >
        <span>{currentLanguage?.flag}</span>
        <span className="text-sm font-medium">{currentLanguage?.name}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Desktop Dropdown Menu / Desktop Dropdown Menyu */}
      {isOpen && (
        <div
          className="hidden md:block absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 opacity-100"
          onMouseEnter={handleMenuEnter}
          onMouseLeave={handleMenuLeave}
        >
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors duration-200 ${
                  locale === lang.code
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                    : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span>{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {locale === lang.code && (
                  <span className="text-blue-600 dark:text-blue-400">✓</span>
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
                Dil Seçin
              </h3>
            </div>
            
            {/* Languages list / Dillər siyahısı */}
            <div className="p-4 space-y-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-base text-left transition-colors duration-200 rounded-lg touch-manipulation min-h-[56px] ${
                    locale === lang.code
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {locale === lang.code && (
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


