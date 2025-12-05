/**
 * Cookie Preferences Component / Cookie Tərcihləri Komponenti
 * Enhanced cookie preferences management / Təkmilləşdirilmiş cookie tərcihləri idarəetməsi
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Cookie, Shield, CheckCircle, XCircle, Settings } from 'lucide-react';
import {
  getCookiePreferences,
  saveCookiePreferences,
  withdrawCookieConsent,
  deleteNonEssentialCookies,
  CookiePreferences,
} from '@/lib/cookies/cookie-manager';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const COOKIE_CATEGORIES = [
  {
    id: 'essential' as keyof CookiePreferences,
    name: 'Essential Cookies',
    description: 'Required for website functionality. Cannot be disabled.',
    required: true,
    icon: Shield,
  },
  {
    id: 'analytics' as keyof CookiePreferences,
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors use our website.',
    required: false,
    icon: Cookie,
  },
  {
    id: 'marketing' as keyof CookiePreferences,
    name: 'Marketing Cookies',
    description: 'Used to deliver personalized advertisements.',
    required: false,
    icon: Cookie,
  },
  {
    id: 'functional' as keyof CookiePreferences,
    name: 'Functional Cookies',
    description: 'Remember your preferences and settings.',
    required: false,
    icon: Settings,
  },
];

export function CookiePreferencesComponent() {
  const t = useTranslations('cookies');
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load saved preferences / Saxlanılmış tərcihləri yüklə
    const saved = getCookiePreferences();
    if (saved) {
      setPreferences(saved);
    }
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Essential cookies cannot be disabled / Zəruri cookie-lər deaktiv edilə bilməz
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      saveCookiePreferences(preferences);
      toast.success(t('preferencesSaved') || 'Preferences saved successfully');
    } catch (error) {
      toast.error(t('errorSaving') || 'Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setPreferences(allAccepted);
    saveCookiePreferences(allAccepted);
    toast.success(t('allCookiesAccepted') || 'All cookies accepted');
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setPreferences(onlyEssential);
    saveCookiePreferences(onlyEssential);
    deleteNonEssentialCookies();
    toast.success(t('nonEssentialRejected') || 'Non-essential cookies rejected');
  };

  const handleWithdrawConsent = () => {
    if (confirm(t('confirmWithdraw') || 'Are you sure you want to withdraw your consent?')) {
      withdrawCookieConsent();
      setPreferences({
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      });
      toast.success(t('consentWithdrawn') || 'Consent withdrawn');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-orange-600" />
            <CardTitle>{t('managePreferences') || 'Manage Cookie Preferences'}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {COOKIE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isEnabled = preferences[category.id];

            return (
              <div
                key={category.id}
                className={`flex items-start justify-between p-4 border rounded-lg ${
                  category.required ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-gray-600" />
                    <Label className="font-medium text-gray-900">
                      {category.name}
                    </Label>
                    {category.required && (
                      <span className="text-xs text-gray-500">({t('required') || 'Required'})</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {category.required ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handlePreferenceChange(category.id, checked)}
                    />
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button onClick={handleAcceptAll} variant="outline" className="flex-1 min-w-[120px]">
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('acceptAll') || 'Accept All'}
            </Button>
            <Button onClick={handleRejectAll} variant="outline" className="flex-1 min-w-[120px]">
              <XCircle className="h-4 w-4 mr-2" />
              {t('rejectNonEssential') || 'Reject Non-Essential'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700"
            >
              {saving ? t('saving') || 'Saving...' : t('savePreferences') || 'Save Preferences'}
            </Button>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleWithdrawConsent}
              variant="outline"
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              {t('withdrawConsent') || 'Withdraw Consent'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

