/**
 * Points Balance Component / Xal Balansı Komponenti
 * Display user points balance / İstifadəçi xal balansını göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Coins, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PointsBalance {
  points: number;
  totalEarned: number;
  totalSpent: number;
  expiryDate?: string;
}

export function PointsBalance() {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('loyalty');

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/loyalty/points');
      const data = await response.json();
      if (data.success && data.data) {
        setBalance(data.data.points);
      }
    } catch (error) {
      console.error('Error fetching points balance', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Coins className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{t('currentBalance') || 'Current Balance'}</p>
            <p className="text-3xl font-bold text-gray-900">{balance.points.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{t('points') || 'points'}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{t('totalEarned') || 'Total Earned'}</p>
            <p className="text-3xl font-bold text-gray-900">{balance.totalEarned.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{t('points') || 'points'}</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 mb-1">{t('totalSpent') || 'Total Spent'}</p>
            <p className="text-3xl font-bold text-gray-900">{balance.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{t('points') || 'points'}</p>
          </div>
        </div>

        {balance.expiryDate && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              {t('pointsExpireOn') || 'Points expire on'}: {new Date(balance.expiryDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

