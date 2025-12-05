/**
 * Flash Sales API Route / Flash Satışlar API Route-u
 * Handles flash sales operations / Flash satışlar əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getActiveFlashSales, getUpcomingFlashSales } from "@/lib/db/flash-sales";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";

/**
 * GET /api/deals/flash-sales - Get active and upcoming flash sales / Aktiv və gələcək flash satışları al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "active"; // "active" | "upcoming" | "all"
    const limit = parseInt(searchParams.get("limit") || "20");

    let flashSales = [];

    if (type === "active") {
      flashSales = await getActiveFlashSales(limit);
    } else if (type === "upcoming") {
      flashSales = await getUpcomingFlashSales(limit);
    } else {
      // Get both active and upcoming / Həm aktiv, həm də gələcək olanları al
      const [active, upcoming] = await Promise.all([
        getActiveFlashSales(limit),
        getUpcomingFlashSales(limit),
      ]);
      flashSales = [...active, ...upcoming];
    }

    return successResponse({
      flashSales,
      count: flashSales.length,
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch flash sales / Flash satışları gətirmək mümkün olmadı");
  }
}

/**
 * POST /api/deals/flash-sales - Create new flash sale (admin only) / Yeni flash satış yarat (yalnız admin)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check admin role / Admin rolunu yoxla
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, discount, productIds, startDate, endDate } = body;

    // Validate input / Girişi yoxla
    if (!title || !discount || !productIds || !Array.isArray(productIds) || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields / Tələb olunan sahələr çatışmır" },
        { status: 400 }
      );
    }

    const writeClient = await getWriteClient();
    const flashSale = await writeClient.flashSale.create({
      data: {
        title,
        description,
        discount: Number(discount),
        productIds,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: true,
      },
    });

    return successResponse({
      flashSale: {
        id: flashSale.id,
        title: flashSale.title,
        description: flashSale.description || undefined,
        discount: Number(flashSale.discount),
        productIds: flashSale.productIds,
        startDate: flashSale.startDate,
        endDate: flashSale.endDate,
        isActive: flashSale.isActive,
        createdAt: flashSale.createdAt,
        updatedAt: flashSale.updatedAt,
      },
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to create flash sale / Flash satış yaratmaq mümkün olmadı");
  }
}

