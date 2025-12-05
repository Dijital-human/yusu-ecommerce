/**
 * Share Product Modal Component / Məhsul Paylaşım Modal Komponenti
 * Modal for sharing product to social media / Məhsulu sosial mediaya paylaşmaq üçün modal
 */

'use client';

import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { SocialShareButton } from './SocialShareButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    description?: string;
    images: string | string[];
    price: number;
  };
  shareCount?: number;
}

export function ShareProductModal({
  isOpen,
  onClose,
  product,
  shareCount = 0,
}: ShareProductModalProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('social');
  const tCommon = useTranslations('common');

  if (!isOpen) return null;

  const productUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products/${product.id}`
    : '';
  
  const productImage = Array.isArray(product.images) 
    ? product.images[0] 
    : product.images;

  const handleCopyLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const platforms: Array<'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'linkedin' | 'pinterest' | 'email'> = [
    'facebook',
    'twitter',
    'whatsapp',
    'telegram',
    'linkedin',
    'pinterest',
    'email',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header / Başlıq */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t('shareProduct')}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={tCommon('close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content / Məzmun */}
        <div className="p-6">
          {/* Product Info / Məhsul Məlumatı */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {product.name}
            </h3>
            {shareCount > 0 && (
              <p className="text-sm text-gray-500">
                {t('sharedCount', { count: shareCount })}
              </p>
            )}
          </div>

          {/* Share Buttons / Paylaşım Düymələri */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-4">
              {t('shareTo')}:
            </p>
            <div className="grid grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <div key={platform} className="flex flex-col items-center">
                  <SocialShareButton
                    platform={platform}
                    url={productUrl}
                    title={product.name}
                    description={product.description}
                    imageUrl={productImage}
                    productId={product.id}
                    size="lg"
                  />
                  <span className="mt-2 text-xs text-gray-600 capitalize">
                    {platform}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Copy Link / Link Kopyala */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              {t('copyLink')}:
            </p>
            <div className="flex gap-2">
              <Input
                value={productUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant={copied ? 'default' : 'outline'}
                className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    {t('copied')}
                  </>
                ) : (
                  t('copy')
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer / Alt */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            {tCommon('close')}
          </Button>
        </div>
      </div>
    </div>
  );
}

