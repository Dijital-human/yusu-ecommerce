/**
 * Input Sanitization Service / Input Sanitizasiya Xidməti
 * Provides XSS and injection protection through input sanitization
 * Input sanitizasiya vasitəsilə XSS və injection qorunması təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Sanitize HTML input to prevent XSS / XSS-i qarşısını almaq üçün HTML input-u sanitize et
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous HTML tags / Potensial təhlükəli HTML tag-lərini sil
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers / Event handler-ləri sil
    .replace(/javascript:/gi, '') // Remove javascript: protocol / javascript: protokolunu sil
    .replace(/data:text\/html/gi, ''); // Remove data:text/html / data:text/html sil
}

/**
 * Sanitize user input (general) / İstifadəçi input-u sanitize et (ümumi)
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove null bytes / Null byte-ları sil
  let sanitized = input.replace(/\0/g, '');

  // Remove control characters except newlines and tabs / Yeni sətirlər və tab-lar istisna olmaqla kontrol simvollarını sil
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim whitespace / Boşluqları trim et
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize SQL input (for manual queries) / SQL input-u sanitize et (manual sorğular üçün)
 * Note: Prisma already handles SQL injection, but this is for manual queries
 * Qeyd: Prisma artıq SQL injection-u idarə edir, amma bu manual sorğular üçündür
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove SQL injection patterns / SQL injection pattern-lərini sil
  return input
    .replace(/('|(\\')|(;)|(\\)|(\%27)|(\%3B)|(\%5C))/gi, '')
    .replace(/(\b(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '')
    .trim();
}

/**
 * Escape HTML entities / HTML entity-lərini escape et
 */
export function escapeHTML(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (match) => htmlEscapes[match] || match);
}

/**
 * Validate and sanitize email / Email-i yoxla və sanitize et
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(email.trim().toLowerCase());
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Validate and sanitize URL / URL-i yoxla və sanitize et
 */
export function sanitizeURL(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  const sanitized = sanitizeInput(url.trim());

  try {
    const parsed = new URL(sanitized);
    // Only allow http and https protocols / Yalnız http və https protokollarına icazə ver
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return sanitized;
  } catch {
    return null;
  }
}

/**
 * Sanitize object recursively / Obyekti rekursiv olaraq sanitize et
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T, options?: {
  sanitizeHTML?: boolean;
  sanitizeSQL?: boolean;
  escapeHTML?: boolean;
}): T {
  const {
    sanitizeHTML: sanitizeHTMLFields = false,
    sanitizeSQL: sanitizeSQLFields = false,
    escapeHTML: escapeHTMLFields = false,
  } = options || {};

  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      if (sanitizeHTMLFields) {
        (sanitized as any)[key] = sanitizeHTML(sanitized[key] as string);
      } else if (sanitizeSQLFields) {
        (sanitized as any)[key] = sanitizeSQL(sanitized[key] as string);
      } else if (escapeHTMLFields) {
        (sanitized as any)[key] = escapeHTML(sanitized[key] as string);
      } else {
        (sanitized as any)[key] = sanitizeInput(sanitized[key] as string);
      }
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null && !Array.isArray(sanitized[key])) {
      (sanitized as any)[key] = sanitizeObject(sanitized[key] as Record<string, any>, options);
    } else if (Array.isArray(sanitized[key])) {
      (sanitized as any)[key] = sanitized[key].map((item: any) => {
        if (typeof item === 'string') {
          if (sanitizeHTMLFields) {
            return sanitizeHTML(item);
          } else if (sanitizeSQLFields) {
            return sanitizeSQL(item);
          } else if (escapeHTMLFields) {
            return escapeHTML(item);
          } else {
            return sanitizeInput(item);
          }
        } else if (typeof item === 'object' && item !== null) {
          return sanitizeObject(item, options);
        }
        return item;
      });
    }
  }

  return sanitized;
}

