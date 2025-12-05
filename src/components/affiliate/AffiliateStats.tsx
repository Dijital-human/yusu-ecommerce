/**
 * Affiliate Stats Component / Affiliate Statistika Komponenti
 * Display affiliate statistics / Affiliate statistikalarını göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrendingUp, MousePointerClick, ShoppingCart, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AffiliateStatsProps {
  affiliateId?: string;
}

interface Stats {
  totalLinks: number;
  totalClicks: number;
  totalConversions: number;
  conversionRate: number;
  totalEarned: number;
  pendingAmount: number;
  totalPaid: number;
  availableBalance: number;
}

export function AffiliateStats({ affiliateId }: AffiliateStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('affiliate');

  useEffect(() => {
    fetchStats();
  }, [affiliateId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/stats');
      const data = await response.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching affiliate stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: t('totalEarned') || 'Total Earned',
      value: `$${stats.totalEarned.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: t('pendingAmount') || 'Pending',
      value: `$${stats.pendingAmount.toFixed(2)}`,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: t('totalClicks') || 'Total Clicks',
      value: stats.totalClicks.toLocaleString(),
      icon: MousePointerClick,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: t('conversionRate') || 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(2)}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-full`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('totalLinks') || 'Total Links'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLinks}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('totalConversions') || 'Total Conversions'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalConversions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('availableBalance') || 'Available Balance'}</p>
                <p className="text-2xl font-bold text-gray-900">${stats.availableBalance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

