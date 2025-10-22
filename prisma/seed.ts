/**
 * Database Seeding Script / Veritabanı Seeding Scripti
 * This script populates the database with sample data
 * Bu script veritabanını nümunə məlumatlarla doldurur
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding... / Veritabanı seeding başlayır...');

  // Create categories / Kateqoriyalar yarat
  console.log('📁 Creating categories... / Kateqoriyalar yaradılır...');
  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: '1' },
      update: {},
      create: {
        id: '1',
        name: 'Electronics / Elektronika',
        description: 'Electronic devices and gadgets / Elektron cihazlar və qadjetlər',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '2' },
      update: {},
      create: {
        id: '2',
        name: 'Fashion / Moda',
        description: 'Clothing and accessories / Geyim və aksesuarlar',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '3' },
      update: {},
      create: {
        id: '3',
        name: 'Home & Garden / Ev və Bağ',
        description: 'Home improvement and garden supplies / Ev təmir və bağ ləvazimatları',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '4' },
      update: {},
      create: {
        id: '4',
        name: 'Sports / İdman',
        description: 'Sports equipment and fitness / İdman avadanlığı və fitnes',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '5' },
      update: {},
      create: {
        id: '5',
        name: 'Books / Kitablar',
        description: 'Books and educational materials / Kitablar və təhsil materialları',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '6' },
      update: {},
      create: {
        id: '6',
        name: 'Beauty & Health / Gözəllik və Sağlamlıq',
        description: 'Beauty products and health supplements / Gözəllik məhsulları və sağlamlıq əlavələri',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '7' },
      update: {},
      create: {
        id: '7',
        name: 'Automotive / Avtomobil',
        description: 'Car parts and accessories / Avtomobil hissələri və aksesuarları',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '8' },
      update: {},
      create: {
        id: '8',
        name: 'Toys & Games / Oyuncaqlar və Oyunlar',
        description: 'Toys, games and entertainment / Oyuncaqlar, oyunlar və əyləncə',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '9' },
      update: {},
      create: {
        id: '9',
        name: 'Food & Beverages / Yemək və İçkilər',
        description: 'Food, drinks and gourmet products / Yemək, içkilər və qurmet məhsulları',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { id: '10' },
      update: {},
      create: {
        id: '10',
        name: 'Jewelry & Watches / Zinət və Saatlar',
        description: 'Jewelry, watches and luxury accessories / Zinət əşyaları, saatlar və lüks aksesuarlar',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories / ${categories.length} kateqoriya yaradıldı`);

  // Create admin user / Admin istifadəçi yarat
  console.log('👑 Creating admin user... / Admin istifadəçi yaradılır...');
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@yusu.com' },
    update: {},
    create: {
      id: 'admin-1',
      email: 'admin@yusu.com',
      name: 'Admin User',
      role: 'ADMIN',
      phone: '+994501234567',
      isActive: true,
    },
  });

  console.log('✅ Admin user created / Admin istifadəçi yaradıldı');

  // Create seller users / Satıcı istifadəçilər yarat
  console.log('🏪 Creating seller users... / Satıcı istifadəçilər yaradılır...');
  
  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'seller1@yusu.com' },
      update: {},
      create: {
        id: 'seller-1',
        email: 'seller1@yusu.com',
        name: 'Tech Gadgets Inc.',
        role: 'SELLER',
        phone: '+994501234568',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'seller2@yusu.com' },
      update: {},
      create: {
        id: 'seller-2',
        email: 'seller2@yusu.com',
        name: 'Style Haven Boutique',
        role: 'SELLER',
        phone: '+994501234569',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${sellers.length} sellers / ${sellers.length} satıcı yaradıldı`);

  // Create courier users / Kuryer istifadəçilər yarat
  console.log('🚚 Creating courier users... / Kuryer istifadəçilər yaradılır...');
  
  const couriers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'courier1@yusu.com' },
      update: {},
      create: {
        id: 'courier-1',
        email: 'courier1@yusu.com',
        name: 'Fast Delivery John',
        role: 'COURIER',
        phone: '+994501234570',
        isActive: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'courier2@yusu.com' },
      update: {},
      create: {
        id: 'courier-2',
        email: 'courier2@yusu.com',
        name: 'Swift Ship Jane',
        role: 'COURIER',
        phone: '+994501234571',
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${couriers.length} couriers / ${couriers.length} kuryer yaradıldı`);

  // Create sample products / Nümunə məhsullar yarat
  console.log('📦 Creating sample products... / Nümunə məhsullar yaradılır...');
  
  const products = [
    // Electronics / Elektronika
    {
      id: 'prod-1',
      name: 'iPhone 15 Pro Max',
      description: 'Latest iPhone with advanced camera system and titanium design',
      price: 1199.99,
      originalPrice: 1299.99,
      images: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop',
      categoryId: '1',
      sellerId: 'seller-1',
      stock: 50,
      isActive: true,
    },
    {
      id: 'prod-2',
      name: 'MacBook Pro 16" M3',
      description: 'Powerful laptop for professionals with M3 chip',
      price: 2499.99,
      originalPrice: 2799.99,
      images: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      categoryId: '1',
      sellerId: 'seller-1',
      stock: 25,
      isActive: true,
    },
    {
      id: 'prod-3',
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Premium noise-canceling wireless headphones',
      price: 399.99,
      originalPrice: 449.99,
      images: 'https://images.unsplash.com/photo-1505740420928-5e880c94d7c0?w=400&h=400&fit=crop',
      categoryId: '1',
      sellerId: 'seller-1',
      stock: 100,
      isActive: true,
    },
    // Fashion / Moda
    {
      id: 'prod-4',
      name: 'Premium Cotton T-Shirt',
      description: 'Comfortable organic cotton t-shirt in various colors',
      price: 29.99,
      originalPrice: 39.99,
      images: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      categoryId: '2',
      sellerId: 'seller-2',
      stock: 200,
      isActive: true,
    },
    {
      id: 'prod-5',
      name: 'Genuine Leather Jacket',
      description: 'Classic genuine leather jacket for all seasons',
      price: 199.99,
      originalPrice: 249.99,
      images: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
      categoryId: '2',
      sellerId: 'seller-2',
      stock: 75,
      isActive: true,
    },
    // Home & Garden / Ev və Bağ
    {
      id: 'prod-6',
      name: 'Smart Home Speaker',
      description: 'Voice-controlled smart speaker with AI assistant',
      price: 149.99,
      originalPrice: 199.99,
      images: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop',
      categoryId: '3',
      sellerId: 'seller-1',
      stock: 80,
      isActive: true,
    },
    // Sports / İdman
    {
      id: 'prod-7',
      name: 'Yoga Mat Premium',
      description: 'Non-slip premium yoga mat for all exercises',
      price: 39.99,
      originalPrice: 59.99,
      images: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
      categoryId: '4',
      sellerId: 'seller-2',
      stock: 150,
      isActive: true,
    },
    // Books / Kitablar
    {
      id: 'prod-8',
      name: 'Programming Fundamentals',
      description: 'Complete guide to modern programming concepts',
      price: 49.99,
      originalPrice: 69.99,
      images: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop',
      categoryId: '5',
      sellerId: 'seller-1',
      stock: 300,
      isActive: true,
    },
    // Beauty & Health / Gözəllik və Sağlamlıq
    {
      id: 'prod-9',
      name: 'Skincare Set',
      description: 'Complete skincare routine with premium products',
      price: 89.99,
      originalPrice: 119.99,
      images: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
      categoryId: '6',
      sellerId: 'seller-2',
      stock: 120,
      isActive: true,
    },
    {
      id: 'prod-10',
      name: 'Vitamin C Serum',
      description: 'Anti-aging vitamin C serum for glowing skin',
      price: 34.99,
      originalPrice: 49.99,
      images: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop',
      categoryId: '6',
      sellerId: 'seller-2',
      stock: 180,
      isActive: true,
    },
    // Automotive / Avtomobil
    {
      id: 'prod-11',
      name: 'Car Phone Mount',
      description: 'Universal car phone mount with wireless charging',
      price: 29.99,
      originalPrice: 39.99,
      images: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop',
      categoryId: '7',
      sellerId: 'seller-1',
      stock: 150,
      isActive: true,
    },
    {
      id: 'prod-12',
      name: 'Car Floor Mats',
      description: 'Premium all-weather car floor mats',
      price: 79.99,
      originalPrice: 99.99,
      images: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      categoryId: '7',
      sellerId: 'seller-2',
      stock: 80,
      isActive: true,
    },
    // Toys & Games / Oyuncaqlar və Oyunlar
    {
      id: 'prod-13',
      name: 'LEGO Building Set',
      description: 'Creative LEGO building set for all ages',
      price: 49.99,
      originalPrice: 69.99,
      images: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      categoryId: '8',
      sellerId: 'seller-2',
      stock: 200,
      isActive: true,
    },
    {
      id: 'prod-14',
      name: 'Board Game Collection',
      description: 'Family board game collection with 5 games',
      price: 39.99,
      originalPrice: 59.99,
      images: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=400&fit=crop',
      categoryId: '8',
      sellerId: 'seller-1',
      stock: 75,
      isActive: true,
    },
    // Food & Beverages / Yemək və İçkilər
    {
      id: 'prod-15',
      name: 'Gourmet Coffee Beans',
      description: 'Premium single-origin coffee beans',
      price: 24.99,
      originalPrice: 34.99,
      images: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
      categoryId: '9',
      sellerId: 'seller-1',
      stock: 300,
      isActive: true,
    },
    {
      id: 'prod-16',
      name: 'Organic Tea Collection',
      description: 'Premium organic tea collection with 10 varieties',
      price: 19.99,
      originalPrice: 29.99,
      images: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
      categoryId: '9',
      sellerId: 'seller-2',
      stock: 250,
      isActive: true,
    },
    // Jewelry & Watches / Zinət və Saatlar
    {
      id: 'prod-17',
      name: 'Gold Necklace',
      description: 'Elegant 18k gold necklace with pendant',
      price: 299.99,
      originalPrice: 399.99,
      images: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
      categoryId: '10',
      sellerId: 'seller-2',
      stock: 45,
      isActive: true,
    },
    {
      id: 'prod-18',
      name: 'Luxury Watch',
      description: 'Swiss-made luxury watch with leather strap',
      price: 599.99,
      originalPrice: 799.99,
      images: 'https://images.unsplash.com/photo-1523170335258-f5e6a7a0b0c3?w=400&h=400&fit=crop',
      categoryId: '10',
      sellerId: 'seller-1',
      stock: 25,
      isActive: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Created ${products.length} products / ${products.length} məhsul yaradıldı`);

  // Create sample addresses / Nümunə ünvanlar yarat
  console.log('📍 Creating sample addresses... / Nümunə ünvanlar yaradılır...');
  
  const addresses = [
    {
      id: 'addr-1',
      userId: 'admin-1',
      street: 'Nizami Street 123',
      city: 'Baku',
      state: 'Baku',
      zipCode: 'AZ1000',
      country: 'Azerbaijan',
      isDefault: true,
    },
    {
      id: 'addr-2',
      userId: 'seller-1',
      street: '28 May Street 45',
      city: 'Baku',
      state: 'Baku',
      zipCode: 'AZ1001',
      country: 'Azerbaijan',
      isDefault: true,
    },
  ];

  for (const address of addresses) {
    await prisma.address.upsert({
      where: { id: address.id },
      update: {},
      create: address,
    });
  }

  console.log(`✅ Created ${addresses.length} addresses / ${addresses.length} ünvan yaradıldı`);

  // Create sample reviews / Nümunə rəylər yarat
  console.log('⭐ Creating sample reviews... / Nümunə rəylər yaradılır...');
  
  const reviews = [
    {
      id: 'rev-1',
      productId: 'prod-1',
      userId: 'admin-1',
      rating: 5,
      comment: 'Excellent phone! Great camera quality and battery life.',
    },
    {
      id: 'rev-2',
      productId: 'prod-1',
      userId: 'seller-1',
      rating: 4,
      comment: 'Very good device, but a bit expensive.',
    },
    {
      id: 'rev-3',
      productId: 'prod-2',
      userId: 'admin-1',
      rating: 5,
      comment: 'Perfect laptop for professional work. Highly recommended!',
    },
    {
      id: 'rev-4',
      productId: 'prod-3',
      userId: 'seller-2',
      rating: 5,
      comment: 'Amazing sound quality and noise cancellation.',
    },
    {
      id: 'rev-5',
      productId: 'prod-4',
      userId: 'admin-1',
      rating: 4,
      comment: 'Comfortable and good quality t-shirt.',
    },
    {
      id: 'rev-6',
      productId: 'prod-5',
      userId: 'seller-1',
      rating: 5,
      comment: 'Genuine leather, great fit and style.',
    },
    {
      id: 'rev-7',
      productId: 'prod-6',
      userId: 'admin-1',
      rating: 4,
      comment: 'Good smart speaker, easy to use.',
    },
    {
      id: 'rev-8',
      productId: 'prod-7',
      userId: 'seller-2',
      rating: 5,
      comment: 'Perfect yoga mat, non-slip and comfortable.',
    },
    {
      id: 'rev-9',
      productId: 'prod-8',
      userId: 'admin-1',
      rating: 5,
      comment: 'Great programming book, very informative.',
    },
    {
      id: 'rev-10',
      productId: 'prod-9',
      userId: 'seller-1',
      rating: 4,
      comment: 'Good skincare set, effective products.',
    },
  ];

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      update: {},
      create: review,
    });
  }

  console.log(`✅ Created ${reviews.length} reviews / ${reviews.length} rəy yaradıldı`);

  console.log('🎉 Database seeding completed! / Veritabanı seeding tamamlandı!');
  console.log('\n📋 Created accounts / Yaradılan hesablar:');
  console.log('👑 Admin: admin@yusu.com');
  console.log('🏪 Seller 1: seller1@yusu.com');
  console.log('🏪 Seller 2: seller2@yusu.com');
  console.log('🚚 Courier 1: courier1@yusu.com');
  console.log('🚚 Courier 2: courier2@yusu.com');
  console.log('\n💡 Note: Use OAuth providers for authentication / Qeyd: Autentifikasiya üçün OAuth provider-ları istifadə edin');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed / Seeding uğursuz oldu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });