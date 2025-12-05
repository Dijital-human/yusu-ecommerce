/**
 * Custom Events Service / Xüsusi Hadisələr Xidməti
 * Provides custom event tracking and analytics
 * Xüsusi hadisə izləməsi və analitika təmin edir
 */

import { logger } from '@/lib/utils/logger';
import { trackEvent, AnalyticsEventType } from './analytics';

/**
 * Custom event interface / Xüsusi hadisə interfeysi
 */
export interface CustomEvent {
  id: string;
  name: string;
  description?: string;
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    defaultValue?: any;
    description?: string;
  }>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Custom event tracking data / Xüsusi hadisə izləmə məlumatları
 */
export interface CustomEventTracking {
  eventId: string;
  eventName: string;
  userId?: string;
  sessionId?: string;
  parameters: Record<string, any>;
  timestamp: Date;
}

// In-memory storage (in production, use database) / Yaddaşda saxlama (production-da veritabanı istifadə et)
const customEventsStore: Map<string, CustomEvent> = new Map();
const customEventTrackingStore: CustomEventTracking[] = [];

/**
 * Create custom event / Xüsusi hadisə yarat
 */
export async function createCustomEvent(
  name: string,
  parameters: CustomEvent['parameters'],
  options?: {
    description?: string;
    enabled?: boolean;
  }
): Promise<string> {
  try {
    // Validate event name / Hadisə adını yoxla
    if (!name || name.trim().length === 0) {
      throw new Error('Event name is required / Hadisə adı tələb olunur');
    }

    // Validate parameters / Parametrləri yoxla
    for (const [key, param] of Object.entries(parameters)) {
      if (!param.type) {
        throw new Error(`Parameter ${key} must have a type / Parametr ${key} tipə malik olmalıdır`);
      }
    }

    const eventId = `custom_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const customEvent: CustomEvent = {
      id: eventId,
      name: name.trim(),
      description: options?.description,
      parameters,
      enabled: options?.enabled !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    customEventsStore.set(eventId, customEvent);

    logger.info('Custom event created / Xüsusi hadisə yaradıldı', {
      eventId,
      name,
      parameterCount: Object.keys(parameters).length,
    });

    return eventId;
  } catch (error) {
    logger.error('Failed to create custom event / Xüsusi hadisə yaratmaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Track custom event / Xüsusi hadisəni izlə
 */
export async function trackCustomEvent(
  eventId: string,
  parameters: Record<string, any>,
  userId?: string,
  sessionId?: string
): Promise<void> {
  try {
    const customEvent = customEventsStore.get(eventId);
    
    if (!customEvent) {
      throw new Error(`Custom event not found: ${eventId} / Xüsusi hadisə tapılmadı: ${eventId}`);
    }

    if (!customEvent.enabled) {
      logger.debug('Custom event is disabled / Xüsusi hadisə deaktivdir', { eventId });
      return;
    }

    // Validate parameters / Parametrləri yoxla
    const validatedParameters: Record<string, any> = {};
    
    for (const [key, paramDef] of Object.entries(customEvent.parameters)) {
      const value = parameters[key];
      
      if (paramDef.required && (value === undefined || value === null)) {
        if (paramDef.defaultValue !== undefined) {
          validatedParameters[key] = paramDef.defaultValue;
        } else {
          throw new Error(`Required parameter ${key} is missing / Tələb olunan parametr ${key} yoxdur`);
        }
      } else if (value !== undefined && value !== null) {
        // Type validation / Tip yoxlaması
        if (paramDef.type === 'number' && typeof value !== 'number') {
          throw new Error(`Parameter ${key} must be a number / Parametr ${key} rəqəm olmalıdır`);
        } else if (paramDef.type === 'string' && typeof value !== 'string') {
          throw new Error(`Parameter ${key} must be a string / Parametr ${key} string olmalıdır`);
        } else if (paramDef.type === 'boolean' && typeof value !== 'boolean') {
          throw new Error(`Parameter ${key} must be a boolean / Parametr ${key} boolean olmalıdır`);
        }
        
        validatedParameters[key] = value;
      } else if (paramDef.defaultValue !== undefined) {
        validatedParameters[key] = paramDef.defaultValue;
      }
    }

    // Store tracking data / İzləmə məlumatlarını saxla
    const tracking: CustomEventTracking = {
      eventId,
      eventName: customEvent.name,
      userId,
      sessionId,
      parameters: validatedParameters,
      timestamp: new Date(),
    };

    customEventTrackingStore.push(tracking);

    // Also track via main analytics service / Həm də əsas analytics xidməti vasitəsilə izlə
    await trackEvent({
      type: 'page_view' as AnalyticsEventType, // Use generic type / Ümumi tip istifadə et
      userId,
      sessionId,
      properties: {
        custom_event_id: eventId,
        custom_event_name: customEvent.name,
        ...validatedParameters,
      },
    });

    logger.debug('Custom event tracked / Xüsusi hadisə izləndi', {
      eventId,
      eventName: customEvent.name,
      userId,
      parameterCount: Object.keys(validatedParameters).length,
    });
  } catch (error) {
    logger.error('Failed to track custom event / Xüsusi hadisəni izləmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Get custom event analytics / Xüsusi hadisə analitikasını al
 */
export async function getCustomEventAnalytics(
  eventId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalEvents: number;
  uniqueUsers: number;
  averagePerUser: number;
  parameters: Record<string, {
    count: number;
    uniqueValues: number;
    topValues: Array<{ value: any; count: number }>;
  }>;
}> {
  try {
    const customEvent = customEventsStore.get(eventId);
    
    if (!customEvent) {
      throw new Error(`Custom event not found: ${eventId} / Xüsusi hadisə tapılmadı: ${eventId}`);
    }

    const filteredTracking = customEventTrackingStore.filter(t => {
      if (t.eventId !== eventId) return false;
      if (startDate && t.timestamp < startDate) return false;
      if (endDate && t.timestamp > endDate) return false;
      return true;
    });

    const totalEvents = filteredTracking.length;
    const uniqueUsers = new Set(filteredTracking.map(t => t.userId).filter(Boolean)).size;
    const averagePerUser = uniqueUsers > 0 ? totalEvents / uniqueUsers : 0;

    // Analyze parameters / Parametrləri analiz et
    const parameters: Record<string, {
      count: number;
      uniqueValues: number;
      topValues: Array<{ value: any; count: number }>;
    }> = {};

    for (const paramKey of Object.keys(customEvent.parameters)) {
      const values = filteredTracking
        .map(t => t.parameters[paramKey])
        .filter(v => v !== undefined && v !== null);

      const valueCounts = new Map<any, number>();
      values.forEach(v => {
        valueCounts.set(v, (valueCounts.get(v) || 0) + 1);
      });

      const topValues = Array.from(valueCounts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      parameters[paramKey] = {
        count: values.length,
        uniqueValues: valueCounts.size,
        topValues,
      };
    }

    return {
      totalEvents,
      uniqueUsers,
      averagePerUser: Math.round(averagePerUser * 100) / 100,
      parameters,
    };
  } catch (error) {
    logger.error('Failed to get custom event analytics / Xüsusi hadisə analitikasını almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Get all custom events / Bütün xüsusi hadisələri al
 */
export async function getAllCustomEvents(): Promise<CustomEvent[]> {
  return Array.from(customEventsStore.values());
}

/**
 * Update custom event / Xüsusi hadisəni yenilə
 */
export async function updateCustomEvent(
  eventId: string,
  updates: Partial<Pick<CustomEvent, 'name' | 'description' | 'parameters' | 'enabled'>>
): Promise<void> {
  const customEvent = customEventsStore.get(eventId);
  
  if (!customEvent) {
    throw new Error(`Custom event not found: ${eventId} / Xüsusi hadisə tapılmadı: ${eventId}`);
  }

  customEventsStore.set(eventId, {
    ...customEvent,
    ...updates,
    updatedAt: new Date(),
  });

  logger.info('Custom event updated / Xüsusi hadisə yeniləndi', { eventId });
}

/**
 * Delete custom event / Xüsusi hadisəni sil
 */
export async function deleteCustomEvent(eventId: string): Promise<void> {
  if (!customEventsStore.has(eventId)) {
    throw new Error(`Custom event not found: ${eventId} / Xüsusi hadisə tapılmadı: ${eventId}`);
  }

  customEventsStore.delete(eventId);
  
  // Remove tracking data / İzləmə məlumatlarını sil
  const index = customEventTrackingStore.findIndex(t => t.eventId === eventId);
  if (index !== -1) {
    customEventTrackingStore.splice(index, 1);
  }

  logger.info('Custom event deleted / Xüsusi hadisə silindi', { eventId });
}

