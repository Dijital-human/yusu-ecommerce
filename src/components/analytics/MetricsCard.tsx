/**
 * Metrics Card Component / Metrikalar Kartı Komponenti
 * Displays a single metric with optional change indicator
 * Tək metrik göstərir, opsional dəyişiklik göstəricisi ilə
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  formatValue?: (value: string | number) => string;
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  formatValue = (v) => String(v),
}: MetricsCardProps) {
  const formattedValue = formatValue(value);
  const changeValue = change !== undefined ? Math.abs(change) : 0;
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {isPositive && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
            {isNegative && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
            {isNeutral && <Minus className="h-3 w-3 text-gray-500 mr-1" />}
            <span className={isPositive ? 'text-green-500' : isNegative ? 'text-red-500' : 'text-gray-500'}>
              {changeValue > 0 ? '+' : ''}{changeValue.toFixed(1)}%
            </span>
            {changeLabel && <span className="ml-1">{changeLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

