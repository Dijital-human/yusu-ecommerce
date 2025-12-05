/**
 * Payment Method Form Component / Ödəniş Metodu Formu Komponenti
 * Form for adding/editing payment methods / Ödəniş metodu əlavə etmək/yeniləmək üçün forma
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';
import { PaymentMethod } from './SavedPaymentMethods';
import { loadStripe } from '@stripe/stripe-js';

// Label component wrapper / Label komponent wrapper
const FormLabel = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className || ''}`}>
    {children}
  </label>
);

interface PaymentMethodFormProps {
  paymentMethod?: PaymentMethod;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentMethodForm({ paymentMethod, onSuccess, onCancel }: PaymentMethodFormProps) {
  const t = useTranslations('payments');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useStripe, setUseStripe] = useState(true);

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Initialize Stripe Elements / Stripe Elements-i başlat
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
      if (!stripe) {
        throw new Error('Stripe is not configured / Stripe konfiqurasiya edilməyib');
      }

      // Create payment method using Stripe Elements
      // Stripe Elements istifadə edərək ödəniş metodu yarat
      // TODO: Integrate with Stripe Elements for card input / Kart girişi üçün Stripe Elements ilə inteqrasiya et
      // For now, this is a placeholder / İndilik bu placeholder-dır
      
      alert(t('stripeIntegrationPending') || 'Stripe integration is pending. Please use the Stripe checkout flow.');
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError') || 'Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const formObject: any = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      const url = paymentMethod ? `/api/payments/methods/${paymentMethod.id}` : '/api/payments/methods';
      const method = paymentMethod ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'card',
          last4: formObject.last4,
          brand: formObject.brand,
          expiryMonth: parseInt(formObject.expiryMonth),
          expiryYear: parseInt(formObject.expiryYear),
          isDefault: formObject.isDefault === 'on',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('saveError') || 'Failed to save payment method');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError') || 'Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={useStripe ? handleStripeSubmit : handleManualSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="inputMethod"
            checked={useStripe}
            onChange={() => setUseStripe(true)}
            className="mr-2"
          />
          {t('useStripe') || 'Use Stripe (Secure)'}
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="inputMethod"
            checked={!useStripe}
            onChange={() => setUseStripe(false)}
            className="mr-2"
          />
          {t('manualEntry') || 'Manual Entry'}
        </label>
      </div>

      {useStripe ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            {t('stripeIntegrationPending') || 'Stripe integration is pending. Please use the checkout flow to add payment methods.'}
          </p>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel') || 'Cancel'}
          </Button>
        </div>
      ) : (
        <>
          <div>
            <FormLabel htmlFor="last4">{t('last4') || 'Last 4 Digits'} *</FormLabel>
            <Input
              id="last4"
              name="last4"
              maxLength={4}
              defaultValue={paymentMethod?.last4 || ''}
              required
              placeholder="1234"
            />
          </div>

          <div>
            <FormLabel htmlFor="brand">{t('brand') || 'Card Brand'} *</FormLabel>
            <select
              id="brand"
              name="brand"
              defaultValue={paymentMethod?.brand || ''}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">{t('selectBrand') || 'Select Brand'}</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="discover">Discover</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="expiryMonth">{t('expiryMonth') || 'Expiry Month'} *</FormLabel>
              <Input
                id="expiryMonth"
                name="expiryMonth"
                type="number"
                min="1"
                max="12"
                defaultValue={paymentMethod?.expiryMonth || ''}
                required
                placeholder="MM"
              />
            </div>
            <div>
              <FormLabel htmlFor="expiryYear">{t('expiryYear') || 'Expiry Year'} *</FormLabel>
              <Input
                id="expiryYear"
                name="expiryYear"
                type="number"
                min={new Date().getFullYear()}
                defaultValue={paymentMethod?.expiryYear || ''}
                required
                placeholder="YYYY"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              defaultChecked={paymentMethod?.isDefault || false}
              className="mr-2"
            />
            <FormLabel htmlFor="isDefault" className="cursor-pointer">
              {t('setAsDefault') || 'Set as default payment method'}
            </FormLabel>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t('saving') || 'Saving...'
                : paymentMethod
                  ? t('update') || 'Update Payment Method'
                  : t('save') || 'Save Payment Method'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              {t('cancel') || 'Cancel'}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

