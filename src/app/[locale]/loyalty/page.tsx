/**
 * Loyalty Program Page / Sədaqət Proqramı Səhifəsi
 * Main loyalty program page / Əsas sədaqət proqramı səhifəsi
 */

'use client';

import { Layout } from '@/components/layout/Layout';
import { LoyaltyDashboard } from '@/components/loyalty/LoyaltyDashboard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoyaltyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
        <LoyaltyDashboard />
      </div>
    </Layout>
  );
}

