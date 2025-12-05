/**
 * Shipping Rates API Route / Çatdırılma Tarifləri API Route-u
 * Handles shipping rate calculation requests
 * Çatdırılma tarifi hesablama sorğularını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getShippingRates, shippingProviderManager } from "@/lib/shipping/shipping-provider";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import type { ShippingQuoteRequest } from "@/lib/shipping/shipping-provider";

/**
 * POST /api/shipping/rates - Get shipping rates / Çatdırılma tariflərini al
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to, weight, dimensions, value, items } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!from || !to || !weight || !value) {
      return badRequestResponse("Missing required fields: from, to, weight, value / Tələb olunan sahələr çatışmır: from, to, weight, value");
    }

    // Validate addresses / Ünvanları yoxla
    const requiredAddressFields = ['street', 'city', 'state', 'zipCode', 'country'];
    for (const field of requiredAddressFields) {
      if (!from[field] || !to[field]) {
        return badRequestResponse(`Missing address field: ${field} / Ünvan sahəsi çatışmır: ${field}`);
      }
    }

    const quoteRequest: ShippingQuoteRequest = {
      from,
      to,
      weight: parseFloat(weight),
      dimensions: dimensions ? {
        length: parseFloat(dimensions.length),
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
      } : undefined,
      value: parseFloat(value),
      items: items || [],
    };

    const rates = await getShippingRates(quoteRequest);

    return successResponse(rates);
  } catch (error) {
    return handleApiError(error, "calculate shipping rates");
  }
}

/**
 * GET /api/shipping/rates - Get available shipping providers / Mövcud çatdırılma provayderlərini al
 */
export async function GET(request: NextRequest) {
  try {
    const availableProviders = shippingProviderManager.getAvailableProviders();

    return successResponse({
      providers: availableProviders,
      defaultProvider: 'local', // Default to local provider / Default olaraq lokal provayder
    });
  } catch (error) {
    return handleApiError(error, "fetch shipping providers");
  }
}

