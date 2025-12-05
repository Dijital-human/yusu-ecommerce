/**
 * Seller Chat Button Component / Satıcı Chat Butonu Komponenti
 * Button to start chat with seller / Satıcı ilə chat başlatmaq üçün düymə
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SellerChatWindow } from './SellerChatWindow';

interface SellerChatButtonProps {
  sellerId: string;
  sellerName?: string;
  productId?: string;
  productName?: string;
}

export function SellerChatButton({ sellerId, sellerName, productId, productName }: SellerChatButtonProps) {
  const t = useTranslations('sellerChat');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        {t('chatWithSeller') || 'Chat with Seller'}
      </Button>

      {isOpen && (
        <SellerChatWindow
          sellerId={sellerId}
          sellerName={sellerName}
          productId={productId}
          productName={productName}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

