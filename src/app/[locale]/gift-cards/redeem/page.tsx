/**
 * Gift Card Redeem Page / Hədiyyə Kartı İstifadə Səhifəsi
 * Redeem gift card page / Hədiyyə kartı istifadə səhifəsi
 */

import { GiftCardRedeem } from '@/components/gift-cards/GiftCardRedeem';
import { useTranslations } from 'next-intl';

export default function GiftCardRedeemPage() {
  const t = useTranslations('giftCards');

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('redeemGiftCard') || 'Redeem Gift Card'}
        </h1>
        <p className="text-gray-600">
          {t('redeemDescription') || 'Enter your gift card code to redeem it'}
        </p>
      </div>

      <GiftCardRedeem />
    </div>
  );
}

