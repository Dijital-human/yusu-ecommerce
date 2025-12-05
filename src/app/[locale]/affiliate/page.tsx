/**
 * Affiliate Dashboard Page / Affiliate Dashboard Səhifəsi
 * Main affiliate dashboard page / Əsas affiliate dashboard səhifəsi
 */

'use client';

import { Layout } from '@/components/layout/Layout';
import { AffiliateDashboard } from '@/components/affiliate/AffiliateDashboard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations('affiliate');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <AffiliateDashboard />
      </div>
    </Layout>
  );
}

