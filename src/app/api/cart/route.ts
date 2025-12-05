/**
 * Cart API Route / Səbət API Route-u
 * Backward compatibility: Returns empty cart or redirects to v1 API if exists
 * Geri uyğunluq: Boş səbət qaytarır və ya varsa v1 API-yə yönləndirir
 */

import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/lib/api/response";

// GET /api/cart - Return empty cart / Boş səbət qaytar
export async function GET(request: NextRequest) {
  // Return empty cart array to avoid redirect loop / Redirect loop-u qarşısını almaq üçün boş səbət array-i qaytar
  // CartContext expects an array, not an object / CartContext array gözləyir, obyekt deyil
  return successResponse([]);
}

// POST /api/cart - Return error / Xəta qaytar
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "Please use /api/v1/cart endpoint / Zəhmət olmasa /api/v1/cart endpoint-i istifadə edin" },
    { status: 400 }
  );
}

// PUT /api/cart - Return error / Xəta qaytar
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: "Please use /api/v1/cart endpoint / Zəhmət olmasa /api/v1/cart endpoint-i istifadə edin" },
    { status: 400 }
  );
}

// DELETE /api/cart - Return error / Xəta qaytar
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: "Please use /api/v1/cart endpoint / Zəhmət olmasa /api/v1/cart endpoint-i istifadə edin" },
    { status: 400 }
  );
}
