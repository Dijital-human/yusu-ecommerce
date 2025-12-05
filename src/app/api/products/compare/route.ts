/**
 * Product Comparison API Route / Məhsul Müqayisəsi API Route
 * Batch fetch products for comparison / Müqayisə üçün məhsulları batch şəkildə gətir
 */

import { NextRequest, NextResponse } from "next/server";
import { batchGetProducts } from "@/lib/db/queries/batch-queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      return NextResponse.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    const productIds = ids.split(",").filter((id) => id.trim());

    if (productIds.length === 0 || productIds.length > 4) {
      return NextResponse.json(
        { error: "Please provide 1-4 product IDs" },
        { status: 400 }
      );
    }

    // Fetch products using batch query helper / Batch query helper ilə məhsulları al
    const products = await batchGetProducts(productIds, false);
    
    // Filter only active, published, and approved products / Yalnız aktiv, yayımlanmış və təsdiqlənmiş məhsulları filtrlə
    const filteredProducts = products.filter((p: any) => 
      p.isActive && p.isPublished && p.isApproved
    );
    
    // Transform to comparison format / Müqayisə formatına transform et
    const productsForComparison = filteredProducts.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      images: product.images,
      stock: product.stock,
      description: product.description,
      category: product.category,
      seller: product.seller,
      averageRating: product.rating,
      reviewCount: product.reviewCount,
    }));
    
    return NextResponse.json({
      products: productsForComparison,
      count: productsForComparison.length,
    });
  } catch (error) {
    console.error("Error fetching products for comparison:", error);
    return NextResponse.json(
      { error: "Failed to fetch products for comparison" },
      { status: 500 }
    );
  }
}
