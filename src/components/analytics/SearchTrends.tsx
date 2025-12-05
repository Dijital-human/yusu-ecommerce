/**
 * Search Trends Component / Axtarış Trendləri Komponenti
 * Visualizes search trends and analytics
 * Axtarış trendləri və analitikanı görüntüləyir
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Search, ShoppingCart } from 'lucide-react';

interface SearchTrendsData {
  popular?: Array<{ query: string; count: number; avgResultsCount: number }>;
  trending?: Array<{ query: string; count: number; growth: number }>;
  volume?: Array<{ date: string; count: number }>;
  conversion?: {
    totalSearches: number;
    searchesWithPurchases: number;
    conversionRate: number;
    topConvertingSearches: Array<{
      query: string;
      searches: number;
      purchases: number;
      conversionRate: number;
    }>;
  };
}

interface SearchTrendsProps {
  days?: number;
  limit?: number;
}

export function SearchTrends({ days = 7, limit = 10 }: SearchTrendsProps) {
  const [data, setData] = useState<SearchTrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends();
  }, [days, limit]);

  const fetchTrends = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/analytics/search-trends?days=${days}&limit=${limit}&type=all`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch trends: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch trends');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch search trends:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gray-200 rounded" />
            <div className="h-16 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Popular Searches / Populyar Axtarışlar */}
      {data.popular && data.popular.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Popular Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.popular.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{item.query}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.avgResultsCount} avg results
                    </div>
                  </div>
                  <div className="text-sm font-medium">{item.count} searches</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trending Searches / Trend Axtarışlar */}
      {data.trending && data.trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trending.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{item.query}</div>
                    <div className={`text-sm ${item.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.growth > 0 ? '+' : ''}{item.growth.toFixed(1)}% growth
                    </div>
                  </div>
                  <div className="text-sm font-medium">{item.count} searches</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search to Purchase Conversion / Axtarışdan-alışa Konversiya */}
      {data.conversion && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Search to Purchase Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Searches</div>
                <div className="text-2xl font-bold">{data.conversion.totalSearches.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Searches with Purchases</div>
                <div className="text-2xl font-bold">{data.conversion.searchesWithPurchases.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="text-2xl font-bold">{data.conversion.conversionRate.toFixed(2)}%</div>
              </div>
            </div>

            {data.conversion.topConvertingSearches.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Top Converting Searches</h4>
                <div className="space-y-2">
                  {data.conversion.topConvertingSearches.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <div className="font-medium">{item.query}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.searches} searches → {item.purchases} purchases
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {item.conversionRate.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

