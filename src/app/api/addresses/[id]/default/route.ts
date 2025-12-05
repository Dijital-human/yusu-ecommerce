/**
 * Set Default Address API Route / Default Ünvan Təyin Et API Route
 * Set address as default / Ünvanı default olaraq təyin et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, notFoundResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import { setDefaultAddress } from '@/lib/db/user-addresses';

/**
 * PUT /api/addresses/[id]/default
 * Set address as default / Ünvanı default olaraq təyin et
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

    const address = await setDefaultAddress(addressId, user.id);

    if (!address) {
      return notFoundResponse('Address');
    }

    return successResponse(address);
  } catch (error) {
    return handleApiError(error, 'set default address');
  }
}

