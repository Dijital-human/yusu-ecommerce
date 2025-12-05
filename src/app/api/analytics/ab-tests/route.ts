/**
 * A/B Testing API Route / A/B Test API Route
 * Provides A/B test management and results
 * A/B test idarəetməsi və nəticələri təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createABTest,
  assignVariant,
  trackConversion,
  getABTestResults,
  ABTestVariant,
} from "@/lib/analytics/ab-testing";

/**
 * POST /api/analytics/ab-tests - Create A/B test / A/B test yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { name, variants, targetMetric, description, minimumSampleSize, confidenceLevel, startDate, endDate } = body;

    if (!name || !variants || !targetMetric) {
      return badRequestResponse("Missing required fields: name, variants, targetMetric");
    }

    if (!Array.isArray(variants) || variants.length < 2) {
      return badRequestResponse("At least 2 variants are required");
    }

    const testId = await createABTest(
      name,
      variants as Omit<ABTestVariant, 'id'>[],
      targetMetric,
      {
        description,
        minimumSampleSize,
        confidenceLevel,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      }
    );

    return successResponse({ testId });
  } catch (error) {
    return handleApiError(error, "create A/B test");
  }
}

/**
 * GET /api/analytics/ab-tests/:testId/assign - Assign user to variant / İstifadəçini variant-a təyin et
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return badRequestResponse("testId is required");
    }

    // In production, fetch test and variants from database / Production-da test və variantları veritabanından al
    // This is a placeholder / Bu placeholder-dır
    const variants: ABTestVariant[] = [
      { id: 'variant_a', name: 'Variant A', trafficPercentage: 50, isControl: true },
      { id: 'variant_b', name: 'Variant B', trafficPercentage: 50, isControl: false },
    ];

    const assignedVariant = assignVariant(testId, user.id, variants);

    return successResponse({ variant: assignedVariant });
  } catch (error) {
    return handleApiError(error, "assign variant");
  }
}

/**
 * POST /api/analytics/ab-tests/:testId/conversion - Track conversion / Konversiyanı izlə
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return badRequestResponse("testId is required");
    }

    const body = await request.json();
    const { variantId, value } = body;

    if (!variantId) {
      return badRequestResponse("variantId is required");
    }

    await trackConversion(testId, variantId, user.id, value);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "track conversion");
  }
}

