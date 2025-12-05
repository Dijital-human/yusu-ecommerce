/**
 * Product Bundles API Route / Məhsul Paketləri API Route
 * Manage product bundles / Məhsul paketlərini idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { requireAdmin } from "@/lib/api/middleware";
import { getActiveBundles } from "@/lib/db/product-bundles";
import { getWriteClient } from "@/lib/db/query-client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const bundles = await getActiveBundles(limit);

    return NextResponse.json({
      bundles,
      count: bundles.length,
    });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json(
      { error: "Failed to fetch bundles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const body = await request.json();
    const { name, description, bundlePrice, discount, items } = body;

    if (!name || !bundlePrice || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Name, bundle price, and items are required" },
        { status: 400 }
      );
    }

    const writeClient = await getWriteClient();
    
    // Create bundle / Paketi yarat
    const bundle = await writeClient.productBundle.create({
      data: {
        name,
        description,
        bundlePrice,
        discount,
        items: {
          create: items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
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
    console.error("Error creating bundle:", error);
    return NextResponse.json(
      { error: "Failed to create bundle" },
      { status: 500 }
    );
  }
}

