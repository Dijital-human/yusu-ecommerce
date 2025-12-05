/**
 * Cookie Manager / Cookie Meneceri
 * Cookie preferences management / Cookie tərcihləri idarəetməsi
 */

import { logger } from '@/lib/utils/logger';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface CookieConsent {
  preferences: CookiePreferences;
  consentedAt: Date;
  consentId: string;
}

const COOKIE_PREFERENCES_KEY = 'cookie_preferences';
const COOKIE_CONSENT_KEY = 'cookie_consent';
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

/**
 * Get cookie preferences from localStorage / localStorage-dan cookie tərcihlərini al
 */
export function getCookiePreferences(): CookiePreferences | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    logger.error('Failed to get cookie preferences / Cookie tərcihlərini almaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Save cookie preferences to localStorage / Cookie tərcihlərini localStorage-a yadda saxla
 */
export function saveCookiePreferences(preferences: CookiePreferences): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    
    // Also save consent record / Həmçinin razılıq qeydini yadda saxla
    const consent: CookieConsent = {
      preferences,
      consentedAt: new Date(),
      consentId: `consent_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    
    logger.info('Cookie preferences saved / Cookie tərcihləri yadda saxlanıldı', preferences);
  } catch (error) {
    logger.error('Failed to save cookie preferences / Cookie tərcihlərini yadda saxlamaq uğursuz oldu', error);
  }
}

/**
 * Check if user has consented to cookies / İstifadəçinin cookie-lərə razılıq verib-verimədiyini yoxla
 */
export function hasCookieConsent(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) return false;
    
    const consentData: CookieConsent = JSON.parse(consent);
    const consentDate = new Date(consentData.consentedAt);
    const expiryDate = new Date(consentDate);
    expiryDate.setDate(expiryDate.getDate() + COOKIE_CONSENT_EXPIRY_DAYS);
    
    return new Date() < expiryDate;
  } catch (error) {
    logger.error('Failed to check cookie consent / Cookie razılığını yoxlamaq uğursuz oldu', error);
    return false;
  }
}

/**
 * Get cookie consent record / Cookie razılıq qeydini al
 */
export function getCookieConsent(): CookieConsent | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    logger.error('Failed to get cookie consent / Cookie razılığını almaq uğursuz oldu', error);
    return null;
  }
}

/**
 * Withdraw cookie consent / Cookie razılığını geri götür
 */
export function withdrawCookieConsent(): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Remove consent / Razılığı sil
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    
    // Set all non-essential cookies to false / Bütün qeyri-zəruri cookie-ləri false et
    const preferences: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveCookiePreferences(preferences);
    
    // Delete non-essential cookies / Qeyri-zəruri cookie-ləri sil
    deleteNonEssentialCookies();
    
    logger.info('Cookie consent withdrawn / Cookie razılığı geri götürüldü');
  } catch (error) {
    logger.error('Failed to withdraw cookie consent / Cookie razılığını geri götürmək uğursuz oldu', error);
  }
}

/**
 * Delete non-essential cookies / Qeyri-zəruri cookie-ləri sil
 */
export function deleteNonEssentialCookies(): void {
  try {
    if (typeof window === 'undefined') return;
    
    const preferences = getCookiePreferences();
    if (!preferences) return;
    
    // Get all cookies / Bütün cookie-ləri al
    const cookies = document.cookie.split(';');
    
    // Define cookie categories / Cookie kateqoriyalarını təyin et
    const analyticsCookies = ['_ga', '_gid', '_gat', '_gtag', '_fbp', '_fbc'];
    const marketingCookies = ['_fbp', '_fbc', 'ads_prefs', 'ad_id'];
    const functionalCookies = ['theme', 'language', 'currency'];
    
    // Delete cookies based on preferences / Tərcihlərə əsasən cookie-ləri sil
    cookies.forEach((cookie) => {
      const cookieName = cookie.split('=')[0].trim();
      
      if (!preferences.analytics && analyticsCookies.some((name) => cookieName.startsWith(name))) {
        deleteCookie(cookieName);
      }
      if (!preferences.marketing && marketingCookies.some((name) => cookieName.startsWith(name))) {
        deleteCookie(cookieName);
      }
      if (!preferences.functional && functionalCookies.includes(cookieName)) {
        deleteCookie(cookieName);
      }
    });
    
    logger.info('Non-essential cookies deleted / Qeyri-zəruri cookie-lər silindi');
  } catch (error) {
    logger.error('Failed to delete non-essential cookies / Qeyri-zəruri cookie-ləri silmək uğursuz oldu', error);
  }
}

/**
 * Delete a specific cookie / Xüsusi cookie sil
 */
function deleteCookie(name: string): void {
  try {
    if (typeof window === 'undefined') return;
    
    // Delete cookie by setting expiry to past / Cookie-ni keçmiş tarixə təyin edərək sil
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
  } catch (error) {
    logger.error(`Failed to delete cookie ${name} / Cookie ${name} silmək uğursuz oldu`, error);
  }
}

/**
 * Set cookie with preferences / Cookie-ni tərcihlərlə təyin et
 */
export function setCookie(name: string, value: string, days: number = 365): void {
  try {
    if (typeof window === 'undefined') return;
    
    const preferences = getCookiePreferences();
    if (!preferences) return;
    
    // Check if cookie category is allowed / Cookie kateqoriyasının icazə verilib-verilmədiyini yoxla
    const analyticsCookies = ['_ga', '_gid', '_gat', '_gtag'];
    const marketingCookies = ['_fbp', '_fbc'];
    const functionalCookies = ['theme', 'language'];
    
    if (analyticsCookies.includes(name) && !preferences.analytics) {
      return;
    }
    if (marketingCookies.includes(name) && !preferences.marketing) {
      return;
    }
    if (functionalCookies.includes(name) && !preferences.functional) {
      return;
    }
    
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    logger.error(`Failed to set cookie ${name} / Cookie ${name} təyin etmək uğursuz oldu`, error);
  }
}

/**
 * Get cookie value / Cookie dəyərini al
 */
export function getCookie(name: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length, cookie.length);
      }
    }
    return null;
  } catch (error) {
    logger.error(`Failed to get cookie ${name} / Cookie ${name} almaq uğursuz oldu`, error);
    return null;
  }
}

