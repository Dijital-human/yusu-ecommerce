/**
 * Chat Message List Component / Chat Mesaj Siyahısı Komponenti
 * Displays chat messages / Chat mesajlarını göstərir
 */

'use client';

import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'CUSTOMER' | 'SUPPORT';
  content: string;
  createdAt: string;
  isRead: boolean;
  sender?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  attachments?: Array<{
    id: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
  }>;
}

interface ChatRoom {
  id: string;
  customer?: {
    id: string;
    name?: string;
    email: string;
  };
  supportStaff?: {
    id: string;
    name?: string;
    email: string;
  };
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  currentRoom: ChatRoom | null;
  onBack?: () => void;
}

export function ChatMessageList({ messages, currentRoom, onBack }: ChatMessageListProps) {
  const t = useTranslations('chat');

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4 text-center">
        <p className="text-sm text-gray-500">{t('noMessages')}</p>
        <p className="mt-2 text-xs text-gray-400">{t('startConversation')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header / Başlıq */}
      {onBack && (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {currentRoom?.supportStaff?.name ||
                currentRoom?.customer?.name ||
                t('supportStaff')}
            </p>
            <p className="text-xs text-gray-500">
              {currentRoom?.supportStaff?.email || currentRoom?.customer?.email}
            </p>
          </div>
        </div>
      )}

      {/* Messages / Mesajlar */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => {
          const isCustomer = message.senderType === 'CUSTOMER';
          const senderName =
            message.sender?.name || message.sender?.email || t('you');

          return (
            <div
              key={message.id}
              className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  isCustomer
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Sender Info / Göndərən Məlumatı */}
                {!isCustomer && (
                  <p className="mb-1 text-xs font-medium opacity-75">
                    {senderName}
                  </p>
                )}

                {/* Message Content / Mesaj Məzmunu */}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Attachments / Əlavələr */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded border border-gray-300 bg-white p-2 text-xs text-blue-600 hover:underline"
                      >
                        📎 {attachment.fileName}
                      </a>
                    ))}
                  </div>
                )}

                {/* Timestamp / Zaman Damgası */}
                <p
                  className={`mt-1 text-xs ${
                    isCustomer ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {format(new Date(message.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

