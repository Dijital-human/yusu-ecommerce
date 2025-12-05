/**
 * Address Selector Component / Ünvan Seçici Komponenti
 * Allows users to select from multiple shipping addresses
 * İstifadəçilərə birdən çox çatdırılma ünvanından seçim etməyə imkan verir
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Plus, CheckCircle } from "lucide-react";
import { AddressForm } from "@/components/addresses/AddressForm";
import { Skeleton } from "@/components/ui/Skeleton";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  label?: string;
  isDefault: boolean;
}

interface AddressSelectorProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
  onNewAddress?: () => void;
}

export function AddressSelector({
  selectedAddressId,
  onAddressSelect,
  onNewAddress,
}: AddressSelectorProps) {
  const { data: session } = useSession();
  const t = useTranslations("checkout");
  const tAddresses = useTranslations("addresses");
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/addresses");
      const data = await response.json();

      if (data.success) {
        setAddresses(data.data);
        // Auto-select default address if available / Mövcuddursa default ünvanı avtomatik seç
        const defaultAddress = data.data.find((addr: Address) => addr.isDefault);
        if (defaultAddress && !selectedAddressId) {
          onAddressSelect(defaultAddress);
        }
      } else {
        setError(data.error || "Failed to fetch addresses / Ünvanları almaq uğursuz oldu");
      }
    } catch (error) {
      setError("Failed to fetch addresses / Ünvanları almaq uğursuz oldu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSave = async () => {
    await fetchAddresses();
    setShowNewForm(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length > 0 ? (
        <RadioGroup
          value={selectedAddressId}
          onValueChange={(value) => {
            const address = addresses.find((addr) => addr.id === value);
            if (address) {
              onAddressSelect(address);
            }
          }}
        >
          <div className="space-y-3">
            {addresses.map((address) => (
              <label
                key={address.id}
                htmlFor={address.id}
                className="flex items-start space-x-3 cursor-pointer"
              >
                <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                <Card className={`flex-1 ${selectedAddressId === address.id ? 'border-blue-500 border-2' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {address.label && (
                            <Badge variant="outline">{address.label}</Badge>
                          )}
                          {address.isDefault && (
                            <Badge>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {tAddresses("default")}
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium text-gray-900">{address.street}</p>
                        <p className="text-gray-600 text-sm">
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                        <p className="text-gray-600 text-sm">{address.country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </label>
            ))}
          </div>
        </RadioGroup>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {t("noAddresses") || "No addresses found / Ünvan tapılmadı"}
            </p>
          </CardContent>
        </Card>
      )}

      {showNewForm ? (
        <Card>
          <CardContent className="p-6">
            <AddressForm
              onSave={handleAddressSave}
              onCancel={() => setShowNewForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowNewForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addNewAddress") || "Add New Address / Yeni Ünvan Əlavə Et"}
        </Button>
      )}
    </div>
  );
}

