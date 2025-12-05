/**
 * Wishlist Service / İstək Siyahısı Xidməti
 * Business logic for wishlist operations
 * İstək siyahısı əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { wishlistInclude } from "@/lib/db/selectors";
import { validateProductId } from "@/lib/api/validators";
import { getProductById } from "@/lib/db/queries/product-queries";

/**
 * Get user's wishlist items / İstifadəçinin istək siyahısı elementlərini al
 */
export async function getWishlistItems(userId: string) {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: {
      userId,
    },
    include: wishlistInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return wishlistItems;
}

/**
 * Add item to wishlist / İstək siyahısına element əlavə et
 */
export async function addToWishlist(userId: string, productId: string) {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  // Check if product exists using query helper / Query helper ilə məhsulun mövcud olduğunu yoxla
  const result = await getProductById(validatedProductId);
  if (result instanceof Response) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  // Check if item already exists in wishlist / Elementin artıq istək siyahısında mövcud olduğunu yoxla
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  if (existingItem) {
    throw new Error("Product already in wishlist / Məhsul artıq istək siyahısındadır");
  }

  // Create new wishlist item / Yeni istək siyahısı elementi yarat
  const newItem = await prisma.wishlistItem.create({
    data: {
      userId,
      productId: validatedProductId,
    },
    include: wishlistInclude,
  });

  return newItem;
}

/**
 * Remove item from wishlist / İstək siyahısından element çıxar
 */
export async function removeFromWishlist(userId: string, productId: string) {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  // Check if item exists in wishlist / Elementin istək siyahısında mövcud olduğunu yoxla
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  if (!existingItem) {
    throw new Error("Wishlist item not found / İstək siyahısı elementi tapılmadı");
  }

  // Delete wishlist item / İstək siyahısı elementini sil
  await prisma.wishlistItem.delete({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });
}

/**
 * Check if product is in wishlist / Məhsulun istək siyahısında olub-olmadığını yoxla
 */
export async function isInWishlist(userId: string, productId: string): Promise<boolean> {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    return false;
  }

  const item = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  return !!item;
}

