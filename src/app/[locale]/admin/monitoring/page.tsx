"use client";

/**
 * Monitoring Dashboard Page / Monitorinq Dashboard Səhifəsi
 * Real-time monitoring dashboard for system metrics
 * Sistem metrikaları üçün real-time monitoring dashboard
 */

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  Database,
  Server,
  Zap,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Clock,
  Package,
} from "lucide-react";

interface DashboardMetrics {
  timestamp: string;
  timeRange: string;
  period: {
    start: string;
    end: string;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    totalRequests: number;
    averageResponseTime: number;
  };
  api: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  database: {
    totalQueries: number;
    averageQueryTime: number;
    slowQueries: number;
    pool: {
      active: number;
      idle: number;
      total: number;
    };
  };
  redis: {
    available: boolean;
    uptime?: number;
    memory?: {
      used: string;
      peak: string;
    };
    stats?: {
      hits: number;
      misses: number;
      hitRate: string;
    };
    keys?: number;
    error?: string;
  };
  system: {
    counts: {
      products: number;
      orders: number;
      users: number;
      categories: number;
    };
    recent: {
      orders24h: number;
      users24h: number;
    };
  };
}

export default function MonitoringDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("1h");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "ADMIN") {
      router.push("/unauthorized");
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchMetrics();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchMetrics();
      }, 10000); // Refresh every 10 seconds / Hər 10 saniyədə bir yenilə

      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/monitoring/dashboard?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(data.error || "Failed to fetch metrics");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Failed to fetch dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Error / Xəta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchMetrics} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry / Yenidən cəhd et
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header / Başlıq */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Monitoring Dashboard / Monitorinq Dashboard</h1>
            <p className="text-gray-600">
              Last updated / Son yenilənmə: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="1h">Last Hour / Son Saat</option>
              <option value="6h">Last 6 Hours / Son 6 Saat</option>
              <option value="24h">Last 24 Hours / Son 24 Saat</option>
              <option value="7d">Last 7 Days / Son 7 Gün</option>
              <option value="30d">Last 30 Days / Son 30 Gün</option>
            </select>
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
            </Button>
            <Button onClick={fetchMetrics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh / Yenilə
            </Button>
          </div>
        </div>

        {/* System Overview Cards / Sistem Xülasəsi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products / Məhsullar</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.counts.products.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active products / Aktiv məhsullar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders / Sifarişlər</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.counts.orders.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.system.recent.orders24h} in last 24h / Son 24 saatda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users / İstifadəçilər</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.counts.users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.system.recent.users24h} in last 24h / Son 24 saatda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories / Kateqoriyalar</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.system.counts.categories.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total categories / Ümumi kateqoriyalar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics / Performans Metrikaları */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cache Performance / Cache Performansı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Cache Performance / Cache Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hit Rate / Hit Rate:</span>
                  <span className="font-semibold">{metrics.cache.hitRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Requests / Ümumi Sorğular:</span>
                  <span className="font-semibold">{metrics.cache.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hits / Hit-lər:</span>
                  <span className="font-semibold">{metrics.cache.hits.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Misses / Miss-lər:</span>
                  <span className="font-semibold">{metrics.cache.misses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response Time / Orta Cavab Vaxtı:</span>
                  <span className="font-semibold">{metrics.cache.averageResponseTime.toFixed(2)}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Performance / API Performansı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                API Performance / API Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Requests / Ümumi Sorğular:</span>
                  <span className="font-semibold">{metrics.api.totalRequests.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Response Time / Orta Cavab Vaxtı:</span>
                  <span className="font-semibold">{metrics.api.averageResponseTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P95 Response Time:</span>
                  <span className="font-semibold">{metrics.api.p95ResponseTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">P99 Response Time:</span>
                  <span className="font-semibold">{metrics.api.p99ResponseTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Error Rate / Xəta Rate-i:</span>
                  <span className={`font-semibold ${metrics.api.errorRate > 5 ? "text-red-600" : "text-green-600"}`}>
                    {metrics.api.errorRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Performance / Veritabanı Performansı */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Performance / Veritabanı Performansı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Queries / Ümumi Sorğular:</span>
                  <span className="font-semibold">{metrics.database.totalQueries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Query Time / Orta Sorğu Vaxtı:</span>
                  <span className="font-semibold">{metrics.database.averageQueryTime.toFixed(2)}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Slow Queries / Yavaş Sorğular:</span>
                  <span className={`font-semibold ${metrics.database.slowQueries > 0 ? "text-yellow-600" : "text-green-600"}`}>
                    {metrics.database.slowQueries}
                  </span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-2">Connection Pool / Connection Pool:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active / Aktiv:</span>
                      <span className="font-semibold">{metrics.database.pool.active}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Idle / Boş:</span>
                      <span className="font-semibold">{metrics.database.pool.idle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total / Ümumi:</span>
                      <span className="font-semibold">{metrics.database.pool.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Redis Status / Redis Statusu */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Redis Status / Redis Statusu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metrics.redis.available ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status / Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold">
                      Online
                    </span>
                  </div>
                  {metrics.redis.uptime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Uptime / İşləmə Müddəti:</span>
                      <span className="font-semibold">{formatUptime(metrics.redis.uptime)}</span>
                    </div>
                  )}
                  {metrics.redis.memory && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Memory Used / İstifadə Olunan Yaddaş:</span>
                        <span className="font-semibold">{metrics.redis.memory.used}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Memory Peak / Peak Yaddaş:</span>
                        <span className="font-semibold">{metrics.redis.memory.peak}</span>
                      </div>
                    </>
                  )}
                  {metrics.redis.stats && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Hit Rate / Hit Rate:</span>
                        <span className="font-semibold">{metrics.redis.stats.hitRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Keys / Açarlar:</span>
                        <span className="font-semibold">{metrics.redis.keys?.toLocaleString() || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">
                    Redis unavailable / Redis mövcud deyil
                  </p>
                  {metrics.redis.error && (
                    <p className="text-xs text-muted-foreground mt-2">{metrics.redis.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

/**
 * Format uptime in seconds to human-readable format / Saniyələrdə uptime-i insanların oxuya biləcəyi formata çevir
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

