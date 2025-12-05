/**
 * AR Viewer / AR Görüntüləyici
 * Utility functions for AR preview / AR önizləmə üçün yardımçı funksiyalar
 */

/**
 * Check if AR is supported / AR-nin dəstəklənib-dəstəklənmədiyini yoxla
 */
export async function isARSupported(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.xr) {
    return false;
  }

  try {
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
    return isSupported;
  } catch (error) {
    return false;
  }
}

/**
 * Check if device supports AR / Cihazın AR dəstəklədiyini yoxla
 */
export function isDeviceARCapable(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Check for iOS ARKit / iOS ARKit yoxla
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isIOS13 = isIOS && /OS 13/.test(navigator.userAgent);

  // Check for Android ARCore / Android ARCore yoxla
  const isAndroid = /Android/.test(navigator.userAgent);

  // Check for WebXR support / WebXR dəstəyini yoxla
  const hasWebXR = typeof navigator.xr !== 'undefined';

  return isIOS13 || isAndroid || hasWebXR;
}

/**
 * Get AR platform info / AR platform məlumatını al
 */
export function getARPlatform(): 'ios' | 'android' | 'webxr' | 'unsupported' {
  if (typeof navigator === 'undefined') {
    return 'unsupported';
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const hasWebXR = typeof navigator.xr !== 'undefined';

  if (isIOS) {
    return 'ios';
  } else if (isAndroid) {
    return 'android';
  } else if (hasWebXR) {
    return 'webxr';
  }

  return 'unsupported';
}

/**
 * Initialize AR session / AR sessiyasını başlat
 */
export async function initializeARSession(): Promise<XRSession | null> {
  if (typeof navigator === 'undefined' || !navigator.xr) {
    return null;
  }

  try {
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local-floor'],
      optionalFeatures: ['bounded-floor'],
    });

    return session;
  } catch (error) {
    console.error('Failed to initialize AR session / AR sessiyasını başlatmaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Get AR button text based on platform / Platforma əsasən AR düymə mətnini al
 */
export function getARButtonText(platform: 'ios' | 'android' | 'webxr' | 'unsupported'): string {
  switch (platform) {
    case 'ios':
      return 'View in AR (ARKit)';
    case 'android':
      return 'View in AR (ARCore)';
    case 'webxr':
      return 'View in AR (WebXR)';
    default:
      return 'AR Not Supported';
  }
}

