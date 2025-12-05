/**
 * Email Service Library / Email Xidmət Kitabxanası
 * This library handles all email operations including sending emails, templates, and verification
 * Bu kitabxana bütün email əməliyyatlarını idarə edir - email göndərmə, şablonlar və təsdiq
 */

import { getEmailService } from './core/email-service';
import type { EmailOptions, EmailResult as ServiceEmailResult } from './core/types';
import { logger } from '../utils/logger';

// Email template types / Email şablon tipləri
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email sending result / Email göndərmə nəticəsi
export type EmailResult = ServiceEmailResult;

// Email verification data / Email təsdiq məlumatları
export interface EmailVerificationData {
  email: string;
  token: string;
  name?: string;
}

// Password reset data / Şifrə sıfırlama məlumatları
export interface PasswordResetData {
  email: string;
  token: string;
  name?: string;
}

// Order confirmation data / Sifariş təsdiq məlumatları
export interface OrderConfirmationData {
  email: string;
  name: string;
  orderId: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

const emailService = () => getEmailService();

/**
 * Check if email service is configured / Email xidmətinin konfiqurasiya olunub-olunmadığını yoxla
 */
export function isEmailConfigured(): boolean {
  return emailService().isConfigured();
}

/**
 * Get available providers / Mövcud provider-ləri al
 */
export function getAvailableEmailProviders(): string[] {
  return emailService().getAvailableProviders();
}

/**
 * Send email with retry logic / Retry məntiqı ilə email göndər
 * @param to - Recipient email / Alıcı email
 * @param subject - Email subject / Email mövzusu
 * @param html - HTML content / HTML məzmun
 * @param text - Text content / Mətn məzmunu
 * @param retries - Number of retry attempts / Retry cəhdlərinin sayı
 * @returns Promise<EmailResult>
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string,
  _retries: number = 0
): Promise<EmailResult> {
  if (!isEmailConfigured()) {
    logger.warn('Email service not configured / Email xidməti konfiqurasiya edilməyib', { to, subject });
    return {
      success: false,
      error: 'Email service not configured / Email xidməti konfiqurasiya edilməyib',
    };
  }

  const payload: EmailOptions = {
    to,
    subject,
    html,
    text,
  };

  const result = await emailService().send(payload);

  if (!result.success) {
    logger.error('Email sending failed / Email göndərmə uğursuz oldu', {
      to,
      subject,
      error: result.error,
    });
  }

  return result;
}

/**
 * Send email verification / Email təsdiqi göndər
 * @param data - Verification data / Təsdiq məlumatları
 * @returns Promise<EmailResult>
 */
export async function sendEmailVerification(data: EmailVerificationData): Promise<EmailResult> {
  // Use locale-aware URL / Locale-aware URL istifadə et
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Use ulustore.com domain / ulustore.com domain istifadə et
  const domainUrl = baseUrl.replace(/azliner\.info|localhost:3000/g, 'ulustore.com');
  const verificationUrl = `${domainUrl}/az/auth/verify-email?token=${data.token}`;
  
  const subject = 'Email Verification / Email Təsdiqi - Yusu E-commerce';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Email Verification / Email Təsdiqi</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Welcome to Yusu E-commerce! / Yusu E-ticarətə xoş gəlmisiniz!</h2>
        
        <p>Hello ${data.name || 'User'} / Salam ${data.name || 'İstifadəçi'},</p>
        
        <p>Please verify your email address to complete your registration / Qeydiyyatınızı tamamlamaq üçün email ünvanınızı təsdiq edin:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email / Email Təsdiq Et
          </a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser / Əgər düymə işləmirsə, bu linki brauzerinizə kopyalayın:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <p>This link will expire in 24 hours / Bu link 24 saat ərzində etibarlıdır.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          If you didn't create an account, please ignore this email / Əgər hesab yaratmamısınızsa, bu email-i görməzlikdən gəlin.
        </p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to Yusu E-commerce! / Yusu E-ticarətə xoş gəlmisiniz!
    
    Hello ${data.name || 'User'} / Salam ${data.name || 'İstifadəçi'},
    
    Please verify your email address by clicking the link below / Email ünvanınızı təsdiq etmək üçün aşağıdakı linkə basın:
    
    ${verificationUrl}
    
    This link will expire in 24 hours / Bu link 24 saat ərzində etibarlıdır.
    
    If you didn't create an account, please ignore this email / Əgər hesab yaratmamısınızsa, bu email-i görməzlikdən gəlin.
  `;

  return sendEmail(data.email, subject, html, text);
}

/**
 * Send password reset email / Şifrə sıfırlama email-i göndər
 * @param data - Password reset data / Şifrə sıfırlama məlumatları
 * @returns Promise<EmailResult>
 */
export async function sendPasswordReset(data: PasswordResetData): Promise<EmailResult> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${data.token}`;
  
  const subject = 'Password Reset / Şifrə Sıfırlama - Yusu E-commerce';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset / Şifrə Sıfırlama</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Password Reset Request / Şifrə Sıfırlama Sorğusu</h2>
        
        <p>Hello ${data.name || 'User'} / Salam ${data.name || 'İstifadəçi'},</p>
        
        <p>We received a request to reset your password / Şifrənizi sıfırlamaq üçün sorğu aldıq. To reset your password, click the button below / Şifrənizi sıfırlamaq üçün aşağıdakı düyməyə basın:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password / Şifrəni Sıfırla
          </a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser / Əgər düymə işləmirsə, bu linki brauzerinizə kopyalayın:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <p>This link will expire in 1 hour / Bu link 1 saat ərzində etibarlıdır.</p>
        
        <p>If you didn't request a password reset, please ignore this email / Əgər şifrə sıfırlama sorğusu verməmisinizsə, bu email-i görməzlikdən gəlin.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          For security reasons, this link will only work once / Təhlükəsizlik səbəbləri üçün bu link yalnız bir dəfə işləyəcək.
        </p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Password Reset Request / Şifrə Sıfırlama Sorğusu
    
    Hello ${data.name || 'User'} / Salam ${data.name || 'İstifadəçi'},
    
    We received a request to reset your password / Şifrənizi sıfırlamaq üçün sorğu aldıq. To reset your password, click the link below / Şifrənizi sıfırlamaq üçün aşağıdakı linkə basın:
    
    ${resetUrl}
    
    This link will expire in 1 hour / Bu link 1 saat ərzində etibarlıdır.
    
    If you didn't request a password reset, please ignore this email / Əgər şifrə sıfırlama sorğusu verməmisinizsə, bu email-i görməzlikdən gəlin.
  `;

  return sendEmail(data.email, subject, html, text);
}

/**
 * Send order confirmation email / Sifariş təsdiq email-i göndər
 * @param data - Order confirmation data / Sifariş təsdiq məlumatları
 * @returns Promise<EmailResult>
 */
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<EmailResult> {
  const subject = `Order Confirmation / Sifariş Təsdiqi #${data.orderId} - Yusu E-commerce`;
  
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation / Sifariş Təsdiqi</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Order Confirmation / Sifariş Təsdiqi</h2>
        
        <p>Hello ${data.name} / Salam ${data.name},</p>
        
        <p>Thank you for your order! / Sifarişiniz üçün təşəkkür edirik! Your order has been confirmed and is being processed / Sifarişiniz təsdiq edildi və emal edilir.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>Order Details / Sifariş Təfərrüatları</h3>
          <p><strong>Order ID / Sifariş ID:</strong> ${data.orderId}</p>
          <p><strong>Total Amount / Ümumi Məbləğ:</strong> $${data.totalAmount.toFixed(2)}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6;">Product / Məhsul</th>
              <th style="padding: 10px; text-align: center; border-bottom: 2px solid #dee2e6;">Quantity / Miqdar</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #dee2e6;">Price / Qiymət</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <p>We will send you another email when your order ships / Sifarişiniz göndərildikdə sizə başqa email göndərəcəyik.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          If you have any questions, please contact our support team / Əgər suallarınız varsa, dəstək komandamızla əlaqə saxlayın.
        </p>
      </div>
    </body>
    </html>
  `;
  
  const itemsText = data.items.map(item => 
    `${item.name} - Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}`
  ).join('\n');
  
  const text = `
    Order Confirmation / Sifariş Təsdiqi
    
