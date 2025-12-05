import { BaseEmailProvider } from '../core/provider-base';
import type { EmailOptions, EmailResult } from '../core/types';

export class ResendProvider extends BaseEmailProvider {
  name = 'Resend';
  private client: any = null;

  getPriority(): number {
    return 0;
  }

  isConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
  }

  private async getClient() {
    if (this.client) {
      return this.client;
    }

    try {
      const { Resend } = await import('resend');
      this.client = new Resend(process.env.RESEND_API_KEY!);
      return this.client;
    } catch (error) {
      console.warn('⚠️ Resend package not available / Resend paketi mövcud deyil');
      return null;
    }
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Resend is not configured / Resend konfiqurasiya edilməyib',
        provider: this.name,
      };
    }

    try {
      const client = await this.getClient();
      if (!client) {
        return {
          success: false,
          error: 'Resend client not available / Resend client mövcud deyil',
          provider: this.name,
        };
      }

      const normalized = this.normalizeOptions(options);
      const toArray = Array.isArray(normalized.to) ? normalized.to : [normalized.to];

      const response = await client.emails.send({
        from: normalized.from!,
        to: toArray,
        subject: normalized.subject,
        html: normalized.html,
        text: normalized.text,
        cc: normalized.cc ? (Array.isArray(normalized.cc) ? normalized.cc : [normalized.cc]) : undefined,
        bcc: normalized.bcc ? (Array.isArray(normalized.bcc) ? normalized.bcc : [normalized.bcc]) : undefined,
        reply_to: normalized.replyTo,
        attachments: normalized.attachments?.map(att => ({
          filename: att.filename,
          content:
            typeof att.content === 'string'
              ? Buffer.from(att.content).toString('base64')
              : att.content.toString('base64'),
        })),
        headers: normalized.metadata
          ? Object.entries(normalized.metadata).reduce((acc, [key, value]) => {
              acc[`X-${key}`] = value;
              return acc;
            }, {} as Record<string, string>)
          : undefined,
      });

      const responseData = response as any;

      if (responseData.error) {
        return {
          success: false,
          error: responseData.error.message || 'Resend API error / Resend API xətası',
          provider: this.name,
        };
      }

      const messageId = responseData?.data?.id || responseData?.id || undefined;

      return {
        success: true,
        messageId,
        provider: this.name,
      };
    } catch (error: any) {
      console.error('❌ Resend send error / Resend göndərmə xətası:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email via Resend / Resend vasitəsilə email göndərmək uğursuz oldu',
        provider: this.name,
      };
    }
  }
}

