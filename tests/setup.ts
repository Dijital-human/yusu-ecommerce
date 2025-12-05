/**
 * Integration Test Setup / Integration Test Quraşdırması
 * Sets up test environment for integration tests
 * Integration testlər üçün test mühitini quraşdırır
 */

import { PrismaClient } from '@prisma/client';

// Test database URL / Test veritabanı URL-i
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL or DATABASE_URL environment variable is required');
}

// Create test Prisma client / Test Prisma client yarat
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: TEST_DATABASE_URL,
    },
  },
});

/**
 * Clean up test data / Test məlumatlarını təmizlə
 */
export async function cleanupTestData(): Promise<void> {
  // Delete test data in reverse order of dependencies / Asılılıqların tərs sırası ilə test məlumatlarını sil
  await testPrisma.cart_items.deleteMany({});
  await testPrisma.order_items.deleteMany({});
  await testPrisma.orders.deleteMany({});
  await testPrisma.reviews.deleteMany({});
  await testPrisma.products.deleteMany({});
  await testPrisma.categories.deleteMany({});
  await testPrisma.users.deleteMany({});
}

/**
 * Seed test data / Test məlumatlarını yarat
 */
export async function seedTestData(): Promise<void> {
  // Create test user / Test istifadəçisi yarat
  const testUser = await testPrisma.users.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'CUSTOMER',
      emailVerified: true,
    },
  });

  // Create test category / Test kateqoriyası yarat
  const testCategory = await testPrisma.categories.upsert({
    where: { id: 'test-category-1' },
    update: {},
    create: {
      id: 'test-category-1',
      name: 'Test Category',
      slug: 'test-category',
    },
  });

  // Create test seller / Test satıcı yarat
  const testSeller = await testPrisma.users.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      name: 'Test Seller',
      role: 'SELLER',
      emailVerified: true,
      isApproved: true,
    },
  });

  // Create test product / Test məhsul yarat
  const testProduct = await testPrisma.products.upsert({
    where: { id: 'test-product-1' },
    update: {},
    create: {
      id: 'test-product-1',
      name: 'Test Product',
      description: 'Test product description',
      price: 99.99,
      stock: 10,
      categoryId: testCategory.id,
      sellerId: testSeller.id,
      isActive: true,
      images: '[]',
    },
  });

  return {
    user: testUser,
    category: testCategory,
    seller: testSeller,
    product: testProduct,
  };
}

/**
 * Close test database connection / Test veritabanı bağlantısını bağla
 */
export async function closeTestDatabase(): Promise<void> {
  await testPrisma.$disconnect();
}

