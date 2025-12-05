/**
 * Monitoring Dashboard Component / Monitorinq Dashboard Komponenti
 * Main dashboard for displaying monitoring metrics
 * Monitorinq metrikalarını göstərmək üçün əsas dashboard
 */

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MetricsChart } from "./MetricsChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Skeleton } from "@/components/ui/Skeleton";
import { Activity, AlertTriangle, Database, Zap, Server } from "lucide-react";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface DashboardMetrics {
  apiResponseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  databaseQueryTime: {
    average: number;
    slowQueries: number;
  };
  errorRate: number;
  activeAlerts: number;
  cacheHitRate: number;
  systemHealth: {
    memory: number;
    cpu: number;
  };
}

export function MonitoringDashboard() {
  const t = useTranslations("monitoring");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch metrics from API / API-dən metrikaları al
        const [apiStats, dbStats, alerts, cacheStats] = await Promise.all([
          fetch('/api/monitoring/performance?type=api').then(r => r.json()),
          fetch('/api/monitoring/performance?type=database').then(r => r.json()),
          fetch('/api/monitoring/alerts').then(r => r.json()),
          fetch('/api/monitoring/cache').then(r => r.json()),
        ]);

        if (apiStats.success && dbStats.success && alerts.success && cacheStats.success) {
          setMetrics({
            apiResponseTime: {
              average: apiStats.data.averageResponseTime || 0,
              p95: apiStats.data.p95ResponseTime || 0,
              p99: apiStats.data.p99ResponseTime || 0,
            },
            databaseQueryTime: {
              average: dbStats.data.averageQueryTime || 0,
              slowQueries: dbStats.data.slowQueries || 0,
            },
            errorRate: apiStats.data.errorRate || 0,
            activeAlerts: alerts.data.filter((a: any) => !a.resolved).length || 0,
            cacheHitRate: cacheStats.data.hitRate || 0,
            systemHealth: {
              memory: 0, // Would need system metrics API / Sistem metrikaları API-si lazımdır
              cpu: 0,
            },
          });
        } else {
          throw new Error('Failed to fetch metrics');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        console.error("Error fetching monitoring metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds / Hər 30 saniyədə bir yenilə

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>{t('error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <Activity className="mr-2 h-4 w-4" /> {t('overview')}
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="mr-2 h-4 w-4" /> {t('performance')}
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="mr-2 h-4 w-4" /> {t('errors')}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" /> {t('alerts')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('apiResponseTime')}</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.apiResponseTime.average.toFixed(0) || 0}ms</div>
                <p className="text-xs text-muted-foreground">
                  P95: {metrics?.apiResponseTime.p95.toFixed(0) || 0}ms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('databaseQueryTime')}</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.databaseQueryTime.average.toFixed(0) || 0}ms</div>
                <p className="text-xs text-muted-foreground">
                  {t('slowQueries')}: {metrics?.databaseQueryTime.slowQueries || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('errorRate')}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.errorRate.toFixed(2) || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  {t('lastHour')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activeAlerts')}</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeAlerts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {t('requiresAttention')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('systemHealth')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsChart
                data={[
                  { name: t('cacheHitRate'), value: metrics?.cacheHitRate || 0, unit: '%' },
                  { name: t('memoryUsage'), value: metrics?.systemHealth.memory || 0, unit: '%' },
                  { name: t('cpuUsage'), value: metrics?.systemHealth.cpu || 0, unit: '%' },
                ]}
                type="bar"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('apiPerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <MetricsChart
                data={[
                  { name: t('average'), value: metrics?.apiResponseTime.average || 0, unit: 'ms' },
                  { name: 'P95', value: metrics?.apiResponseTime.p95 || 0, unit: 'ms' },
                  { name: 'P99', value: metrics?.apiResponseTime.p99 || 0, unit: 'ms' },
                ]}
                type="line"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('errorTrends')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('errorTrendsDescription')}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('activeAlerts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('alertsDescription')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

