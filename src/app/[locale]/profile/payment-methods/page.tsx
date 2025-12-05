/**
 * Payment Methods Management Page / Ödəniş Metodları İdarəetmə Səhifəsi
 * Manage user payment methods / İstifadəçi ödəniş metodlarını idarə et
 */

'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { SavedPaymentMethods, PaymentMethod } from '@/components/payments/SavedPaymentMethods';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';

export default function PaymentMethodsPage() {
  const t = useTranslations('payments');
  const { data: session } = useSession();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPaymentMethods = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/payments/methods');
      const data = await response.json();

      if (data.success) {
        setPaymentMethods(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [session]);

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">{t('loginRequired') || 'Please login to manage your payment methods'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">{t('myPaymentMethods') || 'My Payment Methods'}</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <SavedPaymentMethods paymentMethods={paymentMethods} onUpdate={fetchPaymentMethods} />
        )}
      </div>
    </Layout>
  );
}

