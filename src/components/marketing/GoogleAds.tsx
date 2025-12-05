/**
 * Google Ads Component / Google Ads Komponenti
 * Initializes and manages Google Ads tracking
 * Google Ads izləməsini initialize edir və idarə edir
 */

'use client';

import { useEffect } from 'react';
import { initGoogleAds } from '@/lib/marketing/google-ads';

interface GoogleAdsProps {
  conversionId?: string;
  enabled?: boolean;
}

export function GoogleAds({ conversionId, enabled = true }: GoogleAdsProps) {
  useEffect(() => {
    if (!enabled || !conversionId) return;

    // Initialize Google Ads / Google Ads-i initialize et
    initGoogleAds(conversionId);
  }, [conversionId, enabled]);

  return null;
}

