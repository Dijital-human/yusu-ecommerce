/**
 * Price Alert Button Component / Qiymət Bildirişi Düyməsi Komponenti
 * Create/manage price alerts for wishlist items / İstək siyahısı elementləri üçün qiymət bildirişləri yarat/idarə et
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface PriceAlertButtonProps {
  productId: string;
  wishlistItemId?: string;
  currentPrice: number;
}

export function PriceAlertButton({ productId, wishlistItemId, currentPrice }: PriceAlertButtonProps) {
  const [hasAlert, setHasAlert] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number>(currentPrice * 0.9); // 10% discount default
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('wishlist');

  useEffect(() => {
    checkAlert();
  }, [productId]);

  const checkAlert = async () => {
    try {
      const response = await fetch('/api/wishlist/alerts');
      const data = await response.json();
      if (data.success) {
        const alert = data.data.find((a: any) => a.productId === productId);
        if (alert && alert.isActive) {
          setHasAlert(true);
          setTargetPrice(Number(alert.targetPrice));
        }
      }
    } catch (error) {
      console.error('Error checking alert', error);
    }
  };

  const handleCreateAlert = async () => {
    if (targetPrice >= currentPrice) {
      alert(t('targetPriceMustBeLower') || 'Target price must be lower than current price');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/wishlist/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          wishlistItemId,
          targetPrice,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setHasAlert(true);
        setShowInput(false);
      } else {
        alert(data.error || t('failedToCreateAlert') || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert', error);
      alert(t('failedToCreateAlert') || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/wishlist/alerts?productId=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        setHasAlert(false);
        setShowInput(false);
      }
    } catch (error) {
      console.error('Error deleting alert', error);
    } finally {
      setLoading(false);
    }
  };

  if (showInput) {
    return (
      <div className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div>
          <label className="text-xs font-medium text-gray-700 mb-1 block">
            {t('targetPrice') || 'Target Price'}
          </label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
            min={0}
            step={0.01}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('currentPrice') || 'Current'}: ${currentPrice.toFixed(2)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleCreateAlert}
            disabled={loading || targetPrice >= currentPrice}
            className="flex-1"
          >
            {hasAlert ? (t('updateAlert') || 'Update Alert') : (t('createAlert') || 'Create Alert')}
          </Button>
          {hasAlert && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAlert}
              disabled={loading}
            >
              {t('remove') || 'Remove'}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInput(false)}
            disabled={loading}
          >
            {t('cancel') || 'Cancel'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={hasAlert ? 'default' : 'outline'}
      size="sm"
      onClick={() => setShowInput(true)}
      className="w-full"
    >
      {hasAlert ? (
        <>
          <Bell className="h-4 w-4 mr-1" />
          {t('alertActive') || 'Alert Active'}
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4 mr-1" />
          {t('createPriceAlert') || 'Create Price Alert'}
        </>
      )}
    </Button>
  );
}

