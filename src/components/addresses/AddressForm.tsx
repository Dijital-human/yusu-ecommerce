/**
 * Address Form Component / Ünvan Formu Komponenti
 * Form for creating/editing addresses / Ünvan yaratmaq/yeniləmək üçün forma
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// Label component wrapper for proper typing / Düzgün typing üçün Label komponent wrapper
const FormLabel = ({ htmlFor, children, className }: { htmlFor: string; children: React.ReactNode; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className || ''}`}>
    {children}
  </label>
);
import { useTranslations } from 'next-intl';
import { Address } from './AddressList';

interface AddressFormProps {
  address?: Address;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const t = useTranslations('addresses');
  const [formData, setFormData] = useState({
    label: address?.label || '',
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
    country: address?.country || '',
    phoneNumber: address?.phoneNumber || '',
    isDefault: address?.isDefault || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const url = address ? `/api/addresses/${address.id}` : '/api/addresses';
      const method = address ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('saveError') || 'Failed to save address');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError') || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <FormLabel htmlFor="label">{t('label') || 'Label (Optional)'}</FormLabel>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder={t('labelPlaceholder') || 'e.g., Home, Work, Office'}
        />
      </div>

      <div>
        <FormLabel htmlFor="street">{t('street') || 'Street Address'} *</FormLabel>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="city">{t('city') || 'City'} *</FormLabel>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            required
          />
        </div>
        <div>
          <FormLabel htmlFor="state">{t('state') || 'State/Province'} *</FormLabel>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="zipCode">{t('zipCode') || 'ZIP/Postal Code'} *</FormLabel>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            required
          />
        </div>
        <div>
          <FormLabel htmlFor="country">{t('country') || 'Country'} *</FormLabel>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <FormLabel htmlFor="phoneNumber">{t('phoneNumber') || 'Phone Number (Optional)'}</FormLabel>
        <Input
          id="phoneNumber"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
          placeholder={t('phoneNumberPlaceholder') || '+1 (555) 123-4567'}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isDefault"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="mr-2"
        />
        <FormLabel htmlFor="isDefault" className="cursor-pointer">
          {t('setAsDefault') || 'Set as default address'}
        </FormLabel>
      </div>

      <div className="flex items-center gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? t('saving') || 'Saving...'
            : address
              ? t('update') || 'Update Address'
              : t('save') || 'Save Address'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('cancel') || 'Cancel'}
        </Button>
      </div>
    </form>
  );
}
