/**
 * Live Chat Widget / Canlı Chat Widget-i
 * Floating chat widget for customer support
 * Müştəri dəstəyi üçün üzən chat widget-i
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  Minimize2,
  Maximize2,
  MoreVertical,
  Phone,
  Video,
  Bot,
  User,
  Image as ImageIcon,
  FileText,
  Loader2
} from "lucide-react";

/**
 * Chat message interface / Chat mesaj interfeysi
 */
interface ChatMessage {
  id: string;
  content: string;
  senderType: "customer" | "support" | "bot";
  senderName?: string;
  senderAvatar?: string;
  timestamp: Date;
  isRead?: boolean;
  attachments?: ChatAttachment[];
}

/**
 * Chat attachment interface / Chat əlavəsi interfeysi
 */
interface ChatAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

/**
 * Chat room status / Chat otağı statusu
 */
type ChatStatus = "connecting" | "connected" | "waiting" | "active" | "closed";

/**
 * Quick reply option / Tez cavab seçimi
 */
interface QuickReply {
  id: string;
  text: string;
}

export function LiveChatWidget() {
  const { data: session } = useSession();
  const t = useTranslations("chat");
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("connecting");
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Quick replies / Tez cavablar
  const quickReplies: QuickReply[] = [
    { id: "1", text: t("quickReplies.orderStatus") || "Where is my order?" },
    { id: "2", text: t("quickReplies.returnPolicy") || "Return policy?" },
    { id: "3", text: t("quickReplies.shipping") || "Shipping options?" },
    { id: "4", text: t("quickReplies.payment") || "Payment methods?" },
  ];

  // Scroll to bottom / Aşağıya sürüşdür
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize chat / Chat-ı başlat
  const initializeChat = useCallback(async () => {
    if (!session?.user) {
      // Guest mode - show bot welcome / Qonaq rejimi - bot salamını göstər
      setStatus("connected");
      setMessages([
        {
          id: "welcome",
          content: t("welcome.guest") || "Hello! How can I help you today? Please sign in for personalized support.",
          senderType: "bot",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    try {
      setStatus("connecting");
      
      // Create or get existing chat room / Chat otağı yarat və ya mövcud olanı al
      const response = await fetch("/api/chat/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session.user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoomId(data.roomId);
        setStatus("waiting");

        // Load existing messages / Mövcud mesajları yüklə
        if (data.messages) {
          setMessages(data.messages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            senderType: msg.senderType.toLowerCase(),
            senderName: msg.sender?.name,
            senderAvatar: msg.sender?.image,
            timestamp: new Date(msg.createdAt),
            isRead: msg.isRead,
            attachments: msg.attachments,
          })));
        }

        // Show welcome message if no messages / Mesaj yoxdursa salam mesajını göstər
        if (!data.messages?.length) {
          setMessages([
            {
              id: "welcome",
              content: t("welcome.user") || `Hello ${session.user.name}! How can we assist you today?`,
              senderType: "bot",
              timestamp: new Date(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setStatus("connected");
      setMessages([
        {
          id: "error",
          content: t("errors.connection") || "Unable to connect. Please try again later.",
          senderType: "bot",
          timestamp: new Date(),
        },
      ]);
    }
  }, [session, t]);

  // Open chat / Chat-ı aç
  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    if (messages.length === 0) {
      initializeChat();
    }
  };

  // Close chat / Chat-ı bağla
  const handleClose = () => {
    setIsOpen(false);
  };

  // Toggle minimize / Minimizə et/et-mə
  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Send message / Mesaj göndər
  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      content: message.trim(),
      senderType: "customer",
      senderName: session?.user?.name || "Guest",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsSending(true);

    try {
      if (roomId) {
        // Send to backend / Backend-ə göndər
        const response = await fetch(`/api/chat/room/${roomId}/message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage.content }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }
      }

      // Simulate bot response for demo / Demo üçün bot cavabını simulyasiya et
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          const botResponse: ChatMessage = {
            id: `bot_${Date.now()}`,
            content: getBotResponse(newMessage.content),
            senderType: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botResponse]);
        }, 1500);
      }, 500);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Get bot response (demo) / Bot cavabını al (demo)
  const getBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes("order") || lower.includes("sifariş")) {
      return t("responses.order") || "You can track your order in the 'My Orders' section of your account. Would you like me to help you find a specific order?";
    }
    if (lower.includes("return") || lower.includes("qaytarma")) {
      return t("responses.return") || "We offer a 30-day return policy for most items. Would you like more details?";
    }
    if (lower.includes("shipping") || lower.includes("çatdırılma")) {
      return t("responses.shipping") || "We offer Standard (5-7 days), Express (2-3 days), and Same-day delivery options depending on your location.";
    }
    if (lower.includes("payment") || lower.includes("ödəniş")) {
      return t("responses.payment") || "We accept credit cards, PayPal, Apple Pay, Google Pay, and Cash on Delivery.";
    }
    
    return t("responses.default") || "Thank you for your message. A support agent will be with you shortly. Is there anything else I can help you with?";
  };

  // Handle quick reply / Tez cavabı idarə et
  const handleQuickReply = (reply: QuickReply) => {
    setMessage(reply.text);
    inputRef.current?.focus();
  };

  // Handle file upload / Fayl yükləməsini idarə et
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // TODO: Implement file upload
    console.log("File upload:", files[0]);
  };

  // Handle key press / Düyməyə basmanı idarə et
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format time / Zamanı formatla
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("az-AZ", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      {/* Chat Button / Chat Düyməsi */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          aria-label={t("openChat") || "Open Chat"}
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Chat Window / Chat Pəncərəsi */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized
              ? "bottom-6 right-6 w-80 h-16"
              : "bottom-6 right-6 w-96 h-[600px] max-h-[80vh]"
          }`}
        >
          <div className="w-full h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            {/* Header / Başlıq */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    status === "active" ? "bg-green-400" : 
                    status === "waiting" ? "bg-yellow-400" : "bg-gray-400"
                  }`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t("title") || "Yusu Support"}</h3>
                  <p className="text-xs text-white/80">
                    {status === "connecting" && (t("status.connecting") || "Connecting...")}
                    {status === "waiting" && (t("status.waiting") || "Waiting for agent...")}
                    {status === "active" && (t("status.active") || "Agent connected")}
                    {status === "connected" && (t("status.online") || "Online")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={handleMinimize}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages / Mesajlar */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderType === "customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.senderType === "customer" ? "flex-row-reverse" : ""}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.senderType === "customer" 
                            ? "bg-primary-100 dark:bg-primary-900" 
                            : msg.senderType === "bot"
                            ? "bg-gray-200 dark:bg-gray-700"
                            : "bg-green-100 dark:bg-green-900"
                        }`}>
                          {msg.senderType === "customer" ? (
                            <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                          ) : msg.senderType === "bot" ? (
                            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                        
                        {/* Message bubble / Mesaj balonu */}
                        <div className={`rounded-2xl px-4 py-2 ${
                          msg.senderType === "customer"
                            ? "bg-primary-500 text-white rounded-br-md"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md shadow-sm"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.senderType === "customer" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                          }`}>
                            {formatTime(msg.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator / Yazma göstəricisi */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies / Tez Cavablar */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      {t("quickReplies.title") || "Quick Questions:"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area / Input Sahəsi */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                  <div className="flex items-end gap-2">
                    {/* Attachment button / Əlavə düyməsi */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Attach file"
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                    />
                    
                    {/* Message input / Mesaj input-u */}
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t("placeholder") || "Type your message..."}
                        className="w-full px-4 py-2 pr-10 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 resize-none max-h-24"
                        rows={1}
                      />
                      <button
                        className="absolute right-2 bottom-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        aria-label="Add emoji"
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Send button / Göndər düyməsi */}
                    <button
                      onClick={handleSend}
                      disabled={!message.trim() || isSending}
                      className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default LiveChatWidget;

