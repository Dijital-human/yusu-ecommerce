/**
 * Cart API Route v1 / Səbət API Route-u v1
 * Handles cart operations with real-time updates / Real-time yeniləmələrlə səbət əməliyyatlarını idarə edir
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, errorResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { validateProductId, validateQuantity } from "@/lib/api/validators";
import { parsePrice } from "@/lib/utils/price-helpers";
import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/services/cart.service";
import { emitCartUpdate } from "@/lib/realtime/realtime-service";
import { logger } from "@/lib/utils/logger";
import { prisma } from "@/lib/db";

/**
 * GET /api/v1/cart - Get user's cart / İstifadəçinin səbətini al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;
    const items = await getCartItems(user.id);

    // Calculate totals using parsePrice helper / parsePrice helper ilə ümumi məbləğləri hesabla
    const total = items.reduce((sum, item) => {
      return sum + parsePrice(item.product.price) * item.quantity;
    }, 0);

    const cartData = {
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          images: item.product.images,
        },
        quantity: item.quantity,
        price: parsePrice(item.product.price),
      })),
      total,
      count: items.length,
    };

    return successResponse(cartData);
  } catch (error) {
    return handleApiError(error, "get cart");
  }
}

/**
 * POST /api/v1/cart - Add item to cart / Səbətə məhsul əlavə et
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Validate product ID using helper / Helper ilə məhsul ID-ni yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    // Validate quantity using helper / Helper ilə miqdarı yoxla
    const validatedQuantity = validateQuantity(quantity);
    if (validatedQuantity instanceof Response) {
      return validatedQuantity;
    }

    const item = await addToCart(user.id, validatedProductId, validatedQuantity);

    // Get updated cart / Yenilənmiş səbəti al
    const items = await getCartItems(user.id);
    const total = items.reduce((sum, item) => {
      return sum + parsePrice(item.product.price) * item.quantity;
    }, 0);

    // Emit real-time cart update / Real-time səbət yeniləməsini emit et
    emitCartUpdate(user.id, {
      itemCount: items.length,
      total,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });

    return successResponse({
      item,
      cart: {
        items,
        total,
        count: items.length,
      },
    });
  } catch (error) {
    return handleApiError(error, "add to cart");
  }
}

/**
 * PUT /api/v1/cart - Update cart item / Səbət elementini yenilə
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;
    const body = await request.json();
    const { productId, quantity } = body;

    // Validate product ID using helper / Helper ilə məhsul ID-ni yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    // Validate quantity using helper / Helper ilə miqdarı yoxla
    if (quantity === undefined || quantity === null) {
      return errorResponse(
        "Quantity is required / Miqdar tələb olunur",
        400
      );
    }
    const validatedQuantity = validateQuantity(quantity);
    if (validatedQuantity instanceof Response) {
      return validatedQuantity;
    }

    const item = await updateCartItem(user.id, validatedProductId, validatedQuantity);

    // Get updated cart / Yenilənmiş səbəti al
    const items = await getCartItems(user.id);
    const total = items.reduce((sum, item) => {
      return sum + parsePrice(item.product.price) * item.quantity;
    }, 0);

    // Emit real-time cart update / Real-time səbət yeniləməsini emit et
    emitCartUpdate(user.id, {
      itemCount: items.length,
      total,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });

    return successResponse({
      item,
      cart: {
        items,
        total,
        count: items.length,
      },
    });
  } catch (error) {
    return handleApiError(error, "update cart item");
  }
}

/**
 * DELETE /api/v1/cart - Remove item from cart or clear cart / Səbətdən element çıxar və ya səbəti təmizlə
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const clearAll = searchParams.get("clear") === "true";

    if (clearAll) {
      // Clear entire cart / Bütün səbəti təmizlə
      await clearCart(user.id);

      // Emit real-time cart update / Real-time səbət yeniləməsini emit et
      emitCartUpdate(user.id, {
        itemCount: 0,
        total: 0,
        items: [],
      });

      return successResponse({ message: "Cart cleared / Səbət təmizləndi" });
    }

    // Validate product ID using helper / Helper ilə məhsul ID-ni yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    await removeFromCart(user.id, validatedProductId);

    // Get updated cart / Yenilənmiş səbəti al
    const items = await getCartItems(user.id);
    const total = items.reduce((sum, item) => {
      return sum + parsePrice(item.product.price) * item.quantity;
    }, 0);

    // Emit real-time cart update / Real-time səbət yeniləməsini emit et
    emitCartUpdate(user.id, {
      itemCount: items.length,
      total,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    });

    return successResponse({
      message: "Item removed from cart / Element səbətdən çıxarıldı",
      cart: {
        items,
        total,
        count: items.length,
      },
    });
  } catch (error) {
    return handleApiError(error, "remove from cart");
  }
}
