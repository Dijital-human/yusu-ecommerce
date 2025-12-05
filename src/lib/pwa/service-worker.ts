/**
 * Service Worker Registration / Service Worker Qeydiyyatı
 * Registers service worker for PWA functionality
 * PWA funksionallığı üçün service worker qeydiyyatı
 */

'use client';

/**
 * Register service worker / Service worker qeyd et
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported / Service Worker dəstəklənmir');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service Worker registered / Service Worker qeyd edildi', registration);

    // Check for updates / Yeniləmələri yoxla
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available / Yeni service worker mövcuddur
            console.log('New service worker available / Yeni service worker mövcuddur');
            // You can show a notification to the user here / Burada istifadəçiyə bildiriş göstərə bilərsiniz
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed / Service Worker qeydiyyatı uğursuz oldu', error);
    return null;
  }
}

/**
 * Unregister service worker / Service worker qeydiyyatını ləğv et
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const unregistered = await registration.unregister();
    console.log('Service Worker unregistered / Service Worker qeydiyyatı ləğv edildi', unregistered);
    return unregistered;
  } catch (error) {
    console.error('Service Worker unregistration failed / Service Worker qeydiyyatını ləğv etmək uğursuz oldu', error);
    return false;
  }
}

/**
 * Check if service worker is supported / Service worker dəstəklənib-dəstəklənmədiyini yoxla
 */
export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator;
}

