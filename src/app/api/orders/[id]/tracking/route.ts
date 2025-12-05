/**
 * Order Tracking API Route (SSE) / Sifariş İzləmə API Route (SSE)
 * Server-Sent Events for real-time order tracking / Real-time sifariş izləmə üçün Server-Sent Events
 */

import { NextRequest } from 'next/server';
import { getOrderTrackingTimeline, subscribeToOrderTracking } from '@/lib/realtime/order-tracking';
import { getReadClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/orders/[id]/tracking
 * Get order tracking timeline / Sifariş izləmə zaman xəttini al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const { searchParams } = new URL(request.url);
    const stream = searchParams.get('stream') === 'true';

    if (stream) {
      // SSE stream / SSE axını
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            
            // Send initial timeline / İlkin zaman xəttini göndər
            const timeline = await getOrderTrackingTimeline(orderId);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'timeline', data: timeline })}\n\n`)
            );

            // Subscribe to updates / Yeniləmələrə abunə ol
            const unsubscribe = await subscribeToOrderTracking(orderId, (update) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'update', data: update })}\n\n`)
              );
            });

            // Keep connection alive / Əlaqəni canlı saxla
            const keepAlive = setInterval(() => {
              controller.enqueue(encoder.encode(': keepalive\n\n'));
            }, 30000);

            // Cleanup on close / Bağlananda təmizlə
            request.signal.addEventListener('abort', () => {
              unsubscribe();
              clearInterval(keepAlive);
              controller.close();
            });
          },
        }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        }
      );
    } else {
      // Regular GET request / Adi GET sorğusu
      const timeline = await getOrderTrackingTimeline(orderId);
      return Response.json({ success: true, data: timeline });
    }
  } catch (error) {
    logger.error('Error in order tracking API / Sifariş izləmə API-də xəta', error);
    return Response.json(
      { success: false, error: 'Failed to get order tracking / Sifariş izləməsini almaq uğursuz oldu' },
      { status: 500 }
    );
  }
}

