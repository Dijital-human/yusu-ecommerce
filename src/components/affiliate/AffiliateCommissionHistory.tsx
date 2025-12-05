/**
 * Affiliate Commission History Component / Affiliate Komissiya Tarixçəsi Komponenti
 * Display commission history / Komissiya tarixçəsini göstər
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTranslations } from 'next-intl';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Commission {
  id: string;
  commissionAmount: number;
  status: string;
  createdAt: string;
  paidAt?: string;
  order: {
    id: string;
    totalAmount: number;
    createdAt: string;
  };
  link?: {
    linkCode: string;
    product?: {
      name: string;
    };
  };
}

export function AffiliateCommissionHistory() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const t = useTranslations('affiliate');
  const tCommon = useTranslations('common');

  useEffect(() => {
    fetchCommissions();
  }, [page, statusFilter]);

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/affiliate/commissions?page=${page}&limit=10${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`
      );
      const data = await response.json();
      if (data.success && data.data) {
        if (page === 1) {
          setCommissions(data.data.commissions);
        } else {
          setCommissions((prev) => [...prev, ...data.data.commissions]);
        }
        setHasMore(data.data.pagination.page < data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching commissions', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('paid') || 'Paid'}
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {t('approved') || 'Approved'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            {t('pending') || 'Pending'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            {t('rejected') || 'Rejected'}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t('commissionHistory') || 'Commission History'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
            >
              {tCommon('all') || 'All'}
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('pending');
                setPage(1);
              }}
            >
              {t('pending') || 'Pending'}
            </Button>
            <Button
              variant={statusFilter === 'paid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setStatusFilter('paid');
                setPage(1);
              }}
            >
              {t('paid') || 'Paid'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && commissions.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('noCommissions') || 'No commissions yet'}
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        ${commission.commissionAmount.toFixed(2)}
                      </span>
                      {getStatusBadge(commission.status)}
                    </div>
                    {commission.link?.product && (
                      <p className="text-sm text-gray-600">
                        {t('product') || 'Product'}: {commission.link.product.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {t('orderId') || 'Order ID'}: {commission.order.id}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </p>
                    {commission.paidAt && (
                      <p className="text-xs text-gray-500">
                        {t('paidAt') || 'Paid'}: {new Date(commission.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
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

