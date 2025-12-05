/**
 * Dynamic Product Ads Service / Dinamik Məhsul Reklamları Xidməti
 * Provides dynamic product ads functionality for retargeting
 * Retargeting üçün dinamik məhsul reklamları funksionallığı təmin edir
 */

import { prisma } from "@/lib/db";
import { parsePrice } from "@/lib/utils/price-helpers";
import { logger } from "@/lib/utils/logger";

export interface AbandonedCartProduct {
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity: number;
  userId: string;
  addedAt: Date;
}

export interface WishlistProduct {
  productId: string;
  productName: string;
  price: number;
  image: string;
  userId: string;
  addedAt: Date;
}

export interface RecentlyViewedProduct {
  productId: string;
  productName: string;
  price: number;
  image: string;
  userId: string;
  viewedAt: Date;
}

/**
 * Get abandoned cart products for a user / İstifadəçi üçün tərk edilmiş səbət məhsullarını al
 */
export async function getAbandonedCartProducts(
  userId: string,
  hoursThreshold: number = 24
): Promise<AbandonedCartProduct[]> {
  try {
    const threshold = new Date(Date.now() - hoursThreshold * 60 * 60 * 1000);

    // Get cart items that haven't been ordered / Sifariş verilməmiş səbət elementlərini al
    const cartItems = await prisma.cart_items.findMany({
      where: {
        userId,
        createdAt: {
          lte: threshold,
        },
      },
      include: {
        products: true,
      },
    });

    // Get user's orders to filter out items that were purchased / Satın alınmış elementləri filtrləmək üçün istifadəçinin sifarişlərini al
    const orders = await prisma.orders.findMany({
      where: {
        customerId: userId,
        createdAt: {
          gte: threshold,
        },
        status: {
          notIn: ['CANCELLED', 'PAYMENT_FAILED'],
        },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    // Create set of ordered product IDs / Sifariş verilmiş məhsul ID-lərinin çoxluğunu yarat
    const orderedProductIds = new Set<string>();
    orders.forEach((order: any) => {
      order.order_items.forEach((item: any) => {
        orderedProductIds.add(item.productId);
      });
    });

    // Filter out items that were ordered / Sifariş verilmiş elementləri filtrlə
    const abandonedProducts = cartItems
      .filter((item: any) => !orderedProductIds.has(item.productId))
      .map((item: any) => ({
        productId: item.productId,
        productName: item.products.name,
        price: parsePrice(item.products.price),
        image: Array.isArray(item.products.images) 
          ? item.products.images[0] || ''
          : typeof item.products.images === 'string'
          ? item.products.images.split(',')[0] || ''
          : '',
        quantity: item.quantity,
        userId: item.userId,
        addedAt: item.createdAt,
      }));

    return abandonedProducts;
  } catch (error) {
    logger.error('Failed to get abandoned cart products / Tərk edilmiş səbət məhsullarını almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Get wishlist products for a user / İstifadəçi üçün istək siyahısı məhsullarını al
 */
export async function getWishlistProducts(userId: string): Promise<WishlistProduct[]> {
  try {
    const wishlistItems = await prisma.wishlist_items.findMany({
      where: {
        userId,
      },
      include: {
        products: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return wishlistItems.map((item: any) => ({
      productId: item.productId,
      productName: item.products.name,
      price: parsePrice(item.products.price),
      image: Array.isArray(item.products.images) 
        ? item.products.images[0] || ''
        : typeof item.products.images === 'string'
        ? item.products.images.split(',')[0] || ''
        : '',
      userId: item.userId,
      addedAt: item.createdAt,
    }));
  } catch (error) {
    logger.error('Failed to get wishlist products / İstək siyahısı məhsullarını almaq uğursuz oldu', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Generate product catalog feed for Facebook / Facebook üçün məhsul kataloq feed-i yarat
 */
export function generateFacebookCatalogFeed(products: Array<{
  productId: string;
  productName: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  availability?: string;
}>): string {
  // Facebook Catalog Feed format (CSV) / Facebook Kataloq Feed formatı (CSV)
  const headers = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand'];
  const rows = products.map(product => [
    product.productId,
    product.productName,
    product.description || '',
    product.availability || 'in stock',
    'new',
    `${product.price} AZN`,
    `${process.env.NEXT_PUBLIC_APP_URL || 'https://ulustore.com'}/products/${product.productId}`,
    product.image,
    'Yusu', // Brand name / Brend adı
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csv;
}

/**
 * Generate product catalog feed for Google / Google üçün məhsul kataloq feed-i yarat
 */
export function generateGoogleCatalogFeed(products: Array<{
  productId: string;
  productName: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  availability?: string;
}>): string {
  // Google Merchant Center Feed format (XML) / Google Merchant Center Feed formatı (XML)
  const items = products.map(product => `
    <item>
      <g:id>${product.productId}</g:id>
      <g:title>${escapeXml(product.productName)}</g:title>
      <g:description>${escapeXml(product.description || '')}</g:description>
      <g:link>${process.env.NEXT_PUBLIC_APP_URL || 'https://ulustore.com'}/products/${product.productId}</g:link>
      <g:image_link>${product.image}</g:image_link>
      <g:availability>${product.availability || 'in stock'}</g:availability>
      <g:price>${product.price} AZN</g:price>
      <g:condition>new</g:condition>
      <g:brand>Yusu</g:brand>
      ${product.category ? `<g:product_type>${escapeXml(product.category)}</g:product_type>` : ''}
    </item>
  `).join('');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ulustore.com';
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Ulustore Products</title>
    <link>${baseUrl}</link>
    <description>Ulustore Product Catalog</description>
    ${items}
  </channel>
</rss>`;
}

/**
 * Escape XML special characters / XML xüsusi simvollarını escape et
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

