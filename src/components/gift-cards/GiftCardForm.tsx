/**
 * Gift Card Form Component / Hədiyyə Kartı Formu Komponenti
 * Purchase gift card form / Hədiyyə kartı alma forması
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Gift, Loader2, Calendar, User, Mail, MessageSquare } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface GiftCardFormProps {
  onSuccess?: (giftCard: any) => void;
}

const PRESET_AMOUNTS = [10, 25, 50, 100];

export function GiftCardForm({ onSuccess }: GiftCardFormProps) {
  const t = useTranslations('giftCards');
  const tCommon = useTranslations('common');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledDeliveryDate, setScheduledDeliveryDate] = useState('');
  const [isGift, setIsGift] = useState(false);

  // Fetch templates on mount / Komponent yüklənəndə şablonları yüklə
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/gift-cards/templates');
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch templates / Şablonları yükləmək uğursuz oldu', error);
      }
    };
    fetchTemplates();
  }, []);

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmount = () => {
    setIsCustom(true);
    setAmount('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = isCustom ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount < 10) {
      toast.error(t('invalidAmount') || 'Invalid amount. Minimum $10');
      return;
    }

    // Validate gift recipient info if gift is selected / Hədiyyə seçilərsə alıcı məlumatlarını yoxla
    if (isGift) {
      if (!recipientName || !recipientEmail) {
        toast.error(t('recipientInfoRequired') || 'Recipient name and email are required');
        return;
      }
      // Basic email validation / Əsas email yoxlaması
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        toast.error(t('invalidEmail') || 'Invalid email address');
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gift-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          templateId: selectedTemplate || undefined,
          recipientName: isGift ? recipientName : undefined,
          recipientEmail: isGift ? recipientEmail : undefined,
          customMessage: isGift && customMessage ? customMessage : undefined,
          scheduledDeliveryDate: isGift && scheduledDeliveryDate ? scheduledDeliveryDate : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create gift card');
      }

      toast.success(t('giftCardCreated') || 'Gift card created successfully!');
      
      if (onSuccess) {
        onSuccess(data.data);
      }

      // Reset form / Formu sıfırla
      setAmount('');
      setCustomAmount('');
      setIsCustom(false);
      setSelectedTemplate('');
      setRecipientName('');
      setRecipientEmail('');
      setCustomMessage('');
      setScheduledDeliveryDate('');
      setIsGift(false);
    } catch (error: any) {
      toast.error(error.message || t('errorCreatingGiftCard') || 'Error creating gift card');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-blue-600" />
          <CardTitle>{t('purchaseGiftCard') || 'Purchase Gift Card'}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset Amounts / Hazır Məbləğlər */}
          <div>
            <Label className="mb-3 block">
              {t('selectAmount') || 'Select Amount'}
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_AMOUNTS.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  type="button"
                  variant={amount === presetAmount && !isCustom ? 'default' : 'outline'}
                  onClick={() => handlePresetAmount(presetAmount)}
                  className="h-auto py-3"
                >
                  {formatCurrency(presetAmount)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount / Xüsusi Məbləğ */}
          <div>
            <Button
              type="button"
              variant={isCustom ? 'default' : 'outline'}
              onClick={handleCustomAmount}
              className="w-full"
            >
              {t('customAmount') || 'Custom Amount'}
            </Button>
            {isCustom && (
              <div className="mt-3">
                <Label htmlFor="customAmount">
                  {t('enterAmount') || 'Enter Amount'} (Min: {formatCurrency(10)})
                </Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="10"
                  step="0.01"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder={t('enterAmount') || 'Enter amount'}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Selected Amount Display / Seçilmiş Məbləğ Göstəricisi */}
          {(amount || (isCustom && customAmount)) && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {t('totalAmount') || 'Total Amount'}:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(isCustom ? parseFloat(customAmount) || 0 : Number(amount))}
                </span>
              </div>
            </div>
          )}

          {/* Gift Card Templates / Hədiyyə Kartı Şablonları */}
          {templates.length > 0 && (
            <div>
              <Label className="mb-3 block">
                {t('selectTemplate') || 'Select Template (Optional)'}
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  type="button"
                  variant={selectedTemplate === '' ? 'default' : 'outline'}
                  onClick={() => setSelectedTemplate('')}
                  className="h-auto py-3"
                >
                  {t('noTemplate') || 'No Template'}
                </Button>
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    type="button"
                    variant={selectedTemplate === template.id ? 'default' : 'outline'}
                    onClick={() => setSelectedTemplate(template.id)}
                    className="h-auto py-3 flex flex-col items-center gap-1"
                  >
                    {template.imageUrl && (
                      <img
                        src={template.imageUrl}
                        alt={template.name}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span className="text-xs">{template.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Gift Option / Hədiyyə Seçimi */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isGift"
              checked={isGift}
              onChange={(e) => setIsGift(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <Label htmlFor="isGift" className="cursor-pointer">
              {t('sendAsGift') || 'Send as Gift'}
            </Label>
          </div>

          {/* Gift Recipient Information / Hədiyyə Alıcı Məlumatları */}
          {isGift && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <Label htmlFor="recipientName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('recipientName') || 'Recipient Name'} *
                </Label>
                <Input
                  id="recipientName"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder={t('enterRecipientName') || 'Enter recipient name'}
                  className="mt-1"
                  required={isGift}
                />
              </div>

              <div>
                <Label htmlFor="recipientEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t('recipientEmail') || 'Recipient Email'} *
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder={t('enterRecipientEmail') || 'Enter recipient email'}
                  className="mt-1"
                  required={isGift}
                />
              </div>

              <div>
                <Label htmlFor="customMessage" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {t('customMessage') || 'Custom Message (Optional)'}
                </Label>
                <Textarea
                  id="customMessage"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={t('enterCustomMessage') || 'Enter your message'}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="scheduledDeliveryDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {t('scheduledDeliveryDate') || 'Scheduled Delivery Date (Optional)'}
                </Label>
                <Input
                  id="scheduledDeliveryDate"
                  type="datetime-local"
                  value={scheduledDeliveryDate}
                  onChange={(e) => setScheduledDeliveryDate(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('scheduledDeliveryHint') || 'Leave empty to deliver immediately'}
                </p>
              </div>
            </div>
          )}

          {/* Submit Button / Göndər Butonu */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (!amount && !customAmount)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('processing') || 'Processing...'}
              </>
            ) : (
              <>
                <Gift className="h-4 w-4 mr-2" />
                {t('purchaseGiftCard') || 'Purchase Gift Card'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

