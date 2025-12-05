/**
 * Live Chat Widget Component / Canlı Chat Widget Komponenti
 * Floating chat widget for customer support / Müştəri dəstəyi üçün floating chat widget
 */

'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { ChatWindow } from './ChatWindow';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface LiveChatProps {
  productId?: string;
  orderId?: string;
  position?: 'bottom-right' | 'bottom-left';
  initialOpen?: boolean;
}

export function LiveChat({ 
  productId, 
  orderId, 
  position = 'bottom-right',
  initialOpen = false 
}: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations('chat');

  // Auto-open for authenticated users with unread messages
  // Oxunmamış mesajları olan autentifikasiya edilmiş istifadəçilər üçün avtomatik aç
  useEffect(() => {
    if (session?.user && !isOpen) {
      // Check for unread messages (can be enhanced with API call)
      // Oxunmamış mesajları yoxla (API çağırışı ilə təkmilləşdirilə bilər)
    }
  }, [session, isOpen]);

  const toggleChat = () => {
    if (isOpen && !isMinimized) {
      setIsMinimized(true);
    } else if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  if (!isOpen) {
    return (
      <div className={`fixed ${positionClasses} z-50`}>
        <button
          onClick={toggleChat}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          aria-label={t('openChat') || 'Open chat'}
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses} z-50 ${isMinimized ? 'w-80' : 'w-96'} transition-all duration-300`}>
      <div className={`bg-white rounded-t-2xl shadow-2xl border border-gray-200 flex flex-col ${isMinimized ? 'h-16' : 'h-[600px]'} transition-all duration-300`}>
        {/* Header / Başlıq */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {t('customerSupport') || 'Customer Support'}
              </h3>
              <p className="text-xs text-blue-100">
                {session?.user ? t('online') || 'Online' : t('signInToChat') || 'Sign in to chat'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleChat}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              aria-label={isMinimized ? t('maximize') || 'Maximize' : t('minimize') || 'Minimize'}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={closeChat}
              className="p-1.5 hover:bg-white/20 rounded transition-colors"
              aria-label={t('closeChat') || 'Close chat'}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Window / Chat Pəncərəsi */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            {session?.user ? (
              <ChatWindow 
                productId={productId} 
                orderId={orderId}
                onClose={closeChat}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('signInRequired') || 'Sign In Required'}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {t('signInToChatDesc') || 'Please sign in to start chatting with our support team'}
                </p>
                <Button
                  onClick={() => window.location.href = '/auth/signin'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {t('signIn') || 'Sign In'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

