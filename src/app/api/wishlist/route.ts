/**
 * Wishlist API Route / İstək Siyahısı API Route-u
 * This file handles wishlist operations (GET, POST, DELETE)
 * Bu fayl istək siyahısı əməliyyatlarını idarə edir (GET, POST, DELETE)
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { validateProductId } from "@/lib/api/validators";
import { getWishlistItems, addToWishlist, removeFromWishlist } from "@/services/wishlist.service";

// GET /api/wishlist - Get user's wishlist / İstifadəçinin istək siyahısını əldə et
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    // Get wishlist items using service layer / Service layer istifadə edərək istək siyahısı elementlərini al
    const wishlistItems = await getWishlistItems(user.id);

    return successResponse(wishlistItems);
  } catch (error) {
    return handleApiError(error, "fetch wishlist");
  }
}

// POST /api/wishlist - Add item to wishlist / İstək siyahısına element əlavə et
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const body = await request.json();
    const { productId } = body;

    // Validate product ID using helper / Helper ilə məhsul ID-ni yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    // Add item to wishlist using service layer / Service layer istifadə edərək istək siyahısına element əlavə et
    const newItem = await addToWishlist(user.id, validatedProductId);

    return successResponse(newItem, "Item added to wishlist / Element istək siyahısına əlavə edildi");
  } catch (error: any) {
    if (error.message?.includes("already in wishlist") || error.message?.includes("artıq istək siyahısındadır")) {
      return badRequestResponse(error.message);
    }
    if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
      return notFoundResponse("Product");
    }
    return handleApiError(error, "add to wishlist");
  }
}

// DELETE /api/wishlist - Remove item from wishlist / İstək siyahısından element çıxar
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    // Validate product ID using helper / Helper ilə məhsul ID-ni yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    // Remove item from wishlist using service layer / Service layer istifadə edərək istək siyahısından element çıxar
    await removeFromWishlist(user.id, validatedProductId);

    return successResponse(null, "Item removed from wishlist / Element istək siyahısından çıxarıldı");
  } catch (error: any) {
    if (error.message?.includes("not found") || error.message?.includes("tapılmadı")) {
      return notFoundResponse("Wishlist item");
    }
    return handleApiError(error, "delete from wishlist");
  }
}

