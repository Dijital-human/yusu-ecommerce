/**
 * Chat Input Component / Chat Input Komponenti
 * Input field for sending messages / Mesaj göndərmək üçün input sahəsi
 */

'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslations } from 'next-intl';

interface ChatInputProps {
  onSend: (content: string, attachments?: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  }>) => Promise<void>;
  onTyping?: () => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, onTyping, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('chat');

  // Common emojis / Ümumi emoji-lər
  const commonEmojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];

  const handleSend = async () => {
    if ((!message.trim() && selectedFiles.length === 0) || isSending || disabled) return;

    setIsSending(true);
    try {
      let attachments: Array<{
        fileUrl: string;
        fileType: string;
        fileName: string;
        fileSize: number;
      }> = [];

      // Upload files if any / Əgər fayllar varsa yüklə
      if (selectedFiles.length > 0) {
        attachments = await uploadFiles(selectedFiles);
      }

      await onSend(message.trim() || '', attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to send message', error);
      alert(t('failedToSendMessage') || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Close emoji picker when clicking outside / Xaricə kliklədikdə emoji picker-i bağla
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key !== 'Enter') {
      // Send typing indicator / Yazma göstəricisi göndər
      onTyping?.();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...fileArray]);

    // Reset file input / Fayl input-unu sıfırla
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const uploadFiles = async (files: File[]): Promise<Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
  }>> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'chat-attachments');

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        return {
          fileUrl: data.url,
          fileType: file.type,
          fileName: file.name,
          fileSize: file.size,
        };
      } catch (error) {
        console.error('Failed to upload file:', error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* File Input (Hidden) / Fayl Input (Gizli) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,application/pdf,.doc,.docx"
      />

      {/* Selected Files Preview / Seçilmiş Fayllar Önizləməsi */}
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm"
            >
              <Paperclip className="h-4 w-4 text-gray-600" />
              <span className="max-w-[150px] truncate text-gray-700">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-gray-500 hover:text-red-600"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* File Button / Fayl Düyməsi */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
          aria-label={t('attachFile')}
        >
          <Paperclip className="h-5 w-5" />
        </button>

        {/* Emoji Button / Emoji Düyməsi */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="rounded p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            aria-label={t('addEmoji') || 'Add emoji'}
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Emoji Picker / Emoji Seçici */}
          {showEmojiPicker && (
            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-xl">
              <div className="mb-2 text-xs font-semibold text-gray-700">
                {t('selectEmoji') || 'Select Emoji'}
              </div>
              <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="rounded p-1 text-lg hover:bg-gray-100 transition-colors"
                    aria-label={`Emoji ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Input / Mesaj Input */}
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('typeMessage')}
          disabled={disabled || isSending}
          className="flex-1"
        />

        {/* Send Button / Göndər Düyməsi */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && selectedFiles.length === 0) || isSending || disabled}
          size="sm"
          className="h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Helper Text / Köməkçi Mətn */}
      <p className="mt-2 text-xs text-gray-500">
        {t('pressEnterToSend')}
      </p>
    </div>
  );
}

