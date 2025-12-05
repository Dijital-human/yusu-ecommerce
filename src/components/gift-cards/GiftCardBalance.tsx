/**
 * Gift Card Balance Component / Hədiyyə Kartı Balansı Komponenti
 * Check gift card balance / Hədiyyə kartı balansını yoxla
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Wallet, Loader2, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function GiftCardBalance() {
  const t = useTranslations('giftCards');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [giftCard, setGiftCard] = useState<any>(null);

  const handleCheckBalance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error(t('enterGiftCardCode') || 'Please enter gift card code');
      return;
    }

    setIsLoading(true);
    setGiftCard(null);

    try {
      const response = await fetch(`/api/gift-cards?code=${encodeURIComponent(code.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get gift card');
      }

      setGiftCard(data.data);
    } catch (error: any) {
      toast.error(error.message || t('errorCheckingBalance') || 'Error checking balance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          <CardTitle>{t('checkBalance') || 'Check Gift Card Balance'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCheckBalance} className="space-y-4">
          <div>
            <Label htmlFor="balanceCode">
              {t('giftCardCode') || 'Gift Card Code'}
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="balanceCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="YUSU-XXXX-XXXX-XXXX"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {giftCard && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">{t('code') || 'Code'}</p>
                  <p className="font-mono font-semibold text-lg">{giftCard.code}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                  <span className="text-sm font-medium text-gray-700">
                    {t('currentBalance') || 'Current Balance'}:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(Number(giftCard.balance))}
                  </span>
                </div>
                {giftCard.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('originalAmount') || 'Original Amount'}:
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(Number(giftCard.amount))}
                    </span>
                  </div>
                )}
                {giftCard.expiryDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {t('expiresOn') || 'Expires On'}:
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {new Date(giftCard.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {giftCard.isActive === false && (
                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-sm text-red-600 font-medium">
                      {t('giftCardInactive') || 'Gift card is not active'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

