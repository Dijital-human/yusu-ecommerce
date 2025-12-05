/**
 * Metrics Chart Component / Metrikalar Qrafiki Komponenti
 * Reusable chart component for displaying metrics
 * Metrikaları göstərmək üçün yenidən istifadə olunan qrafik komponenti
 */

"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

interface MetricsChartProps {
  data: Array<{
    name: string;
    value: number;
    unit?: string;
  }>;
  type?: 'line' | 'bar';
  height?: number;
}

export function MetricsChart({ data, type = 'bar', height = 300 }: MetricsChartProps) {
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
  }));

  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `${value}${data[0]?.unit || ''}`} />
          <Legend />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => `${value}${data[0]?.unit || ''}`} />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}

