/**
 * Gift Card Redeem Component / Hədiyyə Kartı İstifadə Komponenti
 * Redeem gift card / Hədiyyə kartını istifadə et
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Gift, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface GiftCardRedeemProps {
  onRedeem?: (giftCard: any) => void;
  initialCode?: string;
}

export function GiftCardRedeem({ onRedeem, initialCode = '' }: GiftCardRedeemProps) {
  const t = useTranslations('giftCards');
  const [code, setCode] = useState(initialCode);
  const [isValidating, setIsValidating] = useState(false);
  const [giftCard, setGiftCard] = useState<any>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!code.trim()) {
      setValidationError(t('enterGiftCardCode') || 'Please enter gift card code');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const response = await fetch(`/api/gift-cards/redeem?code=${encodeURIComponent(code.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Validation failed');
      }

      if (data.data.isValid) {
        setGiftCard(data.data.giftCard);
        toast.success(t('giftCardValid') || 'Gift card is valid!');
      } else {
        setGiftCard(null);
        setValidationError(data.data.error || t('invalidGiftCard') || 'Invalid gift card');
        toast.error(data.data.error || t('invalidGiftCard') || 'Invalid gift card');
      }
    } catch (error: any) {
      setGiftCard(null);
      setValidationError(error.message || t('errorValidating') || 'Error validating gift card');
      toast.error(error.message || t('errorValidating') || 'Error validating gift card');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRedeem = async () => {
    if (!giftCard) return;

    if (onRedeem) {
      onRedeem(giftCard);
    } else {
      toast.success(t('giftCardRedeemed') || 'Gift card redeemed successfully!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-blue-600" />
          <CardTitle>{t('redeemGiftCard') || 'Redeem Gift Card'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Code Input / Kod Daxil Etmə */}
        <div>
          <Label htmlFor="giftCardCode">
            {t('giftCardCode') || 'Gift Card Code'}
          </Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="giftCardCode"
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setGiftCard(null);
                setValidationError(null);
              }}
              placeholder="YUSU-XXXX-XXXX-XXXX"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleValidate}
              disabled={isValidating || !code.trim()}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('validate') || 'Validate'
              )}
            </Button>
          </div>
        </div>

        {/* Validation Result / Yoxlama Nəticəsi */}
        {giftCard && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900 mb-2">
                  {t('giftCardValid') || 'Gift Card is Valid!'}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('code') || 'Code'}:</span>
                    <span className="font-medium">{giftCard.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('balance') || 'Balance'}:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(Number(giftCard.balance))}
                    </span>
                  </div>
                  {giftCard.expiryDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('expiresOn') || 'Expires On'}:</span>
                      <span className="font-medium">
                        {new Date(giftCard.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleRedeem}
                  className="mt-3 w-full"
                  variant="default"
                >
                  {t('useGiftCard') || 'Use Gift Card'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {validationError && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">
                  {t('validationFailed') || 'Validation Failed'}
                </p>
                <p className="text-sm text-red-700 mt-1">{validationError}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

