/**
 * Chat Message Component / Chat Mesaj Komponenti
 * Individual chat message display / Fərdi chat mesajı göstərilməsi
 */

'use client';

import { format } from 'date-fns';
import { Image as ImageIcon, File, Download } from 'lucide-react';
import Image from 'next/image';

interface ChatMessageProps {
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
    fileSize: number;
  }>;
  currentUserId?: string;
}

export function ChatMessage({
  senderType,
  content,
  createdAt,
  sender,
  attachments,
  currentUserId,
}: ChatMessageProps) {
  const isCustomer = senderType === 'CUSTOMER';
  const isOwnMessage = sender?.id === currentUserId;
  const senderName = sender?.name || sender?.email || 'Unknown';

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex gap-2 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar / Avatar */}
        {!isOwnMessage && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
            {sender?.image ? (
              <Image
                src={sender.image}
                alt={senderName}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              senderName.charAt(0).toUpperCase()
            )}
          </div>
        )}

        {/* Message Content / Mesaj Məzmunu */}
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {/* Sender Name / Göndərən Adı */}
          {!isOwnMessage && (
            <span className="text-xs text-gray-600 mb-1 px-1">
              {senderName}
            </span>
          )}

          {/* Message Bubble / Mesaj Balonu */}
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            {/* Text Content / Mətn Məzmunu */}
            {content && (
              <p className={`text-sm whitespace-pre-wrap break-words ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                {content}
              </p>
            )}

            {/* Attachments / Əlavələr */}
            {attachments && attachments.length > 0 && (
              <div className={`mt-2 space-y-2 ${content ? 'mt-2' : ''}`}>
                {attachments.map((attachment) => {
                  const isImage = attachment.fileType.startsWith('image/');
                  
                  return (
                    <div
                      key={attachment.id}
                      className={`rounded-lg overflow-hidden ${
                        isOwnMessage ? 'bg-white/20' : 'bg-white border border-gray-200'
                      }`}
                    >
                      {isImage ? (
                        <div className="relative w-full max-w-xs">
                          <Image
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            width={300}
                            height={200}
                            className="object-cover"
                          />
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                        </div>
                      ) : (
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 p-3 hover:opacity-80 transition-opacity ${
                            isOwnMessage ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {getFileIcon(attachment.fileType)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs opacity-75">
                              {formatFileSize(attachment.fileSize)}
                            </p>
                          </div>
                          <Download className="h-4 w-4 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timestamp / Zaman Damgası */}
          <span
            className={`text-xs mt-1 px-1 ${
              isOwnMessage ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            {format(new Date(createdAt), 'HH:mm')}
          </span>
        </div>
      </div>
    </div>
  );
}

