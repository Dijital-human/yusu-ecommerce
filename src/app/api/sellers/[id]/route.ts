/**
 * Seller Profile API / Satıcı Profil API
 * GET /api/sellers/[id] - Get seller profile
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get seller with stats / Statistikalarla birlikdə satıcını al
    const seller = await db.users.findUnique({
      where: { 
        id,
        role: { in: ["SELLER", "SUPER_SELLER"] },
        isApprovedByAdmin: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        storeName: true,
        storeDescription: true,
        storeLogo: true,
        storeBanner: true,
        storeSlug: true,
        businessAddress: true,
        businessPhone: true,
        _count: {
          select: {
            products: {
              where: {
                isApproved: true,
                isPublished: true,
                isActive: true,
              }
            }
          }
        }
      },
    });

    if (!seller) {
      return NextResponse.json(
        { 
          error: "Seller not found / Satıcı tapılmadı",
          errorAz: "Satıcı tapılmadı"
        },
        { status: 404 }
      );
    }

    // Get seller rating from reviews / Rəylərdən satıcı reytinqini al
    const reviews = await db.review.aggregate({
      where: {
        product: {
          sellerId: id,
        }
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    // Get total sales count / Ümumi satış sayını al
    const salesCount = await db.orderItem.count({
      where: {
        product: {
          sellerId: id
        },
        order: {
          status: { in: ["DELIVERED", "COMPLETED"] }
        }
      }
    });

    // Format response / Cavabı formatla
    const sellerProfile = {
      id: seller.id,
      name: seller.storeName || seller.name,
      description: seller.storeDescription,
      logo: seller.storeLogo || seller.image,
      banner: seller.storeBanner,
      slug: seller.storeSlug,
      memberSince: seller.createdAt,
      stats: {
        productCount: seller._count.products,
        averageRating: reviews._avg.rating || 0,
        reviewCount: reviews._count.rating || 0,
        salesCount: salesCount,
      },
      contact: {
        address: seller.businessAddress,
        phone: seller.businessPhone,
      }
    };

    return NextResponse.json({
      success: true,
      seller: sellerProfile
    });

  } catch (error) {
    console.error("Error fetching seller profile:", error);
    return NextResponse.json(
      { 
        error: "Internal server error / Daxili server xətası",
        errorAz: "Daxili server xətası"
      },
      { status: 500 }
    );
  }
}

