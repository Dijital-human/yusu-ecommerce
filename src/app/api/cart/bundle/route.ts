/**
 * Add Bundle to Cart API / Paketi Səbətə Əlavə Et API
 * Adds all products from a bundle to the cart / Paketdən bütün məhsulları səbətə əlavə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { addToCart } from "@/services/cart.service";
import { getBundleById } from "@/lib/db/product-bundles";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/utils/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const { bundleId } = await request.json();

    if (!bundleId) {
      return NextResponse.json(
        { error: "Bundle ID is required / Paket ID tələb olunur" },
        { status: 400 }
      );
    }

    // Get bundle details / Paket detallarını al
    const bundle = await getBundleById(bundleId);

    if (!bundle || !bundle.isActive) {
      return NextResponse.json(
        { error: "Bundle not found or inactive / Paket tapılmadı və ya aktiv deyil" },
        { status: 404 }
      );
    }

    // Add all bundle items to cart / Bütün paket elementlərini səbətə əlavə et
    const addedItems = [];
    const errors = [];

    for (const item of bundle.items) {
      try {
        const cartItem = await addToCart(
          session.user.id,
          item.productId,
          item.quantity
        );
        addedItems.push(cartItem);
      } catch (error: any) {
        logger.error("Error adding bundle item to cart", {
          bundleId,
          productId: item.productId,
          error: error.message,
        });
        errors.push({
          productId: item.productId,
          error: error.message,
        });
      }
    }

    if (errors.length > 0 && addedItems.length === 0) {
      return NextResponse.json(
        {
          error: "Failed to add bundle to cart / Paketi səbətə əlavə etmək mümkün olmadı",
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bundle added to cart / Paket səbətə əlavə edildi",
      addedItems,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    return handleApiError(error, "Failed to add bundle to cart / Paketi səbətə əlavə etmək mümkün olmadı");
  }
}

