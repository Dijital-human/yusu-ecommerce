/**
 * Cart Service / Səbət Xidməti
 * Business logic for cart operations
 * Səbət əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { cartInclude } from "@/lib/db/selectors";
import { validateProductId, validateQuantity } from "@/lib/api/validators";
import { getProductById } from "@/lib/db/queries/product-queries";
import { logger } from "@/lib/utils/logger";

/**
 * Get user's cart items / İstifadəçinin səbət elementlərini al
 */
export async function getCartItems(userId: string) {
  const cartItems = await prisma.cartItem.findMany({
    where: {
      userId,
    },
    include: cartInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return cartItems;
}

/**
 * Add item to cart / Səbətə element əlavə et
 */
export async function addToCart(userId: string, productId: string, quantity: number = 1) {
  // Validate input / Girişi yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  const validatedQuantity = validateQuantity(quantity);
  if (validatedQuantity instanceof Response) {
    throw new Error("Invalid quantity / Etibarsız miqdar");
  }

  // Check product exists and get product data using query helper / Query helper ilə məhsulun mövcud olduğunu yoxla və məhsul məlumatlarını al
  const productResult = await getProductById(validatedProductId);
  if (productResult instanceof Response) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  const { product } = productResult;

  // Check product stock / Məhsul stokunu yoxla
  if (product.stock < validatedQuantity) {
    throw new Error("Insufficient stock / Kifayət qədər stok yoxdur");
  }

  // Check if item already exists in cart / Elementin artıq səbətdə mövcud olduğunu yoxla
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  if (existingItem) {
    // Update existing item quantity / Mövcud elementin miqdarını yenilə
    const newQuantity = existingItem.quantity + validatedQuantity;
    
    if (product.stock < newQuantity) {
      throw new Error("Insufficient stock for requested quantity / Tələb olunan miqdar üçün kifayət qədər stok yoxdur");
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId: validatedProductId,
        },
      },
      data: {
        quantity: newQuantity,
      },
      include: cartInclude,
    });

    return updatedItem;
  } else {
    // Create new cart item / Yeni səbət elementi yarat
    const newItem = await prisma.cartItem.create({
      data: {
        userId,
        productId: validatedProductId,
        quantity: validatedQuantity,
      },
      include: cartInclude,
    });

    return newItem;
  }
}

/**
 * Update cart item quantity / Səbət elementinin miqdarını yenilə
 */
export async function updateCartItem(userId: string, productId: string, quantity: number) {
  // Validate input / Girişi yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  const validatedQuantity = validateQuantity(quantity, 0); // Allow 0 for deletion
  if (validatedQuantity instanceof Response) {
    throw new Error("Invalid quantity / Etibarsız miqdar");
  }

  // Check if item exists in cart / Elementin səbətdə mövcud olduğunu yoxla
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  if (!existingItem) {
    throw new Error("Cart item not found / Səbət elementi tapılmadı");
  }

  if (validatedQuantity === 0) {
    // Remove item from cart / Elementi səbətdən çıxar
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId: validatedProductId,
        },
      },
    });

    return null;
  }

  // Check product exists and get product data using query helper / Query helper ilə məhsulun mövcud olduğunu yoxla və məhsul məlumatlarını al
  const productResult = await getProductById(validatedProductId);
  if (productResult instanceof Response) {
    throw new Error("Product not found / Məhsul tapılmadı");
  }

  const { product } = productResult;

  // Check product stock / Məhsul stokunu yoxla
  if (product.stock < validatedQuantity) {
    throw new Error("Insufficient stock / Kifayət qədər stok yoxdur");
  }

  // Update item quantity / Elementin miqdarını yenilə
  const updatedItem = await prisma.cartItem.update({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
    data: {
      quantity: validatedQuantity,
    },
    include: cartInclude,
  });

  return updatedItem;
}

/**
 * Remove item from cart / Səbətdən element çıxar
 */
export async function removeFromCart(userId: string, productId: string) {
  // Validate product ID / Məhsul ID-ni yoxla
  const validatedProductId = validateProductId(productId);
  if (validatedProductId instanceof Response) {
    throw new Error("Invalid product ID / Etibarsız məhsul ID");
  }

  // Check if item exists in cart / Elementin səbətdə mövcud olduğunu yoxla
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });

  if (!existingItem) {
    throw new Error("Cart item not found / Səbət elementi tapılmadı");
  }

  // Remove item / Elementi çıxar
  await prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId: validatedProductId,
      },
    },
  });
}

/**
 * Clear entire cart / Bütün səbəti təmizlə
 */
export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({
    where: {
      userId,
    },
  });
}


