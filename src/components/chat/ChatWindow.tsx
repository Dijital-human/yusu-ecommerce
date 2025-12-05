/**
 * Chat Window Component / Chat Pəncərə Komponenti
 * Main chat interface / Əsas chat interfeysi
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatRoomList } from './ChatRoomList';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface ChatWindowProps {
  productId?: string;
  orderId?: string;
  onClose?: () => void;
}

export function ChatWindow({ productId, orderId, onClose }: ChatWindowProps) {
  const {
    rooms,
    currentRoom,
    loading,
    error,
    messages,
    messagesLoading,
    createRoom,
    selectRoom,
    sendMessage,
    markAsRead,
    closeRoom,
    rateRoom,
    sendTyping,
    isConnected,
  } = useChat({
    autoConnect: true,
  });

  const [showRoomList, setShowRoomList] = useState(!currentRoom);
  const t = useTranslations('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-create room if productId or orderId provided / productId və ya orderId verilərsə avtomatik otaq yarat
  useEffect(() => {
    if ((productId || orderId) && !currentRoom && !loading && rooms.length === 0) {
      createRoom(productId, orderId);
    }
  }, [productId, orderId, currentRoom, loading, rooms.length, createRoom]);

  // Auto-select first room if no room selected / Otaq seçilməyibsə ilk otağı avtomatik seç
  useEffect(() => {
    if (!currentRoom && rooms.length > 0 && !showRoomList) {
      selectRoom(rooms[0].id);
      setShowRoomList(false);
    }
  }, [currentRoom, rooms, showRoomList, selectRoom]);

  // Scroll to bottom when new message / Yeni mesaj olduqda aşağı scroll et
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when room changes / Otaq dəyişdikdə mesajları oxunmuş kimi işarələ
  useEffect(() => {
    if (currentRoom) {
      markAsRead();
    }
  }, [currentRoom, markAsRead]);

  const handleRoomSelect = async (roomId: string) => {
    await selectRoom(roomId);
    setShowRoomList(false);
  };

  const handleNewChat = () => {
    setShowRoomList(true);
    createRoom(productId, orderId);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Room List / Otaq Siyahısı */}
      {showRoomList ? (
        <ChatRoomList
          rooms={rooms}
          onSelectRoom={handleRoomSelect}
          onCreateRoom={handleNewChat}
          currentRoomId={currentRoom?.id}
        />
      ) : (
        <>
          {/* Messages / Mesajlar */}
          <div className="flex-1 overflow-y-auto">
            {messagesLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <ChatMessageList
                  messages={messages}
                  currentRoom={currentRoom}
                  onBack={() => setShowRoomList(true)}
                />
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input / Input */}
          <ChatInput
            onSend={sendMessage}
            onTyping={sendTyping}
            disabled={!currentRoom || !isConnected}
          />
        </>
      )}
    </div>
  );
}

