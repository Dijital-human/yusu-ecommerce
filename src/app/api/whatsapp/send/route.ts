/**
 * WhatsApp Send API Route / WhatsApp Göndərmə API Route
 * Send WhatsApp messages / WhatsApp mesajları göndər
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { sendWhatsAppMessage, sendOrderUpdateWhatsApp, sendSupportWhatsApp } from '@/lib/whatsapp/whatsapp-service';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { type, phoneNumber, message, orderId, status, trackingNumber } = body;

    // Validate phone number format / Telefon nömrəsi formatını doğrula
    if (!phoneNumber || !phoneNumber.match(/^\d{10,15}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number format / Etibarsız telefon nömrəsi formatı' },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'order_update':
        if (!orderId || !status) {
          return NextResponse.json(
            { success: false, error: 'Order ID and status are required / Sifariş ID və status tələb olunur' },
            { status: 400 }
          );
        }
        result = await sendOrderUpdateWhatsApp(phoneNumber, orderId, status, trackingNumber);
        break;

      case 'support':
        if (!message) {
          return NextResponse.json(
            { success: false, error: 'Message is required / Mesaj tələb olunur' },
            { status: 400 }
          );
        }
        result = await sendSupportWhatsApp(phoneNumber, message);
        break;

      case 'custom':
        if (!message) {
          return NextResponse.json(
            { success: false, error: 'Message is required / Mesaj tələb olunur' },
            { status: 400 }
          );
        }
        const customResult = await sendWhatsAppMessage({
          to: phoneNumber,
          type: 'text',
          content: message,
        });
        result = customResult.success;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid message type / Etibarsız mesaj tipi' },
          { status: 400 }
        );
    }

    if (result) {
      logger.info('WhatsApp message sent via API / API vasitəsilə WhatsApp mesajı göndərildi', {
        userId: user.id,
        type,
        phoneNumber,
      });
      return successResponse({ success: true, message: 'WhatsApp message sent / WhatsApp mesajı göndərildi' });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send WhatsApp message / WhatsApp mesajı göndərmək uğursuz oldu' },
        { status: 500 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'send WhatsApp message');
  }
}

