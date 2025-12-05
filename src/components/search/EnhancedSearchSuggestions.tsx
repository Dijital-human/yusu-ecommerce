/**
 * Enhanced Search Suggestions Component / Təkmilləşdirilmiş Axtarış Təklifləri Komponenti
 * Enhanced search suggestions with history and popular searches / Tarixçə və populyar axtarışlarla təkmilləşdirilmiş axtarış təklifləri
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getSearchHistory } from '@/lib/search/search-history';
import { useTranslations } from 'next-intl';

interface EnhancedSearchSuggestionsProps {
  query: string;
  onSelectQuery: (query: string) => void;
  showHistory?: boolean;
  showPopular?: boolean;
}

export function EnhancedSearchSuggestions({
  query,
  onSelectQuery,
  showHistory = true,
  showPopular = true,
}: EnhancedSearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [popular, setPopular] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const t = useTranslations('search');
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions();
      setShowSuggestions(true);
    } else if (query.length === 0) {
      loadHistoryAndPopular();
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryAndPopular = () => {
    if (showHistory) {
      const historyItems = getSearchHistory();
      setHistory(historyItems.slice(0, 5).map((item) => item.query));
    }
    
    // Popular searches would come from API / Populyar axtarışlar API-dən gələcək
    // For now, using mock data / İndilik mock data istifadə edirik
    if (showPopular) {
      setPopular(['Laptop', 'Phone', 'Headphones', 'Watch', 'Camera']);
    }
  };

  if (!showSuggestions) {
    return null;
  }

  const hasSuggestions = suggestions.length > 0;
  const hasHistory = showHistory && history.length > 0;
  const hasPopular = showPopular && popular.length > 0;

  if (!hasSuggestions && !hasHistory && !hasPopular) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-2 shadow-lg">
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {/* Search Suggestions / Axtarış Təklifləri */}
          {hasSuggestions && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Search className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {t('suggestions') || 'Suggestions'}
                </span>
              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search History / Axtarış Tarixçəsi */}
          {hasHistory && query.length === 0 && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {t('recentSearches') || 'Recent Searches'}
                </span>
              </div>
              <div className="space-y-1">
                {history.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectQuery(item);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches / Populyar Axtarışlar */}
          {hasPopular && query.length === 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {t('popularSearches') || 'Popular Searches'}
                </span>
              </div>
              <div className="space-y-1">
                {popular.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectQuery(item);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

