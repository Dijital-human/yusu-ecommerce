/**
 * WhatsApp Service / WhatsApp Xidməti
 * WhatsApp Business API integration / WhatsApp Business API inteqrasiyası
 */

import { logger } from '@/lib/utils/logger';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'image' | 'document';
  content?: string;
  templateName?: string;
  templateParams?: string[];
  mediaUrl?: string;
  caption?: string;
  fileName?: string;
}

export interface WhatsAppWebhookEvent {
  from: string;
  message: {
    id: string;
    type: string;
    text?: {
      body: string;
    };
    image?: {
      id: string;
      caption?: string;
    };
    document?: {
      id: string;
      filename: string;
    };
  };
  timestamp: string;
}

/**
 * Send WhatsApp message / WhatsApp mesajı göndər
 */
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string }> {
  try {
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
    const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!whatsappApiUrl || !whatsappApiToken || !whatsappPhoneNumberId) {
      logger.warn('WhatsApp API not configured / WhatsApp API konfiqurasiya edilməyib');
      return { success: false };
    }

    const payload: any = {
      messaging_product: 'whatsapp',
      to: message.to,
      type: message.type,
    };

    if (message.type === 'text' && message.content) {
      payload.text = { body: message.content };
    } else if (message.type === 'template' && message.templateName) {
      payload.template = {
        name: message.templateName,
        language: { code: 'en' },
        components: message.templateParams ? [
          {
            type: 'body',
            parameters: message.templateParams.map(param => ({
              type: 'text',
              text: param,
            })),
          },
        ] : [],
      };
    } else if (message.type === 'image' && message.mediaUrl) {
      payload.image = {
        link: message.mediaUrl,
        caption: message.caption,
      };
    } else if (message.type === 'document' && message.mediaUrl) {
      payload.document = {
        link: message.mediaUrl,
        filename: message.fileName,
        caption: message.caption,
      };
    }

    const response = await fetch(`${whatsappApiUrl}/${whatsappPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whatsappApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      logger.error('WhatsApp API error / WhatsApp API xətası', { error, message });
      return { success: false };
    }

    const data = await response.json();
    logger.info('WhatsApp message sent / WhatsApp mesajı göndərildi', {
      to: message.to,
      messageId: data.messages?.[0]?.id,
    });

    return {
      success: true,
      messageId: data.messages?.[0]?.id,
    };
  } catch (error) {
    logger.error('Failed to send WhatsApp message / WhatsApp mesajı göndərmək uğursuz oldu', error);
    return { success: false };
  }
}

/**
 * Send order update via WhatsApp / Sifariş yeniləməsini WhatsApp vasitəsilə göndər
 */
export async function sendOrderUpdateWhatsApp(
  phoneNumber: string,
  orderId: string,
  status: string,
  trackingNumber?: string
): Promise<boolean> {
  try {
    const statusMessages: Record<string, string> = {
      CONFIRMED: 'Your order has been confirmed! 🎉',
      PROCESSING: 'Your order is being processed.',
      SHIPPED: `Your order has been shipped! 📦${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
      DELIVERED: 'Your order has been delivered! ✅',
      CANCELLED: 'Your order has been cancelled.',
    };

    const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

    const result = await sendWhatsAppMessage({
      to: phoneNumber,
      type: 'text',
      content: `Order Update / Sifariş Yeniləməsi\n\nOrder ID: ${orderId}\nStatus: ${status}\n\n${message}`,
    });

    return result.success;
  } catch (error) {
    logger.error('Failed to send order update WhatsApp / Sifariş yeniləməsi WhatsApp göndərmək uğursuz oldu', error);
    return false;
  }
}

/**
 * Send customer support message via WhatsApp / Müştəri dəstəyi mesajını WhatsApp vasitəsilə göndər
 */
export async function sendSupportWhatsApp(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const result = await sendWhatsAppMessage({
      to: phoneNumber,
      type: 'text',
      content: `Customer Support / Müştəri Dəstəyi\n\n${message}`,
    });

    return result.success;
  } catch (error) {
    logger.error('Failed to send support WhatsApp / Dəstək WhatsApp göndərmək uğursuz oldu', error);
    return false;
  }
}

