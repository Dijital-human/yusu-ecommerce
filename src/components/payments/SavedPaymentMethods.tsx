/**
 * Saved Payment Methods Component / Saxlanılmış Ödəniş Metodları Komponenti
 * Display list of saved payment methods / Saxlanılmış ödəniş metodlarının siyahısını göstər
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Edit, Trash2, Star, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaymentMethodForm } from './PaymentMethodForm';

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

interface SavedPaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  onUpdate: () => void;
}

export function SavedPaymentMethods({ paymentMethods, onUpdate }: SavedPaymentMethodsProps) {
  const t = useTranslations('payments');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || t('deleteError') || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      alert(t('deleteError') || 'Failed to delete payment method');
    }
  };

  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}/default`, {
        method: 'PUT',
      });

      if (response.ok) {
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || t('setDefaultError') || 'Failed to set default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      alert(t('setDefaultError') || 'Failed to set default payment method');
    }
  };

  const getCardBrandIcon = (brand?: string) => {
    const icons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
    };
    return icons[brand?.toLowerCase() || ''] || '💳';
  };

  const formatExpiry = (month?: number, year?: number) => {
    if (!month || !year) return '';
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
  };

  if (paymentMethods.length === 0 && !showAddForm) {
    return (
      <div className="text-center py-12">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{t('noPaymentMethods') || 'No payment methods saved'}</p>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addPaymentMethod') || 'Add Payment Method'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('myPaymentMethods') || 'My Payment Methods'}</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addPaymentMethod') || 'Add Payment Method'}
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <PaymentMethodForm
              onSuccess={() => {
                setShowAddForm(false);
                onUpdate();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className={method.isDefault ? 'border-2 border-blue-500' : ''}>
            <CardContent className="p-6">
              {editingId === method.id ? (
                <PaymentMethodForm
                  paymentMethod={method}
                  onSuccess={() => {
                    setEditingId(null);
                    onUpdate();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{getCardBrandIcon(method.brand)}</div>
                      <div className="flex-1">
                        {method.isDefault && (
                          <Badge className="bg-blue-100 text-blue-800 mb-2">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            {t('default') || 'Default'}
                          </Badge>
                        )}
                        <div className="text-gray-900 font-semibold">
                          {method.brand ? method.brand.toUpperCase() : method.type.toUpperCase()}
                          {method.last4 && ` •••• ${method.last4}`}
                        </div>
                        {method.expiryMonth && method.expiryYear && (
                          <div className="text-sm text-gray-600">
                            {t('expires') || 'Expires'} {formatExpiry(method.expiryMonth, method.expiryYear)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        {t('setDefault') || 'Set Default'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(method.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('edit') || 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('delete') || 'Delete'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

