/**
 * Product Bundle Details API Route / Məhsul Paketi Detalları API Route
 * Get, update, or delete a specific bundle / Xüsusi paketi al, yenilə və ya sil
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/middleware";
import { getBundleById } from "@/lib/db/product-bundles";
import { getWriteClient } from "@/lib/db/query-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const bundleId = resolvedParams.id;

    const bundle = await getBundleById(bundleId);

    if (!bundle) {
      return NextResponse.json(
        { error: "Bundle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      bundle,
    });
  } catch (error) {
    console.error("Error fetching bundle:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundle" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const resolvedParams = await params;
    const bundleId = resolvedParams.id;
    const body = await request.json();
    const { name, description, bundlePrice, discount, isActive, items } = body;

    const writeClient = await getWriteClient();
    
    // Update bundle / Paketi yenilə
    const bundle = await writeClient.productBundle.update({
      where: {
        id: bundleId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(bundlePrice && { bundlePrice }),
        ...(discount !== undefined && { discount }),
        ...(isActive !== undefined && { isActive }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: { productId: string; quantity: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      bundle,
    });
  } catch (error) {
    console.error("Error updating bundle:", error);
    return NextResponse.json(
      { error: "Failed to update bundle" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const resolvedParams = await params;
    const bundleId = resolvedParams.id;

    const writeClient = await getWriteClient();
    
    // Delete bundle / Paketi sil
    await writeClient.productBundle.delete({
      where: {
        id: bundleId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bundle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json(
      { error: "Failed to delete bundle" },
      { status: 500 }
    );
  }
}

