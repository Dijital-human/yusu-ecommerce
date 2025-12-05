/**
 * Pagination Helpers / Səhifələmə Köməkçiləri
 * Utility functions for handling pagination in API routes
 * API route-larında səhifələməni idarə etmək üçün faydalı funksiyalar
 */

import { URLSearchParams } from "url";

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Parse pagination parameters from URL search params
 * URL axtarış parametrlərindən səhifələmə parametrlərini parse et
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number = 12
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || String(defaultLimit), 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create pagination info object
 * Səhifələmə məlumat obyekti yarat
 */
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
): PaginationInfo {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Validate pagination parameters
 * Səhifələmə parametrlərini yoxla
 */
export function validatePagination(
  page: number,
  limit: number
): { valid: boolean; error?: string } {
  if (page < 1) {
    return { valid: false, error: "Page must be greater than 0 / Səhifə 0-dan böyük olmalıdır" };
  }
  
  if (limit < 1 || limit > 100) {
    return { valid: false, error: "Limit must be between 1 and 100 / Limit 1 ilə 100 arasında olmalıdır" };
  }
  
  return { valid: true };
}

