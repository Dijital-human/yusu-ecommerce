import { BaseEmailProvider } from '../core/provider-base';
import type { EmailOptions, EmailResult } from '../core/types';

export class SendGridProvider extends BaseEmailProvider {
  name = 'SendGrid';
  private sgMail: any = null;

  getPriority(): number {
    return 3;
  }

  isConfigured(): boolean {
    return !!process.env.SENDGRID_API_KEY;
  }

  private async getSendGridClient() {
    if (this.sgMail) {
      return this.sgMail;
    }

    try {
      const sendgridModule = await import('@sendgrid/mail');
      this.sgMail = sendgridModule.default;

      if (process.env.SENDGRID_API_KEY) {
        this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      }

      return this.sgMail;
    } catch (error) {
      console.warn('⚠️ SendGrid package not available / SendGrid paketi mövcud deyil');
      return null;
    }
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'SendGrid is not configured / SendGrid konfiqurasiya edilməyib',
        provider: this.name,
      };
    }

    try {
      const client = await this.getSendGridClient();
      if (!client) {
        return {
          success: false,
          error: 'SendGrid client not available / SendGrid client mövcud deyil',
          provider: this.name,
        };
      }

      const normalized = this.normalizeOptions(options);

      const msg: any = {
        to: normalized.to,
        from: normalized.from,
        subject: normalized.subject,
        html: normalized.html,
        text: normalized.text,
      };

      if (normalized.replyTo) {
        msg.replyTo = normalized.replyTo;
      }

      if (normalized.cc) {
        msg.cc = normalized.cc;
      }

      if (normalized.bcc) {
        msg.bcc = normalized.bcc;
      }

      if (normalized.attachments && normalized.attachments.length > 0) {
        msg.attachments = normalized.attachments.map(att => ({
          content:
            typeof att.content === 'string'
              ? Buffer.from(att.content).toString('base64')
              : att.content.toString('base64'),
          filename: att.filename,
          type: att.contentType,
          disposition: 'attachment',
        }));
      }

      if (normalized.metadata) {
        msg.customArgs = normalized.metadata;
      }

      const [response] = await client.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'] as string,
        provider: this.name,
      };
    } catch (error: any) {
      console.error('❌ SendGrid send error / SendGrid göndərmə xətası:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email via SendGrid',
        provider: this.name,
      };
    }
  }
}

