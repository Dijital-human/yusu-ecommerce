import { getAvailableProviders, getPrimaryProvider } from '../providers';
import type { EmailOptions, EmailResult, BulkEmailResult, EmailProvider } from './types';

/**
 * Centralized email sending orchestrator / Email göndərmə üçün mərkəzləşdirilmiş orkestrator
 */

export class EmailService {
  private providers: EmailProvider[] = [];

  constructor() {
    this.providers = getAvailableProviders(); // Collect configured providers / Konfiqurasiya olunmuş provider-ləri topla
  }

  isConfigured(): boolean {
    return this.providers.length > 0; // Əgər siyahı boşdursa xidmət hazır deyil
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => p.name);
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (process.env.NODE_ENV !== 'production' && !this.isConfigured()) {
      console.log('📧 [Email Service] Email would be sent (development mode, email not configured):', {
        to: options.to,
        subject: options.subject,
      });
      return {
        success: true,
        messageId: `dev-mode-${Date.now()}`,
        provider: 'dev-mode',
      };
    }

    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'No email provider is configured / Email provider konfiqurasiya edilməyib',
      };
    }

    let lastError: string | undefined;

    for (const provider of this.providers) {
      try {
        const result = await provider.send(options); // Try provider in priority order / Prioritet sırasına görə provider yoxla
        if (result.success) {
          console.log(`✅ Email sent via ${result.provider}`);
          return result;
        }

        lastError = result.error;
        console.warn(`⚠️ ${provider.name} failed, trying next provider...`);
      } catch (error: any) {
        lastError = error.message || 'Unknown error / Naməlum xəta';
        console.warn(`⚠️ ${provider.name} threw error, trying next provider...`);
      }
    }

    return {
      success: false,
      error: lastError || 'All email providers failed / Bütün email provider-lər uğursuz oldu',
    };
  }

  async sendBulk(emails: EmailOptions[]): Promise<BulkEmailResult> {
    const primaryProvider = getPrimaryProvider(); // Only primary provider handles bulk / Toplu göndərməni yalnız əsas provider edir

    if (!primaryProvider) {
      return {
        success: 0,
        failed: emails.length,
        errors: emails.map(e => ({
          email: Array.isArray(e.to) ? e.to.join(', ') : e.to,
          error: 'No email provider configured / Email provider konfiqurasiya edilməyib',
        })),
      };
    }

    return primaryProvider.sendBulk(emails);
  }
}

let emailServiceInstance: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailServiceInstance) {
    emailServiceInstance = new EmailService();
  }
  return emailServiceInstance;
}

