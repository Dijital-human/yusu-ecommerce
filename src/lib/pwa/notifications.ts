/**
 * Push Notifications Service / Push Bildirişlər Xidməti
 * Provides push notification functionality for PWA
 * PWA üçün push bildiriş funksionallığı təmin edir
 */

'use client';

/**
 * Request notification permission / Bildiriş icazəsi tələb et
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications are not supported / Bildirişlər dəstəklənmir');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Show notification / Bildiriş göstər
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('Notifications are not supported / Bildirişlər dəstəklənmir');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted / Bildiriş icazəsi verilməyib');
    return null;
  }

  const notification = new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    ...options,
  });

  return notification;
}

/**
 * Check if notifications are supported / Bildirişlərin dəstəklənib-dəstəklənmədiyini yoxla
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Check if service worker notifications are supported / Service worker bildirişlərinin dəstəklənib-dəstəklənmədiyini yoxla
 */
export function isServiceWorkerNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Subscribe to push notifications / Push bildirişlərinə abunə ol
 */
export async function subscribeToPushNotifications(
  serviceWorkerRegistration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  if (!isServiceWorkerNotificationSupported()) {
    console.warn('Push notifications are not supported / Push bildirişlər dəstəklənmir');
    return null;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ? urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
        : undefined,
    });

    console.log('Subscribed to push notifications / Push bildirişlərinə abunə olundu', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications / Push bildirişlərinə abunə olmaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications / Push bildirişlərinə abunəni ləğv et
 */
export async function unsubscribeFromPushNotifications(
  subscription: PushSubscription
): Promise<boolean> {
  try {
    const result = await subscription.unsubscribe();
    console.log('Unsubscribed from push notifications / Push bildirişlərinə abunə ləğv edildi', result);
    return result;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications / Push bildirişlərinə abunəni ləğv etmək uğursuz oldu', error);
    return false;
  }
}

/**
 * Convert VAPID public key to Uint8Array / VAPID public key-i Uint8Array-ə çevir
 */
function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray.buffer;
}

