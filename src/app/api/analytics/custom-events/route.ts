/**
 * Custom Events API Route / Xüsusi Hadisələr API Route
 * Provides custom event management and tracking
 * Xüsusi hadisə idarəetməsi və izləməsi təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createCustomEvent,
  trackCustomEvent,
  getCustomEventAnalytics,
  getAllCustomEvents,
  updateCustomEvent,
  deleteCustomEvent,
} from "@/lib/analytics/custom-events";

/**
 * GET /api/analytics/custom-events - Get all custom events / Bütün xüsusi hadisələri al
 * GET /api/analytics/custom-events/:eventId/analytics - Get event analytics / Hadisə analitikasını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams, pathname } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // If eventId provided, get analytics / Əgər eventId verilibsə, analitikanı al
    if (eventId) {
      const analytics = await getCustomEventAnalytics(
        eventId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      return successResponse(analytics);
    }

    // Otherwise, get all events / Əks halda, bütün hadisələri al
    const events = await getAllCustomEvents();
    return successResponse(events);
  } catch (error) {
    return handleApiError(error, "fetch custom events");
  }
}

/**
 * POST /api/analytics/custom-events - Create custom event / Xüsusi hadisə yarat
 * POST /api/analytics/custom-events/:eventId/track - Track custom event / Xüsusi hadisəni izlə
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const eventId = searchParams.get("eventId");

    // Track event / Hadisəni izlə
    if (action === 'track' && eventId) {
      const body = await request.json();
      const { parameters, sessionId } = body;

      await trackCustomEvent(eventId, parameters || {}, user.id, sessionId);
      return successResponse({ success: true });
    }

    // Create event / Hadisə yarat
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { name, parameters, description, enabled } = body;

    if (!name || !parameters) {
      return badRequestResponse("Missing required fields: name, parameters");
    }

    const newEventId = await createCustomEvent(name, parameters, {
      description,
      enabled,
    });

    return successResponse({ eventId: newEventId });
  } catch (error) {
    return handleApiError(error, "create/track custom event");
  }
}

/**
 * PUT /api/analytics/custom-events/:eventId - Update custom event / Xüsusi hadisəni yenilə
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return badRequestResponse("eventId is required");
    }

    const body = await request.json();
    await updateCustomEvent(eventId, body);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "update custom event");
  }
}

/**
 * DELETE /api/analytics/custom-events/:eventId - Delete custom event / Xüsusi hadisəni sil
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return badRequestResponse("eventId is required");
    }

    await deleteCustomEvent(eventId);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete custom event");
  }
}

