/**
 * Email Subscriptions Component / Email Abunəlikləri Komponenti
 * Manage email subscription preferences / Email abunəlik parametrlərini idarə et
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface EmailSubscription {
  id: string;
  subscriptionType: string;
  isActive: boolean;
  preferences?: any;
  frequency?: string;
}

const SUBSCRIPTION_TYPES = [
  { value: 'newsletter', label: 'Newsletter / Xəbərlər' },
  { value: 'promotions', label: 'Promotions / Təşviqlər' },
  { value: 'order_updates', label: 'Order Updates / Sifariş Yeniləmələri' },
  { value: 'product_recommendations', label: 'Product Recommendations / Məhsul Tövsiyələri' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily / Günlük' },
  { value: 'weekly', label: 'Weekly / Həftəlik' },
  { value: 'monthly', label: 'Monthly / Aylıq' },
];

export function EmailSubscriptions() {
  const t = useTranslations('emailSubscriptions');
  const [subscriptions, setSubscriptions] = useState<EmailSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email/subscriptions');
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching subscriptions', error);
      toast.error(t('errorFetching') || 'Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const getSubscription = (type: string): EmailSubscription | undefined => {
    return subscriptions.find((s) => s.subscriptionType === type);
  };

  const handleToggle = async (type: string, isActive: boolean) => {
    const existing = getSubscription(type);
    setSaving((prev) => ({ ...prev, [type]: true }));

    try {
      if (existing) {
        // Update existing / Mövcud abunəliyi yenilə
        const response = await fetch(`/api/email/subscriptions/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive }),
        });

        const data = await response.json();
        if (data.success) {
          setSubscriptions((prev) =>
            prev.map((s) => (s.id === existing.id ? { ...s, isActive } : s))
          );
          toast.success(t('subscriptionUpdated') || 'Subscription updated');
        } else {
          throw new Error(data.error);
        }
      } else {
        // Create new / Yeni abunəlik yarat
        const response = await fetch('/api/email/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscriptionType: type,
            isActive,
            frequency: 'weekly',
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSubscriptions((prev) => [...prev, data.data]);
          toast.success(t('subscribed') || 'Subscribed successfully');
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error: any) {
      toast.error(error.message || t('errorUpdating') || 'Error updating subscription');
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleFrequencyChange = async (type: string, frequency: string) => {
    const existing = getSubscription(type);
    if (!existing) return;

    setSaving((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await fetch(`/api/email/subscriptions/${existing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frequency }),
      });

      const data = await response.json();
      if (data.success) {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === existing.id ? { ...s, frequency } : s))
        );
        toast.success(t('frequencyUpdated') || 'Frequency updated');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || t('errorUpdating') || 'Error updating frequency');
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <CardTitle>{t('title') || 'Email Subscriptions'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {SUBSCRIPTION_TYPES.map((type) => {
          const subscription = getSubscription(type.value);
          const isActive = subscription?.isActive || false;
          const frequency = subscription?.frequency || 'weekly';
          const isSaving = saving[type.value] || false;

          return (
            <div key={type.value} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => handleToggle(type.value, checked)}
                    disabled={isSaving}
                  />
                  <Label className="text-base font-medium cursor-pointer">
                    {type.label}
                  </Label>
                </div>
                {isActive && (
                  <div className="ml-11 mt-2">
                    <Label className="text-sm text-gray-600 mb-1 block">
                      {t('frequency') || 'Frequency'}:
                    </Label>
                    <Select
                      value={frequency}
                      onValueChange={(value) => handleFrequencyChange(type.value, value)}
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {isActive && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

