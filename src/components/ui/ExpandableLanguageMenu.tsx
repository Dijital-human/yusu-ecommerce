/**
 * Expandable Language Menu Component / Genişlənən Dil Menyu Komponenti
 * Expandable menu for language selection / Dil seçimi üçün genişlənən menyu
 * Click to expand/collapse and select language / Klik ilə genişləndir/bağla və dil seç
 */

'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe, ChevronRight, ChevronDown } from 'lucide-react';

// Dil sıralaması: az, en, tr, ru, zh / Language order: az, en, tr, ru, zh
const languages = [
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export function ExpandableLanguageMenu() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('navigation');

  const changeLanguage = (newLocale: string) => {
    // Navigate to new locale / Yeni dilə keç
    router.replace(pathname, { locale: newLocale });
    setIsExpanded(false);
  };

  const currentLanguage = languages.find(l => l.code === locale);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Trigger Button / Trigger Düyməsi */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 hover:text-primary-600 transition-colors duration-200"
      >
        <div className="flex items-center">
          <Globe className="h-5 w-5 mr-3 text-gray-600" />
          <span className="text-sm font-medium">{t('languageLabel') || 'Language'}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-200" />
        )}
      </button>

      {/* Expanded Content / Genişlənmiş Məzmun */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-2 space-y-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                locale === lang.code
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.name}</span>
              {locale === lang.code && (
                <span className="text-primary-600 dark:text-primary-400">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

