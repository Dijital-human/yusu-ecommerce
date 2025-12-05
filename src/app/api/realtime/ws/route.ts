/**
 * WebSocket API Route / WebSocket API Route
 * Provides WebSocket fallback for real-time updates
 * Real-time yeniləmələr üçün WebSocket fallback təmin edir
 * 
 * Note: Next.js App Router doesn't natively support WebSocket upgrades.
 * This route provides a WebSocket endpoint that can be used with a custom server
 * or through a WebSocket proxy.
 * 
 * Qeyd: Next.js App Router WebSocket upgrade-ləri dəstəkləmir.
 * Bu route custom server və ya WebSocket proxy vasitəsilə istifadə edilə bilər.
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { wsService } from "@/lib/realtime/websocket";
import { logger } from "@/lib/utils/logger";
import { handleApiError } from "@/lib/api/error-handler";

/**
 * WebSocket upgrade handler / WebSocket upgrade handler
 * 
 * Note: This requires a custom server setup or WebSocket proxy.
 * For production, consider using a dedicated WebSocket server or service.
 * 
 * Qeyd: Bu custom server quraşdırması və ya WebSocket proxy tələb edir.
 * Production üçün ayrılmış WebSocket server və ya xidmət istifadə etməyi düşünün.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user / İstifadəçini autentifikasiya et
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;

    // Check if WebSocket upgrade is requested / WebSocket upgrade istəyinin olub olmadığını yoxla
    const upgradeHeader = request.headers.get('upgrade');
    const connectionHeader = request.headers.get('connection');

    if (upgradeHeader?.toLowerCase() === 'websocket' && connectionHeader?.toLowerCase().includes('upgrade')) {
      // WebSocket upgrade requested / WebSocket upgrade istəyilir
      // Note: Next.js App Router doesn't support WebSocket upgrades natively
      // This would require a custom server or WebSocket proxy
      // Qeyd: Next.js App Router WebSocket upgrade-ləri native dəstəkləmir
      // Bu custom server və ya WebSocket proxy tələb edir
      
      logger.info('WebSocket upgrade requested / WebSocket upgrade istəyilir', { userId: user.id });
      
      return new Response('WebSocket upgrade requires custom server setup / WebSocket upgrade custom server quraşdırması tələb edir', {
        status: 426, // Upgrade Required
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
        },
      });
    }

    // Return WebSocket connection info / WebSocket bağlantı məlumatını qaytar
    return Response.json({
      message: 'WebSocket endpoint / WebSocket endpoint',
      userId: user.id,
      wsUrl: process.env.WEBSOCKET_URL || 'wss://your-domain.com/api/realtime/ws',
      instructions: 'Connect to WebSocket URL with authentication token / WebSocket URL-ə autentifikasiya token ilə qoşulun',
    });
  } catch (error) {
    return handleApiError(error, "establish WebSocket connection");
  }
}

/**
 * WebSocket connection handler for custom server / Custom server üçün WebSocket bağlantı handler
 * This function can be used in a custom Next.js server setup
 * Bu funksiya custom Next.js server quraşdırmasında istifadə edilə bilər
 */
export function handleWebSocketUpgrade(ws: any, userId: string): void {
  try {
    const connectionId = wsService.addConnection(ws, userId);
    
    // Send initial connection message / İlkin bağlantı mesajı göndər
    ws.send(JSON.stringify({
      type: 'connected',
      timestamp: new Date().toISOString(),
      connectionId,
    }));

    logger.info('WebSocket connection established / WebSocket bağlantısı quruldu', { connectionId, userId });
  } catch (error) {
    logger.error('Failed to establish WebSocket connection / WebSocket bağlantısı qurmaq uğursuz oldu', error, { userId });
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.close(1011, 'Internal server error / Daxili server xətası');
    }
  }
}

