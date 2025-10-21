/**
 * Database Connection Utility / Veritabanı Bağlantı Utility-si
 * This utility provides a singleton Prisma client instance
 * Bu utility singleton Prisma client instance təmin edir
 */

import { PrismaClient } from '@prisma/client';

// Global variable to store Prisma client / Prisma client-i saxlamaq üçün global dəyişən
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client instance / Prisma client instance yarat
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// In development, store the client globally to prevent multiple instances / İnkişafda, çoxlu instance-ları qarşısını almaq üçün client-i global olaraq saxla
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Database connection test function / Veritabanı bağlantı test funksiyası
export async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully / Veritabanı uğurla bağlandı');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed / Veritabanı bağlantısı uğursuz oldu:', error);
    return false;
  }
}

// Graceful shutdown function / Zərif bağlanma funksiyası
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected / Veritabanı bağlandı');
  } catch (error) {
    console.error('❌ Error disconnecting database / Veritabanı bağlama xətası:', error);
  }
}

// Health check function / Sağlamlıq yoxlama funksiyası
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}

// Export default prisma client / Prisma client-i default olaraq export et
export default prisma;

// Export as db for compatibility / Uyğunluq üçün db kimi export et
export const db = prisma;
