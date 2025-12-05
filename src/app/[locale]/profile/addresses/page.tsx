/**
 * Addresses Management Page / Ünvanlar İdarəetmə Səhifəsi
 * Manage user addresses / İstifadəçi ünvanlarını idarə et
 */

'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AddressList, Address } from '@/components/addresses/AddressList';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AddressesPage() {
  const t = useTranslations('addresses');
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAddresses = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      const response = await fetch('/api/addresses');
      const data = await response.json();

      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [session]);

  if (!session) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">{t('loginRequired') || 'Please login to manage your addresses'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">{t('myAddresses') || 'My Addresses'}</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <AddressList addresses={addresses} onUpdate={fetchAddresses} />
        )}
      </div>
    </Layout>
  );
}

