/**
 * Address API Route (by ID) / Ünvan API Route (ID-yə görə)
 * Handle address update and delete operations / Ünvan yeniləmə və silmə əməliyyatlarını idarə et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, notFoundResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import {
  updateAddress,
  deleteAddress,
  UpdateAddressData,
} from '@/lib/db/user-addresses';

/**
 * PUT /api/addresses/[id]
 * Update address / Ünvanı yenilə
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id: addressId } = await params;
    const body = await request.json();

    const updateData: UpdateAddressData = {
      label: body.label,
      street: body.street,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
      country: body.country,
      phoneNumber: body.phoneNumber,
      latitude: body.latitude,
      longitude: body.longitude,
      isDefault: body.isDefault,
    };

    const address = await updateAddress(addressId, user.id, updateData);

    if (!address) {
      return notFoundResponse('Address');
    }

    return successResponse(address);
  } catch (error) {
    return handleApiError(error, 'update address');
  }
}

/**
 * DELETE /api/addresses/[id]
 * Delete address / Ünvanı sil
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const { id: addressId } = await params;

    await deleteAddress(addressId, user.id);

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error, 'delete address');
  }
}
