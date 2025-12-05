/**
 * PWA Register Component / PWA Qeydiyyat Komponenti
 * Registers service worker and handles PWA setup
 * Service worker qeyd edir və PWA quraşdırmasını idarə edir
 */

'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/service-worker';

export function PWARegister() {
  useEffect(() => {
    // Register service worker on mount / Mount zamanı service worker qeyd et
    registerServiceWorker().catch((error) => {
      console.error('Failed to register service worker / Service worker qeydiyyatı uğursuz oldu', error);
    });
  }, []);

  return null;
}

