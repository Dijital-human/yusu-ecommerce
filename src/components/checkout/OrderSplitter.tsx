/**
 * Order Splitter Component / Sifariş Bölgü Komponenti
 * UI for splitting orders with preview and confirmation / Önizləmə və təsdiq ilə sifarişləri bölmək üçün UI
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
// Checkbox wrapper / Checkbox wrapper
const Checkbox = ({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  />
);
import { Input } from '@/components/ui/Input';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Store, 
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { splitOrder, previewOrderSplits, SplitOptions, OrderItem, OrderSplit } from '@/lib/orders/splitting';

interface OrderSplitterProps {
  items: OrderItem[];
  defaultAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  onConfirm: (splits: OrderSplit[]) => void;
  onCancel: () => void;
}

export function OrderSplitter({ items, defaultAddress, onConfirm, onCancel }: OrderSplitterProps) {
  const t = useTranslations('checkout');
  const [options, setOptions] = useState<SplitOptions>({
    splitBySeller: true,
    splitByAddress: false,
    splitByDeliveryDate: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    splits: OrderSplit[];
    totalOrders: number;
    totalAmount: number;
    summary: {
      bySeller: Record<string, number>;
      byAddress: Record<string, number>;
      byDate: Record<string, number>;
    };
  } | null>(null);

  const handlePreview = () => {
    const preview = previewOrderSplits(items, options);
    setPreviewData(preview);
    setShowPreview(true);
  };

  const handleConfirm = () => {
    if (!previewData) {
      handlePreview();
      return;
    }
    onConfirm(previewData.splits);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('splitOrder') || 'Split Order'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Split Options / Bölgü Seçimləri */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={options.splitBySeller || false}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, splitBySeller: checked })
                }
              />
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                <span>{t('splitBySeller') || 'Split by Seller'}</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={options.splitByAddress || false}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, splitByAddress: checked })
                }
              />
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{t('splitByAddress') || 'Split by Shipping Address'}</span>
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={options.splitByDeliveryDate || false}
                onCheckedChange={(checked) => 
                  setOptions({ ...options, splitByDeliveryDate: checked })
                }
              />
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{t('splitByDeliveryDate') || 'Split by Delivery Date'}</span>
              </div>
            </label>
          </div>

          {/* Preview Button / Önizləmə Düyməsi */}
          <Button onClick={handlePreview} variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            {t('previewSplit') || 'Preview Split'}
          </Button>
        </CardContent>
      </Card>

      {/* Preview / Önizləmə */}
      {showPreview && previewData && (
        <Card>
          <CardHeader>
            <CardTitle>{t('splitPreview') || 'Split Preview'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  {t('orderWillBeSplit') || 'Your order will be split into'} {previewData.totalOrders} {t('orders') || 'orders'}
                </span>
              </div>
              <p className="text-sm text-blue-700">
                {t('totalAmount') || 'Total Amount'}: ${previewData.totalAmount.toFixed(2)}
              </p>
            </div>

            {/* Split Summary / Bölgü Xülasəsi */}
            {Object.keys(previewData.summary.bySeller).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  {t('bySeller') || 'By Seller'}
                </h4>
                <div className="space-y-1">
                  {Object.entries(previewData.summary.bySeller).map(([sellerId, amount]) => (
                    <div key={sellerId} className="flex justify-between text-sm">
                      <span>{sellerId}</span>
                      <span className="font-medium">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Details / Bölgü Detalları */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t('splitDetails') || 'Split Details'}</h4>
              {previewData.splits.map((split, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{t('order') || 'Order'} {index + 1}</Badge>
                      <span className="font-bold">${split.total.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {split.sellerId && (
                        <div className="flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          <span>{split.sellerId}</span>
                        </div>
                      )}
                      {split.shippingAddress && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {split.shippingAddress.city}, {split.shippingAddress.state}
                          </span>
                        </div>
                      )}
                      {split.deliveryDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(split.deliveryDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <span className="font-medium">{split.items.length}</span> {t('items') || 'items'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons / Əməliyyat Düymələri */}
            <div className="flex items-center gap-2 pt-4">
              <Button onClick={handleConfirm} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('confirmSplit') || 'Confirm Split'}
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                {t('cancel') || 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Preview / Önizləmə Yoxdur */}
      {!showPreview && (
        <div className="flex items-center gap-2 pt-4">
          <Button onClick={handlePreview} variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-2" />
            {t('previewSplit') || 'Preview Split'}
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            {t('cancel') || 'Cancel'}
          </Button>
        </div>
      )}
    </div>
  );
}

