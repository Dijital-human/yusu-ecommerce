/**
 * Payment Methods API Route / Ödəniş Metodları API Route-u
 * This file handles payment methods (GET, POST, DELETE)
 * Bu fayl ödəniş metodlarını idarə edir (GET, POST, DELETE)
 * 
 * Note: This is a simplified implementation. For production, consider storing
 * payment methods in the database with proper encryption.
 * Qeyd: Bu sadələşdirilmiş tətbiqdir. Production üçün ödəniş metodlarını
 * veritabanında düzgün şifrələmə ilə saxlamağı düşünün.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { logger } from "@/lib/utils/logger";
import { paymentProviderManager } from "@/lib/payments/payment-provider";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";

// GET /api/payment-methods - Get available payment methods / Mövcud ödəniş metodlarını əldə et
export async function GET(request: NextRequest) {
  try {
    // Get available payment methods from provider manager / Provider manager-dən mövcud ödəniş metodlarını al
    const availableMethods = paymentProviderManager.getAvailableMethods();

    // Payment method metadata / Ödəniş metodu metadata
    const methodMetadata: Record<string, { name: string; nameAz: string; description: string; descriptionAz: string; icon: string }> = {
      stripe: {
        name: "Credit/Debit Card",
        nameAz: "Kredit/Debet Kartı",
        description: "Pay with credit or debit card",
        descriptionAz: "Kredit və ya debet kartı ilə ödəyin",
        icon: "💳",
      },
      paypal: {
        name: "PayPal",
        nameAz: "PayPal",
        description: "Pay with PayPal",
        descriptionAz: "PayPal ilə ödəyin",
        icon: "🅿️",
      },
      apple_pay: {
        name: "Apple Pay",
        nameAz: "Apple Pay",
        description: "Pay with Apple Pay",
        descriptionAz: "Apple Pay ilə ödəyin",
        icon: "🍎",
      },
      google_pay: {
        name: "Google Pay",
        nameAz: "Google Pay",
        description: "Pay with Google Pay",
        descriptionAz: "Google Pay ilə ödəyin",
        icon: "🔵",
      },
      bank_transfer: {
        name: "Bank Transfer",
        nameAz: "Bank köçürməsi",
        description: "Transfer money to bank account",
        descriptionAz: "Pulu bank hesabına köçürün",
        icon: "🏦",
      },
      cash_on_delivery: {
        name: "Cash on Delivery",
        nameAz: "Çatdırılma zamanı nağd ödəniş",
        description: "Pay when you receive your order",
        descriptionAz: "Sifarişi aldığınız zaman ödəyin",
        icon: "💵",
      },
    };

    // Build payment methods array / Ödəniş metodları array-i qur
    const paymentMethods = availableMethods.map(method => ({
      id: method,
      ...methodMetadata[method],
      enabled: true,
    }));

    return successResponse(paymentMethods);
  } catch (error) {
    return handleApiError(error, "fetch payment methods");
  }
}

// POST /api/payment-methods - Add payment method / Ödəniş metodu əlavə et
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, cardNumber, expiryDate, cvv, nameOnCard } = body;

    // Validate input / Girişi yoxla
    if (!type || !cardNumber || !expiryDate || !cvv || !nameOnCard) {
      return NextResponse.json(
        { success: false, error: "All payment method fields are required / Bütün ödəniş metodu sahələri tələb olunur" },
        { status: 400 }
      );
    }

    // In production, integrate with Stripe or other payment processor
    // Production-da Stripe və ya digər ödəniş prosessorları ilə inteqrasiya edin
    const mockPaymentMethod = {
      id: `pm_${Date.now()}`,
      type: type,
      last4: cardNumber.slice(-4),
      brand: "visa", // In production, detect from card number
      isDefault: false,
    };

    return NextResponse.json({
      success: true,
      data: mockPaymentMethod,
      message: "Payment method added successfully / Ödəniş metodu uğurla əlavə edildi",
    });
  } catch (error) {
    logger.error("Error adding payment method", error);
    return NextResponse.json(
      { success: false, error: "Failed to add payment method / Ödəniş metodu əlavə etmək uğursuz" },
      { status: 500 }
    );
  }
}

// DELETE /api/payment-methods - Remove payment method / Ödəniş metodunu sil
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get("id");

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: "Payment method ID is required / Ödəniş metodu ID tələb olunur" },
        { status: 400 }
      );
    }

    // In production, delete from database or payment processor
    // Production-da veritabanından və ya ödəniş prosessorundan silin

    return NextResponse.json({
      success: true,
      message: "Payment method deleted successfully / Ödəniş metodu uğurla silindi",
    });
  } catch (error) {
    logger.error("Error deleting payment method", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete payment method / Ödəniş metodunu silmək uğursuz" },
      { status: 500 }
    );
  }
}

