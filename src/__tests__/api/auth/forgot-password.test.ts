/**
 * Forgot Password API Tests / Şifrə Unutma API Testləri
 * This file tests the forgot password API endpoint
 * Bu fayl şifrə unutma API endpoint-ini test edir
 */

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/forgot-password/route'

// Mock Prisma / Prisma-nı mock et
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock email service / Email xidmətini mock et
jest.mock('@/lib/email', () => ({
  sendPasswordReset: jest.fn(),
}))

// Mock crypto / Crypto-nu mock et
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-token'),
  })),
}))

describe('Forgot Password API / Şifrə Unutma API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success for valid email / Etibarlı email üçün uğur qaytarır', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
    }

    const mockPrisma = require('@/lib/db').prisma
    const mockEmailService = require('@/lib/email')

    mockPrisma.user.findUnique.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockResolvedValue({})
    mockEmailService.sendPasswordReset.mockResolvedValue({
      success: true,
      messageId: 'mock-message-id',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('password reset link has been sent')
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    })
  })

  it('returns success for non-existent email / Mövcud olmayan email üçün uğur qaytarır', async () => {
    const mockPrisma = require('@/lib/db').prisma
    mockPrisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'nonexistent@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('password reset link has been sent')
  })

  it('returns error for invalid email format / Yanlış email formatı üçün xəta qaytarır', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Invalid email format')
  })

  it('handles email sending failure gracefully / Email göndərmə uğursuzluğunu zərif şəkildə idarə edir', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      isActive: true,
    }

    const mockPrisma = require('@/lib/db').prisma
    const mockEmailService = require('@/lib/email')

    mockPrisma.user.findUnique.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockResolvedValue({})
    mockEmailService.sendPasswordReset.mockResolvedValue({
      success: false,
      error: 'Email service unavailable',
    })

    const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('password reset link has been sent')
  })

  it('handles database errors / Veritabanı xətalarını idarə edir', async () => {
    const mockPrisma = require('@/lib/db').prisma
    mockPrisma.user.findUnique.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toContain('Internal server error')
  })
})
