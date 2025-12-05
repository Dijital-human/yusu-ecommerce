/**
 * Real-Time Metrics Component / Real-Time Metrikalar Komponenti
 * Displays real-time analytics metrics with auto-refresh
 * Auto-refresh ilə real-time analytics metrikalarını göstərir
 */

'use client';

import { useEffect, useState } from 'react';
import { MetricsCard } from './MetricsCard';
import { Users, Eye, TrendingUp, DollarSign } from 'lucide-react';

interface RealTimeMetricsData {
  timestamp: string;
  timeRange: string;
  activeUsers: {
    count: number;
    change: number;
  };
  pageViews: {
    perMinute: number;
    total: number;
    change: number;
  };
  conversionRate: {
    value: number;
    change: number;
  };
  revenue: {
    total: number;
    orders: number;
    averageOrderValue: number;
    change: number;
  };
}

interface RealTimeMetricsProps {
  timeRange?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function RealTimeMetrics({
  timeRange = '1h',
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
}: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<RealTimeMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/analytics/realtime?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch real-time metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh, refreshInterval]);

  if (loading && !metrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Error loading metrics: {error}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Active Users"
        value={metrics.activeUsers.count}
        change={metrics.activeUsers.change}
        changeLabel="vs previous period"
        icon={<Users className="h-4 w-4" />}
      />
      <MetricsCard
        title="Page Views/min"
        value={metrics.pageViews.perMinute}
        change={metrics.pageViews.change}
        changeLabel="vs previous period"
        icon={<Eye className="h-4 w-4" />}
      />
      <MetricsCard
        title="Conversion Rate"
        value={`${metrics.conversionRate.value}%`}
        change={metrics.conversionRate.change}
        changeLabel="vs previous period"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <MetricsCard
        title="Revenue"
        value={`$${metrics.revenue.total.toLocaleString()}`}
        change={metrics.revenue.change}
        changeLabel="vs previous period"
        icon={<DollarSign className="h-4 w-4" />}
        formatValue={(v) => {
          if (typeof v === 'string') return v;
          return `$${v.toLocaleString()}`;
        }}
      />
    </div>
  );
}

