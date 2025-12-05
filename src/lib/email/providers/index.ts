import { SMTPProvider } from './smtp-provider';
import { SendGridProvider } from './sendgrid-provider';
import { ResendProvider } from './resend-provider';
import type { EmailProvider } from '../core/types';

export function getAvailableProviders(): EmailProvider[] {
  const providers: EmailProvider[] = [];

  const resend = new ResendProvider();
  if (resend.isConfigured()) {
    providers.push(resend);
  }

  const smtp = new SMTPProvider();
  if (smtp.isConfigured()) {
    providers.push(smtp);
  }

  const sendgrid = new SendGridProvider();
  if (sendgrid.isConfigured()) {
    providers.push(sendgrid);
  }

  return providers.sort((a, b) => a.getPriority() - b.getPriority());
}

export function getPrimaryProvider(): EmailProvider | null {
  const providers = getAvailableProviders();
  return providers.length > 0 ? providers[0] : null;
}

