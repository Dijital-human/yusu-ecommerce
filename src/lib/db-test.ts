/**
 * Database Connection Test / Veritabanı Bağlantı Testi
 * This script tests database connection and basic operations
 * Bu skript veritabanı bağlantısını və əsas əməliyyatları test edir
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection... / Veritabanı bağlantısını test edir...');
    
    // Test basic connection / Əsas bağlantını test et
    await prisma.$connect();
    console.log('✅ Database connected successfully / Veritabanı uğurla bağlandı');
    
    // Test user count / İstifadəçi sayını test et
    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount} / Ümumi istifadəçilər: ${userCount}`);
    
    // Test category count / Kateqoriya sayını test et
    const categoryCount = await prisma.category.count();
    console.log(`📁 Total categories: ${categoryCount} / Ümumi kateqoriyalar: ${categoryCount}`);
    
    // Test product count / Məhsul sayını test et
    const productCount = await prisma.product.count();
    console.log(`📦 Total products: ${productCount} / Ümumi məhsullar: ${productCount}`);
    
    // Test admin user / Admin istifadəçini test et
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { email: true, name: true, role: true }
    });
    console.log(`👑 Admin user: ${adminUser?.email} (${adminUser?.name}) / Admin istifadəçi: ${adminUser?.email} (${adminUser?.name})`);
    
    // Test seller users / Satıcı istifadəçiləri test et
    const sellerCount = await prisma.user.count({
      where: { role: 'SELLER' }
    });
    console.log(`🏪 Seller users: ${sellerCount} / Satıcı istifadəçilər: ${sellerCount}`);
    
    // Test courier users / Kuryer istifadəçiləri test et
    const courierCount = await prisma.user.count({
      where: { role: 'COURIER' }
    });
    console.log(`🚚 Courier users: ${courierCount} / Kuryer istifadəçilər: ${courierCount}`);
    
    // Test recent products / Son məhsulları test et
    const recentProducts = await prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { name: true, price: true, stock: true }
    });
    console.log('📦 Recent products / Son məhsullar:');
    recentProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`);
    });
    
    console.log('🎉 Database test completed successfully! / Veritabanı testi uğurla tamamlandı!');
    
  } catch (error) {
    console.error('❌ Database test failed / Veritabanı testi uğursuz oldu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed / Veritabanı bağlantısı bağlandı');
  }
}

// Run the test / Testi işə sal
testDatabaseConnection();
