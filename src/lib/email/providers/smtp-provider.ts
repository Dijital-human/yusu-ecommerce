import { BaseEmailProvider } from '../core/provider-base';
import type { EmailOptions, EmailResult } from '../core/types';

export class SMTPProvider extends BaseEmailProvider {
  name = 'SMTP';
  private transporter: any = null;

  getPriority(): number {
    return 1;
  }

  isConfigured(): boolean {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.EMAIL_FROM
    );
  }

  private async getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    try {
      const nodemailer = await import('nodemailer');

      this.transporter = nodemailer.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
      });

      await this.transporter.verify();

      return this.transporter;
    } catch (error) {
      console.error('❌ SMTP configuration error / SMTP konfiqurasiya xətası:', error);
      return null;
    }
  }

  async send(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'SMTP is not configured / SMTP konfiqurasiya edilməyib',
        provider: this.name,
      };
    }

    try {
      const transporter = await this.getTransporter();
      if (!transporter) {
        return {
          success: false,
          error: 'Failed to initialize SMTP transporter / SMTP transporter-i işə salmaq uğursuz oldu',
          provider: this.name,
        };
      }

      const normalized = this.normalizeOptions(options);

      const info = await transporter.sendMail({
        from: normalized.from,
        to: normalized.to,
        subject: normalized.subject,
        html: normalized.html,
        text: normalized.text,
        cc: normalized.cc,
        bcc: normalized.bcc,
        replyTo: normalized.replyTo,
        attachments: normalized.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
      };
    } catch (error: any) {
      console.error('❌ SMTP send error / SMTP göndərmə xətası:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email via SMTP / SMTP vasitəsilə email göndərmək uğursuz oldu',
        provider: this.name,
      };
    }
  }
}

