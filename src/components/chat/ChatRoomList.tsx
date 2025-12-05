/**
 * Chat Room List Component / Chat Otaq Siyahısı Komponenti
 * Displays list of chat rooms / Chat otaqlarının siyahısını göstərir
 */

'use client';

import { format } from 'date-fns';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface ChatRoom {
  id: string;
  status: string;
  lastMessageAt?: string;
  createdAt: string;
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
  product?: {
    id: string;
    name: string;
  };
  order?: {
    id: string;
    status: string;
  };
  messages?: Array<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      id: string;
      name?: string;
    };
  }>;
}

interface ChatRoomListProps {
  rooms: ChatRoom[];
  onSelectRoom: (roomId: string) => void;
  onCreateRoom: () => void;
  currentRoomId?: string;
}

export function ChatRoomList({
  rooms,
  onSelectRoom,
  onCreateRoom,
  currentRoomId,
}: ChatRoomListProps) {
  const t = useTranslations('chat');

  return (
    <div className="flex h-full flex-col">
      {/* Header / Başlıq */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{t('chatRooms')}</h3>
          <Button
            onClick={onCreateRoom}
            size="sm"
            variant="outline"
            className="h-8"
          >
            <Plus className="mr-1 h-4 w-4" />
            {t('newChat')}
          </Button>
        </div>
      </div>

      {/* Room List / Otaq Siyahısı */}
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <MessageCircle className="mb-2 h-12 w-12 text-gray-400" />
            <p className="text-sm font-medium text-gray-900">{t('noChatRooms')}</p>
            <p className="mt-1 text-xs text-gray-500">{t('startNewConversation')}</p>
            <Button
              onClick={onCreateRoom}
              size="sm"
              className="mt-4"
            >
              {t('startChat')}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {rooms.map((room) => {
              const lastMessage = room.messages?.[0];
              const isActive = room.id === currentRoomId;
              const displayName =
                room.supportStaff?.name ||
                room.customer?.name ||
                t('supportStaff');

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {displayName}
                        </p>
                        {room.lastMessageAt && (
                          <p className="ml-2 text-xs text-gray-500">
                            {format(
                              new Date(room.lastMessageAt),
                              'MMM d, HH:mm'
                            )}
                          </p>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                          {lastMessage.content}
                        </p>
                      )}
                      {room.product && (
                        <p className="mt-1 text-xs text-blue-600">
                          {t('relatedProduct')}: {room.product.name}
                        </p>
                      )}
                      {room.order && (
                        <p className="mt-1 text-xs text-blue-600">
                          {t('relatedOrder')}: #{room.order.id}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            room.status === 'OPEN'
                              ? 'bg-green-100 text-green-800'
                              : room.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {t(`status.${room.status.toLowerCase()}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

