/**
 * useChat Hook / useChat Hook-u
 * Hook for managing chat functionality / Chat funksionallığını idarə etmək üçün hook
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiFetch } from './useApiFetch';
import { logger } from '@/lib/utils/logger';

// Chat Room Interface / Chat Otağı Interfeysi
interface ChatRoom {
  id: string;
  customerId: string;
  supportStaffId?: string;
  status: string;
  productId?: string;
  orderId?: string;
  rating?: number;
  ratingComment?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  supportStaff?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  product?: {
    id: string;
    name: string;
    images: string;
  };
  order?: {
    id: string;
    status: string;
    totalAmount: number;
  };
  messages?: ChatMessage[];
}

// Chat Message Interface / Chat Mesajı Interfeysi
interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderType: 'CUSTOMER' | 'SUPPORT';
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  attachments?: ChatAttachment[];
}

// Chat Attachment Interface / Chat Əlavəsi Interfeysi
interface ChatAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface UseChatOptions {
  roomId?: string;
  autoConnect?: boolean;
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
}

interface UseChatResult {
  // Rooms / Otaqlar
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
  
  // Messages / Mesajlar
  messages: ChatMessage[];
  messagesLoading: boolean;
  messagesError: string | null;
  
  // Actions / Əməliyyatlar
  createRoom: (productId?: string, orderId?: string) => Promise<ChatRoom | null>;
  selectRoom: (roomId: string) => Promise<void>;
  sendMessage: (content: string, attachments?: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  }>) => Promise<ChatMessage | null>;
  markAsRead: () => Promise<void>;
  closeRoom: () => Promise<void>;
  rateRoom: (rating: number, comment?: string) => Promise<void>;
  
  // Typing / Yazma
  isTyping: boolean;
  typingUsers: Set<string>;
  sendTyping: () => Promise<void>;
  
  // Real-time / Real-time
  isConnected: boolean;
  reconnect: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const { roomId, autoConnect = true, onMessage, onTyping } = options;
  
  // State / Vəziyyət
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  // Refs / Ref-lər
  const eventSourceRef = useRef<EventSource | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // API Fetch / API Fetch
  const { fetchData } = useApiFetch();
  
  // Load rooms / Otaqları yüklə
  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchData<{ rooms: ChatRoom[]; total: number }>('/api/chat/rooms');
      
      if (data) {
        setRooms(data.rooms || []);
        
        // Auto-select room if roomId provided / roomId verilərsə avtomatik seç
        if (roomId && !currentRoom) {
          const room = data.rooms?.find((r) => r.id === roomId);
          if (room) {
            await selectRoom(roomId);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chat rooms';
      setError(errorMessage);
      logger.error('Failed to load chat rooms', err);
    } finally {
      setLoading(false);
    }
  }, [roomId, currentRoom, fetchData]);
  
  // Load messages / Mesajları yüklə
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      setMessagesLoading(true);
      setMessagesError(null);
      
      const data = await fetchData<{ messages: ChatMessage[]; total: number }>(
        `/api/chat/rooms/${roomId}/messages?limit=50&offset=0`
      );
      
      if (data) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setMessagesError(errorMessage);
      logger.error('Failed to load messages', err);
    } finally {
      setMessagesLoading(false);
    }
  }, [fetchData]);
  
  // Create room / Otaq yarat
  const createRoom = useCallback(async (productId?: string, orderId?: string): Promise<ChatRoom | null> => {
    try {
      const data = await fetchData<{ id: string }>('/api/chat/rooms', {
        method: 'POST',
        body: JSON.stringify({ productId, orderId }),
      });
      
      if (data) {
        await loadRooms();
        if (data.id) {
          await selectRoom(data.id);
        }
        return currentRoom;
      }
      
      return null;
    } catch (err) {
      logger.error('Failed to create chat room', err);
      return null;
    }
  }, [fetchData, loadRooms, currentRoom]);
  
  // Select room / Otaq seç
  const selectRoom = useCallback(async (roomId: string) => {
    try {
      const data = await fetchData<ChatRoom>(`/api/chat/rooms/${roomId}`);
      
      if (data) {
        setCurrentRoom(data);
        await loadMessages(roomId);
        await markAsRead();
      }
    } catch (err) {
      logger.error('Failed to select room', err);
    }
  }, [fetchData, loadMessages]);
  
  // Send message / Mesaj göndər
  const sendMessage = useCallback(async (
    content: string,
    attachments?: Array<{
      fileUrl: string;
      fileType: string;
      fileName: string;
      fileSize: number;
    }>
  ): Promise<ChatMessage | null> => {
    if (!currentRoom || !content.trim()) {
      return null;
    }
    
    try {
      const data = await fetchData<ChatMessage>(
        `/api/chat/rooms/${currentRoom.id}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ content: content.trim(), attachments }),
        }
      );
      
      if (data) {
        setMessages((prev) => [...prev, data]);
        onMessage?.(data);
        return data;
      }
      
      return null;
    } catch (err) {
      logger.error('Failed to send message', err);
      return null;
    }
  }, [currentRoom, fetchData, onMessage]);
  
  // Mark as read / Oxunmuş kimi işarələ
  const markAsRead = useCallback(async () => {
    if (!currentRoom) return;
    
    try {
      await fetchData(`/api/chat/rooms/${currentRoom.id}/messages`, {
        method: 'PUT',
      });
    } catch (err) {
      logger.error('Failed to mark messages as read', err);
    }
  }, [currentRoom, fetchData]);
  
  // Close room / Otağı bağla
  const closeRoom = useCallback(async () => {
    if (!currentRoom) return;
    
    try {
      await fetchData(`/api/chat/rooms/${currentRoom.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'close' }),
      });
      
      await loadRooms();
      setCurrentRoom(null);
      setMessages([]);
    } catch (err) {
      logger.error('Failed to close room', err);
    }
  }, [currentRoom, fetchData, loadRooms]);
  
  // Rate room / Otağı reytinqlə
  const rateRoom = useCallback(async (rating: number, comment?: string) => {
    if (!currentRoom) return;
    
    try {
      await fetchData(`/api/chat/rooms/${currentRoom.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'rate', rating, comment }),
      });
      
      await loadRooms();
    } catch (err) {
      logger.error('Failed to rate room', err);
    }
  }, [currentRoom, fetchData, loadRooms]);
  
  // Send typing indicator / Yazma göstəricisi göndər
  const sendTyping = useCallback(async () => {
    if (!currentRoom || isTyping) return;
    
    try {
      setIsTyping(true);
      await fetchData(`/api/chat/rooms/${currentRoom.id}/typing`, {
        method: 'POST',
      });
      
      // Clear typing after 3 seconds / 3 saniyədən sonra yazmanı təmizlə
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    } catch (err) {
      logger.error('Failed to send typing indicator', err);
    }
  }, [currentRoom, isTyping, fetchData]);
  
  // Connect to real-time events / Real-time hadisələrə qoşul
  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    try {
      const eventSource = new EventSource('/api/realtime');
      eventSourceRef.current = eventSource;
      
      eventSource.onopen = () => {
        setIsConnected(true);
        logger.info('SSE connection opened / SSE bağlantısı açıldı');
      };
      
      eventSource.onerror = () => {
        setIsConnected(false);
        logger.error('SSE connection error / SSE bağlantı xətası');
      };
      
      // Listen for chat events / Chat hadisələrini dinlə
      eventSource.addEventListener('chat.message.new', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.data?.message && data.data.roomId === currentRoom?.id) {
            const message: ChatMessage = data.data.message;
            setMessages((prev) => [...prev, message]);
            onMessage?.(message);
          }
        } catch (err) {
          logger.error('Failed to parse chat message event', err);
        }
      });
      
      eventSource.addEventListener('chat.typing', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.data?.roomId === currentRoom?.id) {
            const { userId, isTyping: typing } = data.data;
            setTypingUsers((prev) => {
              const next = new Set(prev);
              if (typing) {
                next.add(userId);
              } else {
                next.delete(userId);
              }
              return next;
            });
            onTyping?.(userId, typing);
          }
        } catch (err) {
          logger.error('Failed to parse typing event', err);
        }
      });
      
      eventSource.addEventListener('chat.messages.read', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.data?.roomId === currentRoom?.id) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.senderId !== data.userId ? { ...msg, isRead: true } : msg
              )
            );
          }
        } catch (err) {
          logger.error('Failed to parse read event', err);
        }
      });
    } catch (err) {
      logger.error('Failed to connect to SSE', err);
    }
  }, [currentRoom, onMessage, onTyping]);
  
  // Reconnect / Yenidən qoşul
  const reconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    connect();
  }, [connect]);
  
  // Initial load / İlkin yükləmə
  useEffect(() => {
    if (autoConnect) {
      loadRooms();
      connect();
    }
    
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [autoConnect, loadRooms, connect]);
  
  return {
    rooms,
    currentRoom,
    loading,
    error,
    messages,
    messagesLoading,
    messagesError,
    createRoom,
    selectRoom,
    sendMessage,
    markAsRead,
    closeRoom,
    rateRoom,
    isTyping,
    typingUsers,
    sendTyping,
    isConnected,
    reconnect,
  };
}