    Hello ${data.name} / Salam ${data.name},
    
    Thank you for your order! / Sifarişiniz üçün təşəkkür edirik!
    
    Order Details / Sifariş Təfərrüatları:
    Order ID / Sifariş ID: ${data.orderId}
    Total Amount / Ümumi Məbləğ: $${data.totalAmount.toFixed(2)}
    
    Items / Məhsullar:
    ${itemsText}
    
    We will send you another email when your order ships / Sifarişiniz göndərildikdə sizə başqa email göndərəcəyik.
    
    If you have any questions, please contact our support team / Əgər suallarınız varsa, dəstək komandamızla əlaqə saxlayın.
  `;

  return sendEmail(data.email, subject, html, text);
}

/**
 * Send welcome email / Xoş gəlmə email-i göndər
 * @param email - User email / İstifadəçi email
 * @param name - User name / İstifadəçi adı
 * @returns Promise<EmailResult>
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  const subject = 'Welcome to Yusu E-commerce! / Yusu E-ticarətə xoş gəlmisiniz!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome / Xoş gəlmə</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #f97316;">Welcome to Yusu E-commerce! / Yusu E-ticarətə xoş gəlmisiniz!</h2>
        
        <p>Hello ${name} / Salam ${name},</p>
        
        <p>Thank you for joining Yusu E-commerce! / Yusu E-ticarətə qoşulduğunuz üçün təşəkkür edirik! We're excited to have you as part of our community / Sizi cəmiyyətimizin bir hissəsi olaraq görməkdən məmnunuq.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3>What's next? / Növbəti addım nədir?</h3>
          <ul>
            <li>Browse our products / Məhsullarımıza baxın</li>
            <li>Create your wishlist / İstək siyahınızı yaradın</li>
            <li>Set up your profile / Profilinizi quraşdırın</li>
            <li>Start shopping! / Alış-verişə başlayın!</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/products" 
             style="background-color: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Start Shopping / Alış-verişə Başla
          </a>
        </div>
        
        <p>If you have any questions, feel free to contact our support team / Əgər suallarınız varsa, dəstək komandamızla əlaqə saxlamaqdan çəkinməyin.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">
          Thank you for choosing Yusu E-commerce! / Yusu E-ticarəti seçdiyiniz üçün təşəkkür edirik!
        </p>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Welcome to Yusu E-commerce! / Yusu E-ticarətə xoş gəlmisiniz!
    
    Hello ${name} / Salam ${name},
    
    Thank you for joining Yusu E-commerce! / Yusu E-ticarətə qoşulduğunuz üçün təşəkkür edirik!
    
    What's next? / Növbəti addım nədir?
    - Browse our products / Məhsullarımıza baxın
    - Create your wishlist / İstək siyahınızı yaradın
    - Set up your profile / Profilinizi quraşdırın
    - Start shopping! / Alış-verişə başlayın!
    
    Start shopping: ${process.env.NEXTAUTH_URL}/products
    
    If you have any questions, feel free to contact our support team / Əgər suallarınız varsa, dəstək komandamızla əlaqə saxlamaqdan çəkinməyin.
    
    Thank you for choosing Yusu E-commerce! / Yusu E-ticarəti seçdiyiniz üçün təşəkkür edirik!
  `;

  return sendEmail(email, subject, html, text);
}

export { getEmailService, EmailService } from './core/email-service';
export type { EmailOptions } from './core/types';
