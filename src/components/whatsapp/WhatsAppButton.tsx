/**
 * WhatsApp Button Component / WhatsApp Düyməsi Komponenti
 * Floating WhatsApp button for customer support / Müştəri dəstəyi üçün floating WhatsApp düyməsi
 */

'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  message?: string;
  position?: 'bottom-right' | 'bottom-left';
  showLabel?: boolean;
}

export function WhatsAppButton({
  phoneNumber,
  message = 'Hello, I need help',
  position = 'bottom-right',
  showLabel = false,
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations('whatsapp');
  
  const defaultPhoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || phoneNumber || '';
  
  const handleClick = () => {
    if (!defaultPhoneNumber) {
      console.error('WhatsApp phone number not configured / WhatsApp telefon nömrəsi konfiqurasiya edilməyib');
      return;
    }

    // Format phone number (remove + and spaces) / Telefon nömrəsini formatla (+ və boşluqları sil)
    const formattedPhone = defaultPhoneNumber.replace(/[+\s]/g, '');
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-4 right-4' 
    : 'bottom-4 left-4';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 flex items-center gap-3 group"
        aria-label={t('openWhatsApp') || 'Open WhatsApp'}
      >
        <MessageCircle className="h-6 w-6" />
        {showLabel && (
          <span className={`text-sm font-semibold transition-all duration-300 ${
            isHovered ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 overflow-hidden'
          }`}>
            {t('chatOnWhatsApp') || 'Chat on WhatsApp'}
          </span>
        )}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></span>
      </button>
    </div>
  );
}

