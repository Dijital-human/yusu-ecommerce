/**
 * Comparison Share Component / Müqayisə Paylaşımı Komponenti
 * Share comparison with others / Müqayisəni başqaları ilə paylaş
 */

'use client';

import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
}

interface ComparisonShareProps {
  products: Product[];
}

export function ComparisonShare({ products }: ComparisonShareProps) {
  const t = useTranslations('products');
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const productIds = products.map((p) => p.id).join(',');
    return `${window.location.origin}/compare?ids=${productIds}`;
  };

  const handleCopyLink = async () => {
    try {
      const url = generateShareUrl();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t('linkCopied') || 'Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(t('failedToCopy') || 'Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('productComparison') || 'Product Comparison',
          text: t('checkOutComparison') || 'Check out this product comparison',
          url: generateShareUrl(),
        });
      } catch (error) {
        // User cancelled or error occurred / İstifadəçi ləğv etdi və ya xəta baş verdi
      }
    } else {
      // Fallback to copy link / Link kopyalamağa fallback
      handleCopyLink();
    }
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {navigator.share ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {t('share') || 'Share'}
        </Button>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className="flex items-center gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            {t('copied') || 'Copied'}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            {t('copyLink') || 'Copy Link'}
          </>
        )}
      </Button>
    </div>
  );
}

