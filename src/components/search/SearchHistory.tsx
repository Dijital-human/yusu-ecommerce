/**
 * Search History Component / Axtarış Tarixçəsi Komponenti
 * Display search history / Axtarış tarixçəsini göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { SearchHistoryItem } from '@/lib/search/search-history';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
  maxItems?: number;
}

export function SearchHistory({ onSelectQuery, maxItems = 5 }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations('search');

  useEffect(() => {
    if (session?.user) {
      loadHistory();
    }
  }, [session]);

  const loadHistory = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search/history?limit=${maxItems}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load search history / Axtarış tarixçəsini yükləmək uğursuz oldu', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (query: string) => {
    onSelectQuery(query);
  };

  const handleRemove = async (historyId: string) => {
    try {
      const response = await fetch(`/api/search/history?id=${historyId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to remove search history item / Axtarış tarixçəsi elementini silmək uğursuz oldu', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/search/history', {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to clear search history / Axtarış tarixçəsini təmizləmək uğursuz oldu', error);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="mt-2">
        <CardContent className="p-4">
          <div className="text-sm text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="mt-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {t('recentSearches') || 'Recent Searches'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {t('clear') || 'Clear'}
          </Button>
        </div>
        <div className="space-y-1">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors group"
            >
              <button
                onClick={() => handleSelect(item.query)}
                className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
              >
                {item.query}
                {item.resultsCount !== undefined && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.resultsCount} {t('results') || 'results'})
                  </span>
                )}
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

