/**
 * Email Service Core Types / Email Xidməti Əsas Tipləri
 * 
 * Defines shared structures used by all providers / Bütün provider-lərin
 * istifadə etdiyi paylaşılan strukturları müəyyənləşdirir.
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
  metadata?: Record<string, string>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

export interface BulkEmailResult {
  success: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
  provider?: string;
}

export interface EmailProvider {
  name: string;
  send(options: EmailOptions): Promise<EmailResult>;
  sendBulk(emails: EmailOptions[]): Promise<BulkEmailResult>;
  isConfigured(): boolean;
  getPriority(): number; // Lower value = higher priority / Kiçik rəqəm = daha yüksək prioritet
}

