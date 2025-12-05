/**
 * Analytics Dashboard Page / Analytics Dashboard Səhifəsi
 * Real-time analytics dashboard with metrics, charts, and insights
 * Metrikalar, qrafiklər və analitika ilə real-time analytics dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Calendar } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }
  }, [session, status, router]);

  const handleRefresh = () => {
    setLastUpdate(new Date());
    // RealTimeMetrics component will handle the refresh
    window.location.reload();
  };

  if (status === 'loading') {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time insights and metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Time Range Selector / Vaxt Aralığı Seçicisi */}
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
              >
                {range === '1h' && 'Last Hour'}
                {range === '6h' && 'Last 6 Hours'}
                {range === '24h' && 'Last 24 Hours'}
                {range === '7d' && 'Last 7 Days'}
              </Button>
            ))}
          </div>
          {lastUpdate && (
            <span className="text-sm text-muted-foreground ml-auto">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Real-Time Metrics / Real-Time Metrikalar */}
        <div className="mb-8">
          <RealTimeMetrics
            timeRange={timeRange}
            autoRefresh={autoRefresh}
            refreshInterval={10000}
          />
        </div>

        {/* Additional Analytics Sections / Əlavə Analytics Bölmələri */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Top products section - Coming soon
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Traffic sources section - Coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

