/**
 * Error Handling Helpers / Xəta İdarəetmə Köməkçiləri
 * Reusable error handling functions for API routes
 * API route-ları üçün təkrar istifadə olunan xəta idarəetmə funksiyaları
 */

import { Prisma } from "@prisma/client";
import { badRequestResponse, errorResponse } from "./response";

/**
 * Handle Prisma unique constraint error (P2002)
 * Prisma unikal məhdudiyyət xətasını idarə et (P2002)
 */
export function handlePrismaUniqueError(
  error: unknown,
  message: string
): Response | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return errorResponse(message, 409);
  }

  // Handle error with code property (for cases where Prisma error is wrapped)
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return badRequestResponse(message);
  }

  return null;
}

/**
 * Handle Prisma not found error (P2025)
 * Prisma tapılmadı xətasını idarə et (P2025)
 */
export function handlePrismaNotFoundError(
  error: unknown,
  message: string
): Response | null {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return errorResponse(message, 404);
  }

  return null;
}

