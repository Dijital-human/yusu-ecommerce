/**
 * Rewards Catalog Component / Mükafatlar Kataloqu Komponenti
 * Display available rewards / Mövcud mükafatları göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';
import { Gift, ShoppingBag, Truck, CreditCard, CheckCircle } from 'lucide-react';

interface Reward {
  id: string;
  pointsRequired: number;
  rewardType: string;
  rewardValue: number;
}

interface RewardsCatalogProps {
  userPoints?: number;
  onRedeem?: () => void;
}

export function RewardsCatalog({ userPoints = 0, onRedeem }: RewardsCatalogProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const t = useTranslations('loyalty');
  const tCommon = useTranslations('common');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/loyalty/rewards');
      const data = await response.json();
      if (data.success && data.data) {
        setRewards(data.data.rewards);
      }
    } catch (error) {
      console.error('Error fetching rewards', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    if (redeeming) return;

    setRedeeming(rewardId);
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rewardId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t('failedToRedeem') || 'Failed to redeem reward');
      }

      if (onRedeem) {
        onRedeem();
      }
      
      // Refresh rewards / Mükafatları yenilə
      fetchRewards();
    } catch (error: any) {
      alert(error.message || t('failedToRedeem') || 'Failed to redeem reward');
    } finally {
      setRedeeming(null);
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'discount':
        return <ShoppingBag className="h-6 w-6" />;
      case 'free_shipping':
        return <Truck className="h-6 w-6" />;
      case 'gift_card':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <Gift className="h-6 w-6" />;
    }
  };

  const getRewardLabel = (type: string, value: number) => {
    switch (type) {
      case 'discount':
        return `$${value.toFixed(2)} ${t('discount') || 'Discount'}`;
      case 'free_shipping':
        return t('freeShipping') || 'Free Shipping';
      case 'gift_card':
        return `$${value.toFixed(2)} ${t('giftCard') || 'Gift Card'}`;
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t('noRewards') || 'No rewards available'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((reward) => {
        const canRedeem = userPoints >= reward.pointsRequired;
        const Icon = getRewardIcon(reward.rewardType);

        return (
          <Card key={reward.id} className={canRedeem ? 'border-green-200' : ''}>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className={`p-4 rounded-full ${
                    canRedeem ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {Icon}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {getRewardLabel(reward.rewardType, Number(reward.rewardValue))}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reward.pointsRequired.toLocaleString()} {t('points') || 'points'}
                  </p>
                </div>

                <Button
                  onClick={() => handleRedeem(reward.id)}
                  disabled={!canRedeem || redeeming === reward.id}
                  className="w-full"
                  variant={canRedeem ? 'default' : 'outline'}
                >
                  {redeeming === reward.id ? (
                    tCommon('loading') || 'Loading...'
                  ) : canRedeem ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('redeem') || 'Redeem'}
                    </>
                  ) : (
                    t('insufficientPoints') || 'Insufficient Points'
                  )}
                </Button>

                {!canRedeem && (
                  <p className="text-xs text-gray-500">
                    {t('needMorePoints') || 'Need'} {reward.pointsRequired - userPoints} {t('morePoints') || 'more points'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

