/**
 * User Events / İstifadəçi Event-ləri
 * User-related event handlers and utilities
 * İstifadəçilə bağlı event handler-ləri və utility-lər
 */

import { emit } from './event-bus';
import { on } from './event-bus';
import { invalidateUserCache, invalidateRelatedCaches } from '@/lib/cache/cache-invalidator';
import { logger } from '@/lib/utils/logger';
import type { Event } from './types';

/**
 * Emit user registered event / İstifadəçi qeydiyyatdan keçdi event-i emit et
 */
export function emitUserRegistered(user: any, requestId?: string): void {
  emit('user.registered', {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }, {
    userId: user.id,
    requestId,
    priority: 'normal',
  });
}

/**
 * Emit user updated event / İstifadəçi yeniləndi event-i emit et
 */
export function emitUserUpdated(userId: string, updates: any, requestId?: string): void {
  emit('user.updated', {
    userId,
    updates,
  }, {
    userId,
    requestId,
    priority: 'normal',
  });
}

/**
 * Emit user deleted event / İstifadəçi silindi event-i emit et
 */
export function emitUserDeleted(userId: string, requestId?: string): void {
  emit('user.deleted', {
    userId,
  }, {
    userId,
    requestId,
    priority: 'high',
  });
}

/**
 * Emit user login event / İstifadəçi daxil oldu event-i emit et
 */
export function emitUserLogin(userId: string, ip?: string, userAgent?: string, requestId?: string): void {
  emit('user.login', {
    userId,
    ip,
    userAgent,
  }, {
    userId,
    requestId,
    priority: 'low',
  });
}

/**
 * Emit user logout event / İstifadəçi çıxış etdi event-i emit et
 */
export function emitUserLogout(userId: string, requestId?: string): void {
  emit('user.logout', {
    userId,
  }, {
    userId,
    requestId,
    priority: 'low',
  });
}

/**
 * Emit user notification event / İstifadəçi bildirişi event-i emit et
 * This is used for sending notifications to users from admin panel
 * Bu admin paneldən istifadəçilərə bildiriş göndərmək üçün istifadə olunur
 */
export async function emitUserNotification(
  userId: string,
  notification: {
    title: string;
    message: string;
    type?: "info" | "warning" | "error" | "success";
    source?: string;
    adminId?: string;
  }
): Promise<void> {
  emit('user.notification', {
    userId,
    title: notification.title,
    message: notification.message,
    type: notification.type || "info",
    source: notification.source || "system",
    adminId: notification.adminId,
  }, {
    userId,
    priority: 'normal',
  });

  // Also log the notification / Bildirişi də log et
  logger.info('User notification sent / İstifadəçi bildirişi göndərildi', {
    userId,
    title: notification.title,
    type: notification.type,
    source: notification.source,
    adminId: notification.adminId,
  });
}

/**
 * Register user event handlers / İstifadəçi event handler-lərini qeydiyyatdan keçir
 */
export function registerUserEventHandlers(): void {
  // User registered handler / İstifadəçi qeydiyyatdan keçdi handler-i
  on('user.registered', async (event: Event) => {
    try {
      const { userId, email, name } = event.payload;

      // Send welcome email / Xoş gəlmisiniz email-i göndər
      try {
        // Note: Email verification is handled separately / Qeyd: Email təsdiqi ayrıca idarə olunur
        // This is a placeholder for welcome email / Bu xoş gəlmisiniz email-i üçün placeholder-dır
        logger.info('User registered, welcome email should be sent / İstifadəçi qeydiyyatdan keçdi, xoş gəlmisiniz email-i göndərilməlidir', {
          userId,
          email,
        });
      } catch (error) {
        logger.error('Failed to send welcome email / Xoş gəlmisiniz email-i göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          userId,
          email,
        });
      }

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateUserCache(userId);
        await invalidateRelatedCaches('user', userId);
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          userId,
        });
      }

      // TODO: Send to analytics / Analytics-ə göndər
      // TODO: Create user profile / İstifadəçi profil yarat
    } catch (error) {
      logger.error('User registered event handler failed / İstifadəçi qeydiyyatdan keçdi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'normal',
    async: true,
  });

  // User updated handler / İstifadəçi yeniləndi handler-i
  on('user.updated', async (event: Event) => {
    try {
      const { userId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateUserCache(userId);
        await invalidateRelatedCaches('user', userId);
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          userId,
        });
      }

      // TODO: Update analytics / Analytics-i yenilə
    } catch (error) {
      logger.error('User updated event handler failed / İstifadəçi yeniləndi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'normal',
    async: true,
  });

  // User deleted handler / İstifadəçi silindi handler-i
  on('user.deleted', async (event: Event) => {
    try {
      const { userId } = event.payload;

      // Invalidate cache / Cache-i invalidate et
      try {
        await invalidateUserCache(userId);
        await invalidateRelatedCaches('user', userId);
      } catch (error) {
        logger.error('Failed to invalidate cache / Cache-i invalidate etmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
          userId,
        });
      }

      // TODO: Clean up user data / İstifadəçi məlumatlarını təmizlə
      // TODO: Update analytics / Analytics-i yenilə
    } catch (error) {
      logger.error('User deleted event handler failed / İstifadəçi silindi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'high',
    async: true,
  });

  // User login handler / İstifadəçi daxil oldu handler-i
  on('user.login', async (event: Event) => {
    try {
      const { userId, ip, userAgent } = event.payload;

      // TODO: Track login analytics / Login analytics izlə
      // TODO: Update last login time / Son login vaxtını yenilə
      // TODO: Check for suspicious activity / Şübhəli fəaliyyəti yoxla
    } catch (error) {
      logger.error('User login event handler failed / İstifadəçi daxil oldu event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'low',
    async: true,
  });

  // User logout handler / İstifadəçi çıxış etdi handler-i
  on('user.logout', async (event: Event) => {
    try {
      const { userId } = event.payload;

      // TODO: Track logout analytics / Logout analytics izlə
      // TODO: Clean up session data / Session məlumatlarını təmizlə
    } catch (error) {
      logger.error('User logout event handler failed / İstifadəçi çıxış etdi event handler-i uğursuz oldu', error instanceof Error ? error : new Error(String(error)), {
        eventType: event.type,
      });
    }
  }, {
    priority: 'low',
    async: true,
  });

  logger.info('User event handlers registered / İstifadəçi event handler-ləri qeydiyyatdan keçdi');
}

