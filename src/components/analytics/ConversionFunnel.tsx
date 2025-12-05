/**
 * Conversion Funnel Component / Konversiya Funnel Komponenti
 * Visualizes conversion funnel with drop-off rates
 * Drop-off dərəcələri ilə konversiya funnel görüntüləyir
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FunnelStage } from '@/lib/analytics/funnel';

interface ConversionFunnelProps {
  startDate?: string;
  endDate?: string;
}

export function ConversionFunnel({ startDate, endDate }: ConversionFunnelProps) {
  const [funnel, setFunnel] = useState<{
    stages: FunnelStage[];
    totalVisitors: number;
    totalConversions: number;
    overallConversionRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunnel();
  }, [startDate, endDate]);

  const fetchFunnel = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/analytics/funnel?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch funnel: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setFunnel(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch funnel');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch conversion funnel:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-sm">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!funnel) {
    return null;
  }

  const maxCount = Math.max(...funnel.stages.map(s => s.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Overall conversion rate: {funnel.overallConversionRate}%
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnel.stages.map((stage, index) => {
            const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            
            return (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <div className="flex items-center gap-4">
                    <span>{stage.count.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      {stage.percentage.toFixed(1)}%
                    </span>
                    {index > 0 && (
                      <span className="text-red-500 text-xs">
                        -{stage.dropOffRate.toFixed(1)}% drop-off
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${width}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {stage.count.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

