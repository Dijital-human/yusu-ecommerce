/**
 * Seller Chat Window Component / Satıcı Chat Pəncərəsi Komponenti
 * Chat window for seller messaging / Satıcı mesajlaşması üçün chat pəncərəsi
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Send, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface SellerChatWindowProps {
  sellerId: string;
  sellerName?: string;
  productId?: string;
  productName?: string;
  onClose?: () => void;
}

export function SellerChatWindow({
  sellerId,
  sellerName,
  productId,
  productName,
  onClose,
}: SellerChatWindowProps) {
  const t = useTranslations('sellerChat');
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [sellerId, productId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    setIsLoading(true);
    try {
      // Create or get chat room / Chat otağını yarat və ya al
      const response = await fetch('/api/seller-chat/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId,
          productId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create chat room');
      }

      setRoom(data.data);

      // Load messages / Mesajları yüklə
      await loadMessages(data.data.id);
    } catch (error: any) {
      toast.error(error.message || t('errorInitializingChat') || 'Error initializing chat');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/seller-chat/rooms/${roomId}/messages`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !room || isSending) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`/api/seller-chat/rooms/${room.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add message to list / Mesajı siyahıya əlavə et
      setMessages([...messages, data.data]);
      setMessage('');

      // Update room / Otağı yenilə
      const roomResponse = await fetch(`/api/seller-chat/rooms/${room.id}`);
      const roomData = await roomResponse.json();
      if (roomData.success) {
        setRoom(roomData.data);
      }
    } catch (error: any) {
      toast.error(error.message || t('errorSendingMessage') || 'Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {t('chatWith') || 'Chat with'} {sellerName || t('seller') || 'Seller'}
              </CardTitle>
              {productName && (
                <p className="text-sm text-gray-600 mt-1">{productName}</p>
              )}
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          {/* Messages / Mesajlar */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>{t('noMessages') || 'No messages yet. Start the conversation!'}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === room?.customerId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.senderId === room?.customerId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.senderId === room?.customerId
                        ? 'text-blue-100'
                        : 'text-gray-500'
                    }`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input / Mesaj Daxil Etmə */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('typeMessage') || 'Type a message...'}
                disabled={isSending}
                className="flex-1"
              />
              <Button type="submit" disabled={isSending || !message.trim()}>
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

