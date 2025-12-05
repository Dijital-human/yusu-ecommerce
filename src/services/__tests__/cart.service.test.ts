/**
 * Cart Service Unit Tests / Səbət Xidməti Unit Testləri
 * Tests for cart service functionality
 * Səbət xidməti funksionallığı üçün testlər
 */

import {
  getCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../cart.service';

// Mock Prisma / Prisma-nı mock et
jest.mock('@/lib/db', () => ({
  prisma: {
    cartItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    products: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock validators / Validator-ləri mock et
jest.mock('@/lib/api/validators', () => ({
  validateProductId: jest.fn((id: string) => id),
  validateQuantity: jest.fn((qty: number) => qty),
  validateProductStock: jest.fn().mockResolvedValue({
    product: { id: 'product123', stock: 10, price: 99.99 },
  }),
}));

// Mock selectors / Selector-ləri mock et
jest.mock('@/lib/db/selectors', () => ({
  cartInclude: {},
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

import { prisma } from '@/lib/db';

describe('Cart Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCartItems', () => {
    it('should return user cart items / İstifadəçi səbət elementlərini qaytarmalıdır', async () => {
      const mockItems = [
        { id: '1', userId: 'user123', productId: 'product123', quantity: 2 },
      ];

      (prisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await getCartItems('user123');

      expect(result).toEqual(mockItems);
      expect(prisma.cartItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        include: {},
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array if no items / Əgər element yoxdursa boş array qaytarmalıdır', async () => {
      (prisma.cartItem.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getCartItems('user123');

      expect(result).toEqual([]);
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart / Yeni elementi səbətə əlavə etməlidir', async () => {
      const mockProduct = { id: 'product123', stock: 10, price: 99.99 };
      const mockCartItem = {
        id: 'cart123',
        userId: 'user123',
        productId: 'product123',
        quantity: 1,
      };

      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.cartItem.create as jest.Mock).mockResolvedValue(mockCartItem);

      const result = await addToCart('user123', 'product123', 1);

      expect(result).toBeDefined();
      expect(prisma.cartItem.create).toHaveBeenCalled();
    });

    it('should update existing item quantity / Mövcud elementin miqdarını yeniləməlidir', async () => {
      const existingItem = {
        id: 'cart123',
        userId: 'user123',
        productId: 'product123',
        quantity: 1,
      };

      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(existingItem);
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({
        ...existingItem,
        quantity: 2,
      });

      const result = await addToCart('user123', 'product123', 1);

      expect(result).toBeDefined();
      expect(prisma.cartItem.update).toHaveBeenCalled();
    });

    it('should throw error if insufficient stock / Əgər kifayət qədər stok yoxdursa xəta atmalıdır', async () => {
      const { validateProductStock } = require('@/lib/api/validators');
      validateProductStock.mockResolvedValueOnce(
        new Response('Insufficient stock', { status: 400 })
      );

      await expect(addToCart('user123', 'product123', 100)).rejects.toThrow();
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity / Səbət elementinin miqdarını yeniləməlidir', async () => {
      const mockItem = {
        id: 'cart123',
        userId: 'user123',
        productId: 'product123',
        quantity: 2,
      };

      (prisma.cartItem.findUnique as jest.Mock).mockResolvedValue(mockItem);
      (prisma.cartItem.update as jest.Mock).mockResolvedValue({
        ...mockItem,
        quantity: 3,
      });

      const result = await updateCartItem('user123', 'product123', 3);

      expect(result).toBeDefined();
      expect(prisma.cartItem.update).toHaveBeenCalled();
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart / Elementi səbətdən silməlidir', async () => {
      (prisma.cartItem.delete as jest.Mock).mockResolvedValue({});

      await removeFromCart('user123', 'product123');

      expect(prisma.cartItem.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId: 'user123',
            productId: 'product123',
          },
        },
      });
    });
  });

  describe('clearCart', () => {
    it('should clear all user cart items / Bütün istifadəçi səbət elementlərini təmizləməlidir', async () => {
      (prisma.cartItem.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });

      await clearCart('user123');

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });
  });
});

