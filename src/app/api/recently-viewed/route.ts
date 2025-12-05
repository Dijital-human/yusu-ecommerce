/**
 * Recently Viewed Products API Route / Son Baxılan Məhsullar API Route
 * Manage recently viewed products / Son baxılan məhsulları idarə et
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  getRecentlyViewed,
  addRecentlyViewed,
  clearRecentlyViewed,
} from "@/lib/db/recently-viewed";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const products = await getRecentlyViewed(session.user.id, limit);

    return NextResponse.json({
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("Error fetching recently viewed products:", error);
    return NextResponse.json(
      { error: "Failed to fetch recently viewed products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await addRecentlyViewed(session.user.id, productId);

    return NextResponse.json({
      success: true,
      message: "Product added to recently viewed",
    });
  } catch (error) {
    console.error("Error adding recently viewed product:", error);
    return NextResponse.json(
      { error: "Failed to add product to recently viewed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      // Remove specific product / Xüsusi məhsulu çıxar
      const { removeRecentlyViewed } = await import("@/lib/db/recently-viewed");
      await removeRecentlyViewed(session.user.id, productId);
    } else {
      // Clear all / Hamısını təmizlə
      await clearRecentlyViewed(session.user.id);
    }

    return NextResponse.json({
      success: true,
      message: productId
        ? "Product removed from recently viewed"
        : "All recently viewed products cleared",
    });
  } catch (error) {
    console.error("Error removing recently viewed product:", error);
    return NextResponse.json(
      { error: "Failed to remove product from recently viewed" },
      { status: 500 }
    );
  }
}

