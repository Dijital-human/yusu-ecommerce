/**
 * Gift Cards Page / Hədiyyə Kartları Səhifəsi
 * Main gift cards page / Əsas hədiyyə kartları səhifəsi
 */

'use client';

import { useState } from 'react';
import { GiftCardForm } from '@/components/gift-cards/GiftCardForm';
import { GiftCardBalance } from '@/components/gift-cards/GiftCardBalance';
import { Button } from '@/components/ui/Button';
import { Gift, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function GiftCardsPage() {
  const t = useTranslations('giftCards');
  const [activeTab, setActiveTab] = useState('purchase');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('title') || 'Gift Cards'}
        </h1>
        <p className="text-gray-600">
          {t('description') || 'Purchase or redeem gift cards for your shopping needs'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Tab Navigation / Tab Naviqasiyası */}
        <div className="flex gap-2 border-b border-gray-200">
          <Button
            variant={activeTab === 'purchase' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('purchase')}
            className="rounded-b-none"
          >
            <Gift className="h-4 w-4 mr-2" />
            {t('purchase') || 'Purchase'}
          </Button>
          <Button
            variant={activeTab === 'balance' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('balance')}
            className="rounded-b-none"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {t('checkBalance') || 'Check Balance'}
          </Button>
        </div>

        {/* Tab Content / Tab Məzmunu */}
        {activeTab === 'purchase' && <GiftCardForm />}
        {activeTab === 'balance' && <GiftCardBalance />}
      </div>
    </div>
  );
}

