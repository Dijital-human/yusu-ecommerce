/**
 * Affiliate Link Generator Component / Affiliate Link Generator Komponenti
 * Generate affiliate links / Affiliate linkləri yarat
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';
import { Link2, Copy, Check, Plus } from 'lucide-react';

interface AffiliateLink {
  id: string;
  linkCode: string;
  productId?: string;
  clicks: number;
  conversions: number;
  product?: {
    id: string;
    name: string;
  };
}

interface AffiliateLinkGeneratorProps {
  onLinkCreated?: () => void;
}

export function AffiliateLinkGenerator({ onLinkCreated }: AffiliateLinkGeneratorProps) {
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const t = useTranslations('affiliate');
  const tCommon = useTranslations('common');

  const handleGenerateLink = async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/affiliate/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || t('failedToGenerateLink') || 'Failed to generate link');
      }

      setProductId('');
      if (onLinkCreated) {
        onLinkCreated();
      }
    } catch (err: any) {
      setError(err.message || t('failedToGenerateLink') || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getFullLink = (linkCode: string, productId?: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    if (productId) {
      return `${baseUrl}/products/${productId}?ref=${linkCode}`;
    }
    return `${baseUrl}?ref=${linkCode}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {t('generateLink') || 'Generate Affiliate Link'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
            {t('productId') || 'Product ID (Optional)'}
          </label>
          <Input
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder={t('productIdPlaceholder') || 'Enter product ID for specific product link...'}
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('productIdHint') || 'Leave empty to create a general affiliate link'}
          </p>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerateLink}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            tCommon('loading') || 'Loading...'
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              {t('generateLink') || 'Generate Link'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AffiliateLinkCard({ link }: { link: AffiliateLink }) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations('affiliate');
  const tCommon = useTranslations('common');

  const fullLink = typeof window !== 'undefined'
    ? link.productId
      ? `${window.location.origin}/products/${link.productId}?ref=${link.linkCode}`
      : `${window.location.origin}?ref=${link.linkCode}`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                {link.product ? link.product.name : t('generalLink') || 'General Link'}
              </p>
              <p className="text-xs text-gray-500 font-mono break-all">{fullLink}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="ml-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {t('clicks') || 'Clicks'}: <strong>{link.clicks}</strong>
            </span>
            <span>
              {t('conversions') || 'Conversions'}: <strong>{link.conversions}</strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

