/**
 * Product Comparison API / Məhsul Müqayisəsi API
 * Compare multiple products
 * Bir neçə məhsulu müqayisə et
 */

import { NextRequest, NextResponse } from "next/server";
import { compareProducts, getCategoryComparisonAttributes } from "@/lib/comparison/product-comparison";
import { logger } from "@/lib/utils/logger";

/**
 * POST - Compare products / Məhsulları müqayisə et
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds)) {
      return NextResponse.json(
        { error: "Product IDs are required / Məhsul ID-ləri tələb olunur" },
        { status: 400 }
      );
    }

    if (productIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 products are required / Ən azı 2 məhsul tələb olunur" },
        { status: 400 }
      );
    }

    if (productIds.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 products can be compared / Maksimum 4 məhsul müqayisə edilə bilər" },
        { status: 400 }
      );
    }

    const result = await compareProducts(productIds);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to compare products / Məhsulları müqayisə etmək uğursuz oldu" },
        { status: 500 }
      );
    }

    logger.info("Products compared / Məhsullar müqayisə edildi", {
      productCount: productIds.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Failed to compare products / Məhsulları müqayisə etmək uğursuz oldu", error);
    return NextResponse.json(
      { error: "Failed to compare products / Məhsulları müqayisə etmək uğursuz oldu" },
      { status: 500 }
    );
  }
}

/**
 * GET - Get comparison attributes for category / Kateqoriya üçün müqayisə atributlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required / Kateqoriya ID-si tələb olunur" },
        { status: 400 }
      );
    }

    const attributes = await getCategoryComparisonAttributes(categoryId);

    return NextResponse.json({ attributes });
  } catch (error) {
    logger.error("Failed to get comparison attributes / Müqayisə atributlarını almaq uğursuz oldu", error);
    return NextResponse.json(
      { error: "Failed to get comparison attributes / Müqayisə atributlarını almaq uğursuz oldu" },
      { status: 500 }
    );
  }
}

