/**
 * Retargeting API Route / Retargeting API Route-u
 * Provides retargeting data for abandoned carts, wishlists, and product catalogs
 * Tərk edilmiş səbətlər, istək siyahıları və məhsul kataloqları üçün retargeting məlumatları təmin edir
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  getAbandonedCartProducts,
  getWishlistProducts,
  generateFacebookCatalogFeed,
  generateGoogleCatalogFeed,
} from "@/lib/marketing/dynamic-ads";
import { prisma } from "@/lib/db";
import { parsePrice } from "@/lib/utils/price-helpers";

/**
 * GET /api/marketing/retargeting/abandoned-cart - Get abandoned cart products / Tərk edilmiş səbət məhsullarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "abandoned-cart";
    const hoursThreshold = parseInt(searchParams.get("hoursThreshold") || "24");
    const format = searchParams.get("format") || "json"; // json, facebook, google

    if (type === "abandoned-cart") {
      const products = await getAbandonedCartProducts(user.id, hoursThreshold);

      if (format === "facebook") {
        const feed = generateFacebookCatalogFeed(products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          price: p.price,
          image: p.image,
        })));
        return new Response(feed, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="facebook_catalog.csv"',
          },
        });
      }

      if (format === "google") {
        const feed = generateGoogleCatalogFeed(products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          price: p.price,
          image: p.image,
        })));
        return new Response(feed, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="google_catalog.xml"',
          },
        });
      }

      return successResponse({ products });
    }

    if (type === "wishlist") {
      const products = await getWishlistProducts(user.id);

      if (format === "facebook") {
        const feed = generateFacebookCatalogFeed(products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          price: p.price,
          image: p.image,
        })));
        return new Response(feed, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="facebook_wishlist_catalog.csv"',
          },
        });
      }

      if (format === "google") {
        const feed = generateGoogleCatalogFeed(products.map(p => ({
          productId: p.productId,
          productName: p.productName,
          price: p.price,
          image: p.image,
        })));
        return new Response(feed, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="google_wishlist_catalog.xml"',
          },
        });
      }

      return successResponse({ products });
    }

    if (type === "catalog") {
      // Get all active products / Bütün aktiv məhsulları al
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          isPublished: true,
        },
        include: {
          category: true,
        },
        take: 1000, // Limit for catalog feed / Kataloq feed üçün limit
      });

      const catalogProducts = products.map(p => ({
        productId: p.id,
        productName: p.name,
        price: parsePrice(p.price),
        image: Array.isArray(p.images) 
          ? p.images[0] || ''
          : typeof p.images === 'string'
          ? p.images.split(',')[0] || ''
          : '',
        description: p.description,
        category: p.category.name,
        availability: p.stock > 0 ? 'in stock' : 'out of stock',
      }));

      if (format === "facebook") {
        const feed = generateFacebookCatalogFeed(catalogProducts);
        return new Response(feed, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="facebook_full_catalog.csv"',
          },
        });
      }

      if (format === "google") {
        const feed = generateGoogleCatalogFeed(catalogProducts);
        return new Response(feed, {
          headers: {
            'Content-Type': 'application/xml',
            'Content-Disposition': 'attachment; filename="google_full_catalog.xml"',
          },
        });
      }

      return successResponse({ products: catalogProducts });
    }

    return badRequestResponse("Invalid type parameter. Use 'abandoned-cart', 'wishlist', or 'catalog'");
  } catch (error) {
    return handleApiError(error, "get retargeting data");
  }
}

