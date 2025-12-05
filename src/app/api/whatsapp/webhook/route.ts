/**
 * WhatsApp Webhook API Route / WhatsApp Webhook API Route
 * Handles incoming WhatsApp messages / Gələn WhatsApp mesajlarını idarə edir
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import { getWriteClient } from '@/lib/db/query-client';

// Verify webhook (required by WhatsApp) / Webhook-u doğrula (WhatsApp tərəfindən tələb olunur)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('WhatsApp webhook verified / WhatsApp webhook doğrulandı');
      return new NextResponse(challenge, { status: 200 });
    }

    return NextResponse.json({ error: 'Forbidden / Qadağan' }, { status: 403 });
  } catch (error) {
    logger.error('WhatsApp webhook verification failed / WhatsApp webhook doğrulaması uğursuz oldu', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle incoming messages / Gələn mesajları idarə et
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // WhatsApp webhook structure / WhatsApp webhook strukturu
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value || !value.messages) {
      return NextResponse.json({ success: true });
    }

    const messages = value.messages;
    const writeClient = await getWriteClient();

    // Process each message / Hər mesajı işlə
    for (const message of messages) {
      const from = message.from;
      const messageId = message.id;
      const messageType = message.type;
      const timestamp = message.timestamp;

      // Get or create chat room / Chat otağını al və ya yarat
      // Find user by phone number / Telefon nömrəsinə görə istifadəçini tap
      const user = await (writeClient as any).user.findFirst({
        where: {
          phone: from,
        },
      });

      if (!user) {
        logger.warn('WhatsApp message from unknown user / Naməlum istifadəçidən WhatsApp mesajı', { from });
        continue;
      }

      // Extract message content / Mesaj məzmununu çıxar
      let content = '';
      if (messageType === 'text' && message.text) {
        content = message.text.body;
      } else if (messageType === 'image' && message.image) {
        content = `[Image] ${message.image.caption || ''}`;
      } else if (messageType === 'document' && message.document) {
        content = `[Document] ${message.document.filename || ''}`;
      }

      // Create or get chat room / Chat otağını yarat və ya al
      let chatRoom = await (writeClient as any).chatRoom.findFirst({
        where: {
          customerId: user.id,
          status: {
            in: ['OPEN', 'WAITING', 'IN_PROGRESS'],
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (!chatRoom) {
        chatRoom = await (writeClient as any).chatRoom.create({
          data: {
            customerId: user.id,
            status: 'OPEN',
            source: 'WHATSAPP',
          },
        });
      }

      // Save message / Mesajı saxla
      await (writeClient as any).chatMessage.create({
        data: {
          roomId: chatRoom.id,
          senderId: user.id,
          senderType: 'CUSTOMER',
          content,
          source: 'WHATSAPP',
          externalMessageId: messageId,
        },
      });

      // Update room last message time / Otağın son mesaj vaxtını yenilə
      await (writeClient as any).chatRoom.update({
        where: { id: chatRoom.id },
        data: { updatedAt: new Date() },
      });

      logger.info('WhatsApp message processed / WhatsApp mesajı işləndi', {
        from,
        messageId,
        roomId: chatRoom.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('WhatsApp webhook processing failed / WhatsApp webhook işləməsi uğursuz oldu', error);
    return NextResponse.json({ success: true }); // Return success to prevent retries / Yenidən cəhd etməmək üçün success qaytar
  }
}

