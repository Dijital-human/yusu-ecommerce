import type { EmailOptions, EmailResult, BulkEmailResult, EmailProvider } from './types';

/**
 * Common helper logic for all providers / Bütün provider-lər üçün ortaq köməkçi məntiq
 */

export abstract class BaseEmailProvider implements EmailProvider {
  abstract name: string;
  abstract getPriority(): number;

  abstract send(options: EmailOptions): Promise<EmailResult>;
  abstract isConfigured(): boolean;

  async sendBulk(emails: EmailOptions[]): Promise<BulkEmailResult> {
    const results = await Promise.allSettled(emails.map(email => this.send(email)));

    let success = 0;
    let failed = 0;
    const errors: Array<{ email: string; error: string }> = [];

    results.forEach((result, index) => {
      const email = emails[index];
      const emailStr = Array.isArray(email.to) ? email.to.join(', ') : email.to;

      if (result.status === 'fulfilled' && result.value.success) {
        success++;
      } else {
        failed++;
        errors.push({
          email: emailStr,
          error:
            result.status === 'rejected'
              ? result.reason?.message || 'Unknown error / Naməlum xəta'
              : result.value.error || 'Failed to send / Göndərmək uğursuz oldu',
        });
      }
    });

    return { success, failed, errors, provider: this.name };
  }

  protected normalizeOptions(options: EmailOptions): EmailOptions {
    return {
      ...options,
      from: options.from || process.env.EMAIL_FROM || 'noreply@yusu.com', // Default sender / Susmaya görə göndərici
      text: options.text || this.stripHtml(options.html), // HTML-dən plain text generasiya et
    };
  }

  protected stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

