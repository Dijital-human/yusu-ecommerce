/**
 * Address List Component / Ünvan Siyahısı Komponenti
 * Display list of user addresses / İstifadəçi ünvanlarının siyahısını göstər
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Edit, Trash2, Star, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AddressForm } from './AddressForm';

export interface Address {
  id: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

interface AddressListProps {
  addresses: Address[];
  onUpdate: () => void;
}

export function AddressList({ addresses, onUpdate }: AddressListProps) {
  const t = useTranslations('addresses');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDelete = async (addressId: string) => {
    if (!confirm(t('confirmDelete') || 'Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || t('deleteError') || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(t('deleteError') || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const response = await fetch(`/api/addresses/${addressId}/default`, {
        method: 'PUT',
      });

      if (response.ok) {
        onUpdate();
      } else {
        const data = await response.json();
        alert(data.error || t('setDefaultError') || 'Failed to set default address');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert(t('setDefaultError') || 'Failed to set default address');
    }
  };

  if (addresses.length === 0 && !showAddForm) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{t('noAddresses') || 'No addresses saved'}</p>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addAddress') || 'Add Address'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('myAddresses') || 'My Addresses'}</h2>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addAddress') || 'Add Address'}
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="p-6">
            <AddressForm
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
        {addresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? 'border-2 border-blue-500' : ''}>
            <CardContent className="p-6">
              {editingId === address.id ? (
                <AddressForm
                  address={address}
                  onSuccess={() => {
                    setEditingId(null);
                    onUpdate();
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {address.label && (
                        <h3 className="font-semibold text-lg mb-1">{address.label}</h3>
                      )}
                      {address.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800 mb-2">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {t('default') || 'Default'}
                        </Badge>
                      )}
                      <div className="text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p>{address.country}</p>
                        {address.phoneNumber && (
                          <p className="mt-2">{address.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        {t('setDefault') || 'Set Default'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(address.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t('edit') || 'Edit'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
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
