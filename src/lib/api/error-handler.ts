/**
 * API Error Handler / API Xəta İdarəçisi
 * Centralized error handling for API routes
 * API route-ları üçün mərkəzləşdirilmiş xəta idarəetməsi
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "@/lib/utils/logger";
import { badRequestResponse } from "./response";

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Handle API errors with proper formatting
 * Düzgün formatlaşdırma ilə API xətalarını idarə et
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  logger.error(`Error in ${context}`, error, { context });
  
  // Handle Zod validation errors / Zod validasiya xətalarını idarə et
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation error / Validasiya xətası",
        details: error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }
  
  // Handle known error types / Məlum xəta növlərini idarə et
  if (error instanceof Error) {
    // Handle Prisma Unique Constraint Error (P2002) / Prisma Unique Constraint Xətasını (P2002) idarə et
    const uniqueError = handlePrismaUniqueError(error);
    if (uniqueError) {
      return uniqueError;
    }

    // Handle Prisma errors / Prisma xətalarını idarə et
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle other Prisma error codes / Digər Prisma xəta kodlarını idarə et
      if (error.code === 'P2002') {
        // This should already be handled above, but just in case / Bu artıq yuxarıda idarə olunmalıdır, amma təhlükəsizlik üçün
        return handlePrismaUniqueError(error) || NextResponse.json(
          {
            success: false,
            error: "Duplicate entry / Təkrarlanan qeyd",
            message: "This resource already exists / Bu resurs artıq mövcuddur",
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          success: false,
          error: "Database error / Veritabanı xətası",
          message: "An error occurred while processing your request / Sorğunuzu emal edərkən xəta baş verdi",
        },
        { status: 500 }
      );
    }
    
    // Handle Prisma validation errors / Prisma validasiya xətalarını idarə et
    if (error.name === 'PrismaClientValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error / Validasiya xətası",
          message: error.message,
        },
        { status: 400 }
      );
    }
    
    // Handle other known errors / Digər məlum xətaları idarə et
    return NextResponse.json(
      {
        success: false,
        error: error.message || `Failed to ${context} / ${context} uğursuz`,
      },
      { status: 500 }
    );
  }
  
  // Handle unknown errors / Naməlum xətaları idarə et
  return NextResponse.json(
    {
      success: false,
      error: `Failed to ${context} / ${context} uğursuz`,
      message: "An unexpected error occurred / Gözlənilməz xəta baş verdi",
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma Unique Constraint Error (P2002)
 * Prisma Unique Constraint Xətasını (P2002) idarə et
 * @param error - Prisma error object / Prisma xəta obyekti
 * @param resourceName - Name of the resource (e.g., "Email", "Product") / Resursun adı (məsələn, "Email", "Product")
 * @param fieldName - Name of the field that caused the unique constraint violation / Unique constraint pozulmasına səbəb olan sahənin adı
 * @returns NextResponse with appropriate error message / Uyğun xəta mesajı ilə NextResponse
 */
export function handlePrismaUniqueError(
  error: unknown,
  resourceName: string = "Resource",
  fieldName?: string
): NextResponse | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target as string[] | undefined;
    const field = fieldName || (target && target.length > 0 ? target[0] : "field");
    
    const message = fieldName
      ? `${resourceName} with this ${fieldName} already exists / Bu ${fieldName} ilə ${resourceName} artıq mövcuddur`
      : `${resourceName} already exists / ${resourceName} artıq mövcuddur`;

    logger.warn(`Unique constraint violation / Unique constraint pozulması`, {
      code: error.code,
      field,
      resourceName,
    });

    return badRequestResponse(message);
  }

  return null;
}

/**
 * Create a standardized error response
 * Standartlaşdırılmış xəta cavabı yarat
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

