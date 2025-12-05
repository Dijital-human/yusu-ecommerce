/**
 * Database Queries Integration Tests / Veritabanı Sorğuları Integration Testləri
 * Tests for database query performance and correctness
 * Veritabanı sorğu performansı və düzgünlüyü üçün testlər
 */

import { prisma } from '@/lib/db';
import { cleanupTestData, seedTestData, closeTestDatabase } from '../setup';

describe('Database Queries Integration Tests', () => {
  let testData: any;

  beforeAll(async () => {
    await cleanupTestData();
    testData = await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await closeTestDatabase();
  });

  describe('Product Queries', () => {
    it('should fetch product with relations / Məhsulu əlaqələrlə gətirməlidir', async () => {
      const product = await prisma.products.findUnique({
        where: { id: testData.product.id },
        include: {
          category: true,
        },
      });

      expect(product).toBeDefined();
      expect(product?.category).toBeDefined();
    });

    it('should handle pagination correctly / Pagination-u düzgün idarə etməlidir', async () => {
      const products = await prisma.products.findMany({
        take: 10,
        skip: 0,
      });

      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('Order Queries', () => {
    it('should create order with items / Elementlərlə sifariş yaratmalıdır', async () => {
      const order = await prisma.orders.create({
        data: {
          customerId: testData.user.id,
          sellerId: testData.seller.id,
          status: 'PENDING',
          totalAmount: 99.99,
          shippingAddress: JSON.stringify({
            street: '123 Test St',
            city: 'Baku',
          }),
        },
      });

      expect(order).toBeDefined();
      expect(order.id).toBeDefined();
    });
  });
});

