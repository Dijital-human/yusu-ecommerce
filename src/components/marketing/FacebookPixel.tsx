/**
 * Facebook Pixel Component / Facebook Pixel Komponenti
 * Initializes and manages Facebook Pixel tracking
 * Facebook Pixel izləməsini initialize edir və idarə edir
 */

'use client';

import { useEffect } from 'react';
import { initFacebookPixel } from '@/lib/marketing/facebook-pixel';

interface FacebookPixelProps {
  pixelId?: string;
  enabled?: boolean;
}

export function FacebookPixel({ pixelId, enabled = true }: FacebookPixelProps) {
  useEffect(() => {
    if (!enabled || !pixelId) return;

    // Initialize Facebook Pixel / Facebook Pixel-i initialize et
    initFacebookPixel(pixelId);
  }, [pixelId, enabled]);

  return null;
}

