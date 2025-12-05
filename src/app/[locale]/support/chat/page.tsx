/**
 * Support Chat Page / Dəstək Chat Səhifəsi
 * Full-page chat interface for customer support / Müştəri dəstəyi üçün tam səhifə chat interfeysi
 */

'use client';

import { Layout } from '@/components/layout/Layout';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SupportChatPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') || undefined;
  const orderId = searchParams.get('orderId') || undefined;
  const t = useTranslations('chat');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('customerSupport') || 'Customer Support'}
            </h1>
            <p className="text-gray-600">
              {t('chatDescription') || 'Chat with our support team for assistance'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-[600px]">
            <ChatWindow productId={productId} orderId={orderId} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

