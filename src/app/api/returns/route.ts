/**
 * Returns API Route / Qaytarmalar API Route
 * Handle return request CRUD operations / Qaytarma sorğusu CRUD əməliyyatlarını idarə et
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/middleware';
import { successResponse, badRequestResponse } from '@/lib/api/response';
import { handleApiError } from '@/lib/api/error-handler';
import {
  getUserReturnRequests,
  createReturnRequest,
  CreateReturnRequestData,
} from '@/lib/returns/return-request';

/**
 * GET /api/returns
 * Get user return requests / İstifadəçi qaytarma sorğularını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;
    const returnRequests = await getUserReturnRequests(user.id);

    return successResponse(returnRequests);
  } catch (error) {
    return handleApiError(error, 'get return requests');
  }
}

/**
 * POST /api/returns
 * Create return request / Qaytarma sorğusu yarat
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
    if (!body.orderId || !body.reason || !body.refundMethod) {
      return badRequestResponse('Missing required fields / Tələb olunan sahələr çatışmır');
    }

    const returnRequestData: CreateReturnRequestData = {
      orderId: body.orderId,
      orderItemId: body.orderItemId,
      userId: user.id,
      reason: body.reason,
      description: body.description,
      quantity: body.quantity || 1,
      refundMethod: body.refundMethod,
      damagePhotos: body.damagePhotos || [],
    };

    const returnRequest = await createReturnRequest(returnRequestData);

    return successResponse(returnRequest);
  } catch (error) {
    return handleApiError(error, 'create return request');
  }
}

