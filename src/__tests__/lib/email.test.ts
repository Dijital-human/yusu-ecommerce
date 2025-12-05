/**
 * Email Service Tests / Email Xidmət Testləri
 * This file tests the email service functionality
 * Bu fayl email xidmətinin funksionallığını test edir
 */

import { sendEmail, sendEmailVerification, sendPasswordReset, sendOrderConfirmation, sendWelcomeEmail } from '@/lib/email'

// Mock nodemailer / nodemailer-ı mock et
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}))

// Mock environment config / Mühit konfiqurasiyasını mock et
jest.mock('@/lib/env', () => ({
  getEmailConfig: jest.fn(() => ({
    host: 'smtp.gmail.com',
    port: 587,
    user: 'test@gmail.com',
    password: 'test-password',
    from: 'noreply@azliner.info',
  })),
}))

describe('Email Service / Email Xidməti', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('sendEmail / Email Göndər', () => {
    it('sends email successfully / Email-i uğurla göndərir', async () => {
      const mockTransporter = require('nodemailer').createTransporter()
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'mock-message-id',
      })

      const result = await sendEmail(
        'test@example.com',
        'Test Subject / Test Mövzusu',
        '<h1>Test HTML / Test HTML</h1>',
        'Test Text / Test Mətn'
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('mock-message-id')
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@azliner.info',
        to: 'test@example.com',
        subject: 'Test Subject / Test Mövzusu',
        html: '<h1>Test HTML / Test HTML</h1>',
        text: 'Test Text / Test Mətn',
      })
    })

    it('handles email sending failure / Email göndərmə uğursuzluğunu idarə edir', async () => {
      const mockTransporter = require('nodemailer').createTransporter()
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP connection failed'))

      const result = await sendEmail(
        'test@example.com',
        'Test Subject / Test Mövzusu',
        '<h1>Test HTML / Test HTML</h1>',
        'Test Text / Test Mətn'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('SMTP connection failed')
    })

    it('returns error when email config is not available / Email konfiqurasiyası mövcud olmadıqda xəta qaytarır', async () => {
      const mockGetEmailConfig = require('@/lib/env').getEmailConfig
      mockGetEmailConfig.mockReturnValue(null)

      const result = await sendEmail(
        'test@example.com',
        'Test Subject / Test Mövzusu',
        '<h1>Test HTML / Test HTML</h1>',
        'Test Text / Test Mətn'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Email service not configured')
    })
  })

  describe('sendEmailVerification / Email Təsdiqi Göndər', () => {
    it('sends verification email with correct content / Təsdiq email-ini düzgün məzmunla göndərir', async () => {
      const mockTransporter = require('nodemailer').createTransporter()
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'mock-message-id',
      })

      const result = await sendEmailVerification({
        email: 'test@example.com',
        token: 'verification-token',
        name: 'Test User',
      })

      expect(result.success).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Email Verification'),
          html: expect.stringContaining('verification-token'),
          text: expect.stringContaining('verification-token'),
        })
      )
    })
  })

  describe('sendPasswordReset / Şifrə Sıfırlama Göndər', () => {
    it('sends password reset email with correct content / Şifrə sıfırlama email-ini düzgün məzmunla göndərir', async () => {
      const mockTransporter = require('nodemailer').createTransporter()
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'mock-message-id',
      })

      const result = await sendPasswordReset({
        email: 'test@example.com',
        token: 'reset-token',
        name: 'Test User',
      })

      expect(result.success).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Password Reset'),
          html: expect.stringContaining('reset-token'),
          text: expect.stringContaining('reset-token'),
        })
      )
    })
  })

  describe('sendOrderConfirmation / Sifariş Təsdiqi Göndər', () => {
    it('sends order confirmation email with order details / Sifariş təsdiq email-ini sifariş təfərrüatları ilə göndərir', async () => {
      const mockTransporter = require('nodemailer').createTransporter()
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'mock-message-id',
      })

      const orderData = {
        email: 'test@example.com',
        name: 'Test User',
        orderId: 'ORDER-123',
        totalAmount: 99.99,
        items: [
          { name: 'Product 1', quantity: 2, price: 49.99 },
          { name: 'Product 2', quantity: 1, price: 29.99 },
        ],
      }

      const result = await sendOrderConfirmation(orderData)

      expect(result.success).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('ORDER-123'),
          html: expect.stringContaining('ORDER-123'),
          html: expect.stringContaining('99.99'),
          text: expect.stringContaining('ORDER-123'),
        })
      )
    })
  })

  describe('sendWelcomeEmail / Xoş Gəlmə Email-i Göndər', () => {
    it('sends welcome email with correct content / Xoş gəlmə email-ini düzgün məzmunla göndərir', async () => {
      const mockTransporter = require('nodemailer').createTransporter()
      mockTransporter.sendMail.mockResolvedValue({
        messageId: 'mock-message-id',
      })

      const result = await sendWelcomeEmail('test@example.com', 'Test User')

      expect(result.success).toBe(true)
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Welcome'),
          html: expect.stringContaining('Test User'),
          text: expect.stringContaining('Test User'),
        })
      )
    })
  })
})
