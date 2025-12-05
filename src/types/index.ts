/**
 * Global Type Definitions / Global Tip Tərifləri
 * This file re-exports shared types from @yusu/shared-types
 * Bu fayl @yusu/shared-types-dən paylaşılan tipləri yenidən export edir
 * 
 * Uses @yusu/shared-types for common type definitions
 * Ümumi tip tərifləri üçün @yusu/shared-types istifadə edir
 */

// Re-export all shared types / Bütün paylaşılan tipləri yenidən export et
// Use export type for isolatedModules compatibility / isolatedModules uyğunluğu üçün export type istifadə et
export type {
  UserRole,
  User,
  Product,
  Category,
  OrderStatus,
  Order,
  OrderItem,
  Address,
  CartItem,
  Courier,
  ApiResponse,
  PaginationParams,
  PaginationInfo,
  PaginatedResponse,
  ProductResponse,
  OrderResponse,
  OrderItemResponse,
  CategoryResponse,
  CartItemResponse,
  WishlistItemResponse,
  ReviewResponse,
} from '@yusu/shared-types';

// Import User type for extension / Genişləndirmə üçün User tipini import et
import type { User } from '@yusu/shared-types';

// Project-specific type extensions / Proyekt xüsusi tip genişləndirmələri
// Extended User interface with additional fields / Əlavə sahələrlə genişləndirilmiş User interface-i
export interface ExtendedUser extends User {
  image?: string;
  passwordHash?: string; // Parol hash-i (opsiyonal)
  resetToken?: string; // Reset token (opsiyonal)
  resetTokenExpiry?: Date; // Reset token müddəti (opsiyonal)
}
