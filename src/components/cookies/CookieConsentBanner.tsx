/**
 * Cookie Consent Banner Component / Cookie Razılıq Banner Komponenti
 * GDPR-compliant cookie consent banner / GDPR uyğun cookie razılıq banner-i
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';
import { Cookie, X, Settings, CheckCircle } from 'lucide-react';
import { hasCookieConsent, saveCookiePreferences, getCookiePreferences, CookiePreferences } from '@/lib/cookies/cookie-manager';
import { useTranslations } from 'next-intl';

export function CookieConsentBanner() {
  const t = useTranslations('cookies');
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already consented / İstifadəçinin artıq razılıq verib-verimədiyini yoxla
    if (!hasCookieConsent()) {
      // Load saved preferences if any / Varsa saxlanılmış tərcihləri yüklə
      const saved = getCookiePreferences();
      if (saved) {
        setPreferences(saved);
      }
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveCookiePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveCookiePreferences(onlyEssential);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled / Zəruri cookie-lər deaktiv edilə bilməz
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('consentTitle') || 'We use cookies'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {t('consentDescription') || 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                    <Link href="/cookies" className="hover:underline">
                      {t('cookiePolicy') || 'Cookie Policy'}
                    </Link>
                    <span>•</span>
                    <Link href="/privacy" className="hover:underline">
                      {t('privacyPolicy') || 'Privacy Policy'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none"
              >
                <Settings className="h-4 w-4 mr-2" />
                {t('customize') || 'Customize'}
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                size="sm"
                className="flex-1 md:flex-none border-red-300 text-red-600 hover:bg-red-50"
              >
                {t('rejectAll') || 'Reject All'}
              </Button>
              <Button
                onClick={handleAcceptAll}
                size="sm"
                className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('acceptAll') || 'Accept All'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('customizePreferences') || 'Customize Cookie Preferences'}
              </h3>
              <Button
                onClick={() => setShowSettings(false)}
                variant="ghost"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {/* Essential Cookies - Always On / Zəruri Cookie-lər - Həmişə Aktiv */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">
                    {t('essentialCookies') || 'Essential Cookies'}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('essentialCookiesDesc') || 'Required for website functionality'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{t('alwaysOn') || 'Always On'}</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>

              {/* Analytics Cookies / Analitika Cookie-ləri */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <label className="font-medium text-gray-900">
                    {t('analyticsCookies') || 'Analytics Cookies'}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('analyticsCookiesDesc') || 'Help us understand how visitors use our website'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </div>

              {/* Marketing Cookies / Marketinq Cookie-ləri */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <label className="font-medium text-gray-900">
                    {t('marketingCookies') || 'Marketing Cookies'}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('marketingCookiesDesc') || 'Used to deliver personalized advertisements'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </div>

              {/* Functional Cookies / Funksional Cookie-lər */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <label className="font-medium text-gray-900">
                    {t('functionalCookies') || 'Functional Cookies'}
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('functionalCookiesDesc') || 'Remember your preferences and settings'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1"
              >
                {t('cancel') || 'Cancel'}
              </Button>
              <Button
                onClick={handleSavePreferences}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {t('savePreferences') || 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

