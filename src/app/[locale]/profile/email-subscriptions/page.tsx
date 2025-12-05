/**
 * Email Subscriptions Page / Email Abunəlikləri Səhifəsi
 * User email subscription management page / İstifadəçi email abunəlik idarəetmə səhifəsi
 */

import { Layout } from '@/components/layout/Layout';
import { EmailSubscriptions } from '@/components/email/EmailSubscriptions';
import { useTranslations } from 'next-intl';

export default function EmailSubscriptionsPage() {
  const t = useTranslations('emailSubscriptions');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('title') || 'Email Subscriptions'}
            </h1>
            <p className="text-gray-600">
              {t('description') || 'Manage your email subscription preferences'}
            </p>
          </div>

          <EmailSubscriptions />
        </div>
      </div>
    </Layout>
  );
}

