/**
 * Loyalty Dashboard Component / Sədaqət Dashboard Komponenti
 * Main loyalty program dashboard / Əsas sədaqət proqramı dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PointsBalance } from './PointsBalance';
import { PointsHistory } from './PointsHistory';
import { RewardsCatalog } from './RewardsCatalog';
import { PointsEarningInfo } from './PointsEarningInfo';
import { useTranslations } from 'next-intl';
import { Coins, History, Gift, Info } from 'lucide-react';

export function LoyaltyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userPoints, setUserPoints] = useState(0);
  const t = useTranslations('loyalty');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch('/api/loyalty/points');
      const data = await response.json();
      if (data.success && data.data) {
        setUserPoints(data.data.points.points);
      }
    } catch (error) {
      console.error('Error fetching points', error);
    }
  };

  const handleRedeem = () => {
    fetchPoints();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('loyaltyProgram') || 'Loyalty Program'}
        </h1>
        <p className="text-gray-600">
          {t('loyaltyDescription') || 'Earn points with every purchase and redeem them for rewards'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation / Tab Naviqasiyası */}
        <div className="flex gap-2 border-b border-gray-200">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="rounded-b-none"
          >
            <Coins className="h-4 w-4 mr-2" />
            {t('overview') || 'Overview'}
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="rounded-b-none"
          >
            <History className="h-4 w-4 mr-2" />
            {t('history') || 'History'}
          </Button>
          <Button
            variant={activeTab === 'rewards' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('rewards')}
            className="rounded-b-none"
          >
            <Gift className="h-4 w-4 mr-2" />
            {t('rewards') || 'Rewards'}
          </Button>
          <Button
            variant={activeTab === 'info' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('info')}
            className="rounded-b-none"
          >
            <Info className="h-4 w-4 mr-2" />
            {t('howToEarn') || 'How to Earn'}
          </Button>
        </div>

        {/* Tab Content / Tab Məzmunu */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <PointsBalance />
            <PointsEarningInfo />
          </div>
        )}

        {activeTab === 'history' && (
          <PointsHistory />
        )}

        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('availableRewards') || 'Available Rewards'}
              </h2>
            </div>
            <RewardsCatalog userPoints={userPoints} onRedeem={handleRedeem} />
          </div>
        )}

        {activeTab === 'info' && (
          <PointsEarningInfo />
        )}
      </div>
    </div>
  );
}

