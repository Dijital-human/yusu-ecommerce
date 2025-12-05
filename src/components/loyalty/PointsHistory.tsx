/**
 * Points History Component / Xal Tarixçəsi Komponenti
 * Display points transaction history / Xal əməliyyat tarixçəsini göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';
import { Plus, Minus, ShoppingCart, Star, UserPlus, Gift, Calendar } from 'lucide-react';

interface Transaction {
  id: string;
  points: number;
  type: string;
  description?: string;
  createdAt: string;
  order?: {
    id: string;
    totalAmount: number;
  };
}

export function PointsHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const t = useTranslations('loyalty');
  const tCommon = useTranslations('common');

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/loyalty/points?page=${page}&limit=10${typeFilter !== 'all' ? `&type=${typeFilter}` : ''}`
      );
      const data = await response.json();
      if (data.success && data.data) {
        if (page === 1) {
          setTransactions(data.data.transactions.transactions);
        } else {
          setTransactions((prev) => [...prev, ...data.data.transactions.transactions]);
        }
        setHasMore(data.data.transactions.pagination.page < data.data.transactions.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching transactions', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="h-4 w-4" />;
      case 'review':
        return <Star className="h-4 w-4" />;
      case 'referral':
        return <UserPlus className="h-4 w-4" />;
      case 'signup':
        return <Gift className="h-4 w-4" />;
      case 'redemption':
        return <Gift className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return t('purchase') || 'Purchase';
      case 'review':
        return t('review') || 'Review';
      case 'referral':
        return t('referral') || 'Referral';
      case 'signup':
        return t('signup') || 'Signup Bonus';
      case 'redemption':
        return t('redemption') || 'Redemption';
      case 'expiry':
        return t('expiry') || 'Expired';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('pointsHistory') || 'Points History'}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('all');
                setPage(1);
              }}
            >
              {tCommon('all') || 'All'}
            </Button>
            <Button
              variant={typeFilter === 'purchase' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('purchase');
                setPage(1);
              }}
            >
              {t('purchase') || 'Purchase'}
            </Button>
            <Button
              variant={typeFilter === 'redemption' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setTypeFilter('redemption');
                setPage(1);
              }}
            >
              {t('redemption') || 'Redemption'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && transactions.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noTransactions') || 'No transactions yet'}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.points > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.points > 0 ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {getTypeLabel(transaction.type)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getTypeIcon(transaction.type)}
                      </Badge>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    )}
                    {transaction.order && (
                      <p className="text-xs text-gray-500">
                        {t('order') || 'Order'}: {transaction.order.id}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}

            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={loading}
                >
                  {loading ? tCommon('loading') || 'Loading...' : t('loadMore') || 'Load More'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

