/**
 * Real-Time Service Unit Tests / Real-Time Xidməti Unit Testləri
 * Tests for real-time service functionality
 * Real-time xidməti funksionallığı üçün testlər
 */

import {
  emitOrderStatusUpdate,
  emitStockUpdate,
  emitPriceUpdate,
  emitCartUpdate,
  emitNewProductNotification,
} from '../realtime-service';

// Mock SSE emit function / SSE emit funksiyasını mock et
jest.mock('../sse', () => ({
  emitRealtimeEvent: jest.fn(),
}));

// Mock Prisma / Prisma-nı mock et
jest.mock('@/lib/db', () => ({
  prisma: {
    orders: {
      findUnique: jest.fn(),
    },
    order_items: {
      count: jest.fn(),
    },
    products: {
      findUnique: jest.fn(),
    },
    categories: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock logger / Logger-i mock et
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

import { emitRealtimeEvent } from '../sse';
import { prisma } from '@/lib/db';

describe('Real-Time Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('emitOrderStatusUpdate', () => {
    it('should emit order status update / Sifariş status yeniləməsini emit etməlidir', async () => {
      const mockOrder = {
        id: 'order123',
        status: 'CONFIRMED',
        totalAmount: { toString: () => '199.99' },
      };

      (prisma.orders.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (prisma.order_items.count as jest.Mock).mockResolvedValue(2);

      await emitOrderStatusUpdate('order123', 'SHIPPED', 'user123');

      expect(emitRealtimeEvent).toHaveBeenCalledWith(
        'order.status.update',
        expect.objectContaining({
          orderId: 'order123',
          status: 'SHIPPED',
        }),
        'user123'
      );
    });

    it('should handle order not found / Tapılmayan sifarişi idarə etməlidir', async () => {
      (prisma.orders.findUnique as jest.Mock).mockResolvedValue(null);

      await emitOrderStatusUpdate('nonexistent', 'SHIPPED', 'user123');

      expect(emitRealtimeEvent).not.toHaveBeenCalled();
    });
  });

  describe('emitStockUpdate', () => {
    it('should emit stock update for significant changes / Əhəmiyyətli dəyişikliklər üçün stok yeniləməsini emit etməlidir', async () => {
      const mockProduct = {
        id: 'product123',
        name: 'Test Product',
        stock: 5,
        isActive: true,
      };

      (prisma.products.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      await emitStockUpdate('product123', 5, 20);

      expect(emitRealtimeEvent).toHaveBeenCalledWith(
        'product.stock.update',
        expect.objectContaining({
          productId: 'product123',
          stock: 5,
          previousStock: 20,
        }),
        undefined
      );
    });

    it('should not emit for minor changes / Kiçik dəyişikliklər üçün emit etməməlidir', async () => {
      const mockProduct = {
        id: 'product123',
        name: 'Test Product',
        stock: 10,
        isActive: true,
      };

      (prisma.products.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      await emitStockUpdate('product123', 9, 10);

      // Should not emit for small changes / Kiçik dəyişikliklər üçün emit etməməlidir
      expect(emitRealtimeEvent).not.toHaveBeenCalled();
    });
  });

  describe('emitPriceUpdate', () => {
    it('should emit price update for significant changes / Əhəmiyyətli dəyişikliklər üçün qiymət yeniləməsini emit etməlidir', async () => {
      const mockProduct = {
        id: 'product123',
        name: 'Test Product',
        price: { toString: () => '120' },
      };

      (prisma.products.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      await emitPriceUpdate('product123', 120, 100);

      expect(emitRealtimeEvent).toHaveBeenCalledWith(
        'product.price.update',
        expect.objectContaining({
          productId: 'product123',
          price: 120,
          previousPrice: 100,
        }),
        undefined
      );
    });
  });

  describe('emitCartUpdate', () => {
    it('should emit cart update / Səbət yeniləməsini emit etməlidir', () => {
      emitCartUpdate('user123', {
        itemCount: 3,
        total: 299.97,
        items: [
          { productId: 'product1', quantity: 1 },
          { productId: 'product2', quantity: 2 },
        ],
      });

      expect(emitRealtimeEvent).toHaveBeenCalledWith(
        'cart.update',
        expect.objectContaining({
          itemCount: 3,
          total: 299.97,
        }),
        'user123'
      );
    });
  });

  describe('emitNewProductNotification', () => {
    it('should emit new product notification / Yeni məhsul bildirişini emit etməlidir', async () => {
      const mockProduct = {
        id: 'product123',
        name: 'New Product',
        categoryId: 'category123',
      };

      const mockCategory = {
        id: 'category123',
        name: 'Test Category',
      };

      (prisma.products.findUnique as jest.Mock).mockResolvedValue(mockProduct);
      (prisma.categories.findUnique as jest.Mock).mockResolvedValue(mockCategory);

      await emitNewProductNotification('product123');

      expect(emitRealtimeEvent).toHaveBeenCalledWith(
        'product.new',
        expect.objectContaining({
          productId: 'product123',
          productName: 'New Product',
        }),
        undefined
      );
    });
  });
});

