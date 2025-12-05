/**
 * Expandable Currency Menu Component / Genişlənən Valyuta Menyu Komponenti
 * Expandable menu for currency selection / Valyuta seçimi üçün genişlənən menyu
 * Click to expand/collapse and select currency / Klik ilə genişləndir/bağla və valyuta seç
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { DollarSign, ChevronRight, ChevronDown } from 'lucide-react';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat', flag: '🇦🇿' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' },
];

export function ExpandableCurrencyMenu() {
  const [currency, setCurrency] = useState<string>('USD');
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTranslations('navigation');

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
    setIsExpanded(false);
  };

  const currentCurrency = currencies.find(c => c.code === currency) || currencies[0];

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      {/* Trigger Button / Trigger Düyməsi */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 hover:text-primary-600 transition-colors duration-200"
      >
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 mr-3 text-gray-600" />
          <span className="text-sm font-medium">{t('currencyLabel') || 'Currency'}</span>
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
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => changeCurrency(curr.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors duration-200 ${
                currency === curr.code
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{curr.flag}</span>
              <span className="flex-1 text-left dark:text-gray-100">{curr.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{curr.symbol} {curr.code}</span>
              {currency === curr.code && (
                <span className="text-primary-600 dark:text-primary-400 ml-2">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

