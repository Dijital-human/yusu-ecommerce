/**
 * Order Search Component / Sifariş Axtarışı Komponenti
 * Search input for orders / Sifarişlər üçün axtarış inputu
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OrderSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions?: string[];
}

export function OrderSearch({ value, onChange, onSearch, suggestions = [] }: OrderSearchProps) {
  const t = useTranslations('orders');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="relative" ref={inputRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onFocus={() => setShowSuggestions(value.length > 0 && suggestions.length > 0)}
          placeholder={t('searchOrders') || 'Search orders by ID, product, or seller...'}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              onSearch('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions / Axtarış Tövsiyələri */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

