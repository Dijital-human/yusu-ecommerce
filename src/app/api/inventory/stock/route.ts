/**
 * Inventory Stock API Route / Anbar Stoku API Route-u
 * Handles stock management operations
 * Stok idarəetmə əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireSeller } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { 
  updateProductStock, 
  getAvailableStock, 
  getStockForecast, 
  getLowStockProducts 
} from "@/lib/inventory/inventory-manager";
import { validateProductId, validateQuantity } from "@/lib/api/validators";
import { getProductById, getProductsWithFilters } from "@/lib/db/queries/product-queries";

/**
 * GET /api/inventory/stock - Get stock information / Stok məlumatını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is seller or admin / İstifadəçinin satıcı və ya admin olduğunu yoxla
    const roleCheck = requireSeller(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const sellerId = searchParams.get("sellerId") || user.id;
    const forecast = searchParams.get("forecast") === "true";
    const lowStock = searchParams.get("lowStock") === "true";

    // If requesting low stock products / Əgər aşağı stoklu məhsullar soruşulursa
    if (lowStock) {
      const minStock = parseInt(searchParams.get("minStock") || "10");
      const lowStockProducts = await getLowStockProducts(sellerId, minStock);
      return successResponse(lowStockProducts);
    }

    // If requesting specific product stock / Əgər xüsusi məhsul stoku soruşulursa
    if (productId) {
      const validatedProductId = validateProductId(productId);
      if (validatedProductId instanceof Response) {
        return validatedProductId;
      }

      // Get product using query helper / Query helper istifadə edərək məhsulu al
      const productResult = await getProductById(validatedProductId);
      if (productResult instanceof Response) {
        return productResult;
      }

      const product = productResult.product || productResult;

      // Verify product belongs to seller / Məhsulun satıcıya aid olduğunu yoxla
      if (product.seller?.id !== sellerId) {
        return notFoundResponse("Product");
      }

      const productInfo = {
        id: product.id,
        name: product.name,
        stock: product.stock,
        sellerId: product.seller?.id,
      };

      const availableStock = await getAvailableStock(validatedProductId);

      const result: any = {
        productId: productInfo.id,
        productName: productInfo.name,
        currentStock: productInfo.stock,
        availableStock,
      };

      // Include forecast if requested / Əgər soruşulursa proqnozu daxil et
      if (forecast) {
        const forecastData = await getStockForecast(validatedProductId);
        if (forecastData) {
          result.forecast = forecastData;
        }
      }

      return successResponse(result);
    }

    // Get all products for seller using query helper / Query helper istifadə edərək satıcı üçün bütün məhsulları al
    const { products } = await getProductsWithFilters(
      { sellerId },
      1,
      1000 // Large limit to get all products / Bütün məhsulları almaq üçün böyük limit
    );

    const stockInfo = await Promise.all(
      products.map(async (product: { id: string; name: string; stock: number }) => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        availableStock: await getAvailableStock(product.id),
      }))
    );

    return successResponse(stockInfo);
  } catch (error) {
    return handleApiError(error, "fetch stock information");
  }
}

/**
 * PUT /api/inventory/stock - Update product stock / Məhsul stokunu yenilə
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is seller or admin / İstifadəçinin satıcı və ya admin olduğunu yoxla
    const roleCheck = requireSeller(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { productId, quantity, operation = "set", reason } = body;

    // Validate input / Girişi yoxla
    const validatedProductId = validateProductId(productId);
    if (validatedProductId instanceof Response) {
      return validatedProductId;
    }

    const validatedQuantity = validateQuantity(quantity, 0);
    if (validatedQuantity instanceof Response) {
      return validatedQuantity;
    }

    if (!['increment', 'decrement', 'set'].includes(operation)) {
      return badRequestResponse("Invalid operation. Must be 'increment', 'decrement', or 'set' / Yanlış əməliyyat. 'increment', 'decrement' və ya 'set' olmalıdır");
    }

    // Verify product belongs to seller using query helper / Query helper istifadə edərək məhsulun satıcıya aid olduğunu yoxla
    const productResult = await getProductById(validatedProductId);
    if (productResult instanceof Response) {
      return productResult;
    }

    const product = productResult.product || productResult;
    if (product.seller?.id !== user.id) {
      return notFoundResponse("Product");
    }

    // Update stock / Stoku yenilə
    const success = await updateProductStock(
      validatedProductId,
      validatedQuantity,
      operation as 'increment' | 'decrement' | 'set',
      reason
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to update stock / Stoku yeniləmək uğursuz oldu" },
        { status: 500 }
      );
    }

    // Get updated product using query helper / Query helper istifadə edərək yenilənmiş məhsulu al
    const updatedProductResult = await getProductById(validatedProductId);
    if (updatedProductResult instanceof Response) {
      return updatedProductResult;
    }

    const updatedProductData = updatedProductResult.product || updatedProductResult;
    const updatedProduct = {
      id: updatedProductData.id,
      name: updatedProductData.name,
      stock: updatedProductData.stock,
    };

    return successResponse(updatedProduct, "Stock updated successfully / Stok uğurla yeniləndi");
  } catch (error) {
    return handleApiError(error, "update stock");
  }
}

