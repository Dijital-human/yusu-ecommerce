/**
 * Addresses API Route / Ünvanlar API Route
 * Handle user address CRUD operations / İstifadəçi ünvan CRUD əməliyyatlarını idarə et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, badRequestResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import {
  getUserAddresses,
  createAddress,
  CreateAddressData,
} from '@/lib/db/user-addresses';

/**
 * GET /api/addresses
 * Get user addresses / İstifadəçi ünvanlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const addresses = await getUserAddresses(user.id);

    return successResponse(addresses);
  } catch (error) {
    return handleApiError(error, 'get addresses');
  }
}

/**
 * POST /api/addresses
 * Create new address / Yeni ünvan yarat
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!body.street || !body.city || !body.state || !body.zipCode || !body.country) {
      return badRequestResponse('Missing required fields / Tələb olunan sahələr çatışmır');
    }

    const addressData: CreateAddressData = {
      userId: user.id,
      label: body.label,
      street: body.street,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country,
      phoneNumber: body.phoneNumber,
      latitude: body.latitude,
      longitude: body.longitude,
      isDefault: body.isDefault || false,
    };

    const address = await createAddress(addressData);

    return successResponse(address);
  } catch (error) {
    return handleApiError(error, 'create address');
  }
}
