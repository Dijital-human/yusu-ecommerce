/**
 * Chat Widget Component / Chat Widget Komponenti
 * Floating chat widget for customer support / Müştəri dəstəyi üçün üzən chat widget
 */

'use client';

import { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChatWindow } from './ChatWindow';
import { useTranslations } from 'next-intl';

interface ChatWidgetProps {
  productId?: string;
  orderId?: string;
}

export function ChatWidget({ productId, orderId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const t = useTranslations('chat');

  const handleToggle = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button / Üzən Düymə */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110"
          aria-label={t('openChat')}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window / Chat Pəncərəsi */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 transition-all ${
            isMinimized
              ? 'h-16 w-80'
              : 'h-[600px] w-96'
          }`}
        >
          <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-2xl">
            {/* Header / Başlıq */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-white" />
                <h3 className="font-semibold text-white">
                  {t('customerSupport')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="rounded p-1 text-white transition-colors hover:bg-blue-700"
                  aria-label={isMinimized ? t('maximize') : t('minimize')}
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="rounded p-1 text-white transition-colors hover:bg-blue-700"
                  aria-label={t('close')}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Content / Chat Məzmunu */}
            {!isMinimized && (
              <div className="flex-1 overflow-hidden">
                <ChatWindow
                  productId={productId}
                  orderId={orderId}
                  onClose={handleClose}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

