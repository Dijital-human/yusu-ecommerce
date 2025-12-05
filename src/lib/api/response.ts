/**
 * API Response Helpers / API Cavab Köməkçiləri
 * Standardized response formatting for API routes
 * API route-ları üçün standartlaşdırılmış cavab formatlaşdırması
 */

import { NextResponse } from "next/server";

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

/**
 * Create a successful API response
 * Uğurlu API cavabı yarat
 */
export function successResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}

/**
 * Create a successful API response with pagination
 * Səhifələmə ilə uğurlu API cavabı yarat
 */
export function successResponseWithPagination<T>(
  data: T,
  pagination: PaginationInfo,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    ...(message && { message }),
  });
}

/**
 * Create an error API response
 * Xəta API cavabı yarat
 */
export function errorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Create an unauthorized response
 * Yetkisiz cavab yarat
 */
export function unauthorizedResponse(): NextResponse<ApiResponse<never>> {
  return errorResponse("Unauthorized / Yetkisiz", 401);
}

/**
 * Create a forbidden response
 * Qadağan cavab yarat
 */
export function forbiddenResponse(): NextResponse<ApiResponse<never>> {
  return errorResponse("Forbidden / Qadağandır", 403);
}

/**
 * Create a not found response
 * Tapılmadı cavab yarat
 */
export function notFoundResponse(resource: string = "Resource"): NextResponse<ApiResponse<never>> {
  return errorResponse(
    `${resource} not found / ${resource} tapılmadı`,
    404
  );
}

/**
 * Create a bad request response
 * Yanlış sorğu cavabı yarat
 */
export function badRequestResponse(message: string): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 400);
}

