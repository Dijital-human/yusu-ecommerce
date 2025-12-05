/**
 * Flash Sale Details API Route / Flash Satış Detalları API Route-u
 * Handles individual flash sale operations / Fərdi flash satış əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { getFlashSaleById } from "@/lib/db/flash-sales";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { getWriteClient } from "@/lib/db/query-client";

/**
 * GET /api/deals/flash-sales/[id] - Get flash sale details / Flash satış detallarını al
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flashSale = await getFlashSaleById(params.id);

    if (!flashSale) {
      return NextResponse.json(
        { error: "Flash sale not found / Flash satış tapılmadı" },
        { status: 404 }
      );
    }

    return successResponse({ flashSale });
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch flash sale / Flash satışı gətirmək mümkün olmadı");
  }
}

/**
 * PUT /api/deals/flash-sales/[id] - Update flash sale (admin only) / Flash satışı yenilə (yalnız admin)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updateData: any = {};

    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.discount !== undefined) updateData.discount = Number(body.discount);
    if (body.productIds) updateData.productIds = body.productIds;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const writeClient = await getWriteClient();
    const flashSale = await writeClient.flashSale.update({
      where: {
        id: params.id,
      },
      data: updateData,
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
    return handleApiError(error, "Failed to update flash sale / Flash satışı yeniləmək mümkün olmadı");
  }
}

/**
 * DELETE /api/deals/flash-sales/[id] - Delete flash sale (admin only) / Flash satışı sil (yalnız admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check admin role / Admin rolunu yoxla
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const writeClient = await getWriteClient();
    await writeClient.flashSale.delete({
      where: {
        id: params.id,
      },
    });

    return successResponse({ message: "Flash sale deleted / Flash satış silindi" });
  } catch (error: any) {
    return handleApiError(error, "Failed to delete flash sale / Flash satışı silmək mümkün olmadı");
  }
}

