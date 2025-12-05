/**
 * Gift Card History Component / Hədiyyə Kartı Tarixçəsi Komponenti
 * Display gift card transaction history / Hədiyyə kartı əməliyyat tarixçəsini göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { History, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';

interface GiftCardHistoryProps {
  giftCardId: string;
}

export function GiftCardHistory({ giftCardId }: GiftCardHistoryProps) {
  const t = useTranslations('giftCards');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [giftCardId]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/gift-cards/${giftCardId}/transactions`);
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching transactions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'redemption':
        return t('redemption') || 'Redemption';
      case 'refund':
        return t('refund') || 'Refund';
      case 'expiry':
        return t('expiry') || 'Expiry';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <CardTitle>{t('transactionHistory') || 'Transaction History'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">
            {t('noTransactions') || 'No transactions found'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-600" />
          <CardTitle>{t('transactionHistory') || 'Transaction History'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                    {transaction.order && (
                      <span className="text-xs text-gray-500">
                        ({t('order') || 'Order'}: {transaction.order.id})
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      Number(transaction.amount) < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  >
                    {Number(transaction.amount) < 0 ? '-' : '+'}
                    {formatCurrency(Math.abs(Number(transaction.amount)))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

