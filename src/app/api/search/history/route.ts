/**
 * Search History API Route / Axtarış Tarixçəsi API Route
 * Provides search history management
 * Axtarış tarixçəsi idarəetməsi təmin edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  saveSearchHistory,
  getUserSearchHistory,
  deleteSearchHistory,
  clearUserSearchHistory,
  getSearchSuggestionsFromHistory,
} from "@/lib/search/search-history";

/**
 * GET /api/search/history - Get user search history / İstifadəçi axtarış tarixçəsini al
 * GET /api/search/history?suggestions=query - Get search suggestions / Axtarış təkliflərini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const suggestions = searchParams.get("suggestions");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Get suggestions / Təklifləri al
    if (suggestions) {
      const suggestionsList = await getSearchSuggestionsFromHistory(user.id, suggestions, limit);
      return successResponse({ suggestions: suggestionsList });
    }

    // Get history / Tarixçəni al
    const history = await getUserSearchHistory(user.id, limit);
    return successResponse({ history });
  } catch (error) {
    return handleApiError(error, "fetch search history");
  }
}

/**
 * POST /api/search/history - Save search query / Axtarış sorğusunu saxla
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const body = await request.json();
    const { query, resultsCount, filters } = body;

    if (!query) {
      return badRequestResponse("query is required");
    }

    await saveSearchHistory(user.id, query, {
      resultsCount,
      filters,
    });

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "save search history");
  }
}

/**
 * DELETE /api/search/history - Clear search history / Axtarış tarixçəsini təmizlə
 * DELETE /api/search/history?id=historyId - Delete specific history item / Müəyyən tarixçə elementini sil
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("id");

    if (historyId) {
      // Delete specific item / Müəyyən elementi sil
      await deleteSearchHistory(user.id, historyId);
    } else {
      // Clear all history / Bütün tarixçəni təmizlə
      await clearUserSearchHistory(user.id);
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, "delete search history");
  }
}

