/**
 * SMS Service Library / SMS Xidmət Kitabxanası
 * This library handles all SMS operations including OTP, order confirmations, and shipping updates
 * Bu kitabxana bütün SMS əməliyyatlarını idarə edir - OTP, sifariş təsdiqləri və çatdırılma yeniləmələri
 */

import twilio from 'twilio';
import { logger } from '../utils/logger';

// SMS service configuration check / SMS xidmət konfiqurasiyası yoxlaması
function isSMSConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

// Get Twilio client / Twilio client al
function getTwilioClient() {
  if (!isSMSConfigured()) {
    throw new Error('SMS service not configured / SMS xidməti konfiqurasiya edilməyib');
  }

  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

// SMS sending result / SMS göndərmə nəticəsi
export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send OTP via SMS / SMS ilə OTP göndər
 * @param phone - Phone number / Telefon nömrəsi
 * @param code - OTP code / OTP kodu
 * @returns Promise<SMSResult>
 */
export async function sendOTP(phone: string, code: string): Promise<SMSResult> {
  if (!isSMSConfigured()) {
    logger.warn('SMS service not configured / SMS xidməti konfiqurasiya edilməyib', { phone });
    return {
      success: false,
      error: 'SMS service not configured / SMS xidməti konfiqurasiya edilməyib',
    };
  }

  try {
    const client = getTwilioClient();
    const message = await client.messages.create({
      body: `Your OTP code is: ${code}. Valid for 10 minutes. / OTP kodunuz: ${code}. 10 dəqiqə ərzində etibarlıdır.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    logger.info('SMS OTP sent successfully / SMS OTP uğurla göndərildi', {
      phone,
      messageId: message.sid,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    logger.error('Failed to send SMS OTP / SMS OTP göndərmək uğursuz oldu', error, { phone });
    return {
      success: false,
      error: error.message || 'Failed to send SMS / SMS göndərmək uğursuz oldu',
    };
  }
}

/**
 * Send order confirmation SMS / Sifariş təsdiq SMS-i göndər
 * @param phone - Phone number / Telefon nömrəsi
 * @param orderId - Order ID / Sifariş ID
 * @returns Promise<SMSResult>
 */
export async function sendOrderConfirmationSMS(phone: string, orderId: string): Promise<SMSResult> {
  if (!isSMSConfigured()) {
    logger.warn('SMS service not configured / SMS xidməti konfiqurasiya edilməyib', { phone, orderId });
    return {
      success: false,
      error: 'SMS service not configured / SMS xidməti konfiqurasiya edilməyib',
    };
  }

  try {
    const client = getTwilioClient();
    const message = await client.messages.create({
      body: `Your order #${orderId} has been confirmed! / Sifarişiniz #${orderId} təsdiq edildi! We will notify you when it ships. / Göndərildikdə sizə bildirəcəyik.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    logger.info('Order confirmation SMS sent / Sifariş təsdiq SMS-i göndərildi', {
      phone,
      orderId,
      messageId: message.sid,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    logger.error('Failed to send order confirmation SMS / Sifariş təsdiq SMS-i göndərmək uğursuz oldu', error, { phone, orderId });
    return {
      success: false,
      error: error.message || 'Failed to send SMS / SMS göndərmək uğursuz oldu',
    };
  }
}

/**
 * Send shipping update SMS / Çatdırılma yeniləməsi SMS-i göndər
 * @param phone - Phone number / Telefon nömrəsi
 * @param trackingNumber - Tracking number / İzləmə nömrəsi
 * @returns Promise<SMSResult>
 */
export async function sendShippingUpdateSMS(phone: string, trackingNumber: string): Promise<SMSResult> {
  if (!isSMSConfigured()) {
    logger.warn('SMS service not configured / SMS xidməti konfiqurasiya edilməyib', { phone, trackingNumber });
    return {
      success: false,
      error: 'SMS service not configured / SMS xidməti konfiqurasiya edilməyib',
    };
  }

  try {
    const client = getTwilioClient();
    const message = await client.messages.create({
      body: `Your order has been shipped! / Sifarişiniz göndərildi! Tracking: ${trackingNumber} / İzləmə: ${trackingNumber}`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    });

    logger.info('Shipping update SMS sent / Çatdırılma yeniləməsi SMS-i göndərildi', {
      phone,
      trackingNumber,
      messageId: message.sid,
    });

    return {
      success: true,
      messageId: message.sid,
    };
  } catch (error: any) {
    logger.error('Failed to send shipping update SMS / Çatdırılma yeniləməsi SMS-i göndərmək uğursuz oldu', error, { phone, trackingNumber });
    return {
      success: false,
      error: error.message || 'Failed to send SMS / SMS göndərmək uğursuz oldu',
    };
  }
}

