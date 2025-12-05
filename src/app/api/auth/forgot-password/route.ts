/**
 * Forgot Password API Route / Şifrə Unutma API Route-u
 * This endpoint handles password reset requests
 * Bu endpoint şifrə sıfırlama sorğularını idarə edir
 */

import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { forgotPassword } from "@/services/user.service";

const SUCCESS_MESSAGE = "If an account with that email exists, a password reset link has been sent / Əgər həmin email ilə hesab varsa, şifrə sıfırlama linki göndərildi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input / Girişi yoxla
    const validatedData = forgotPasswordSchema.parse(body);
    const { email } = validatedData;

    // Request password reset using service layer / Service layer istifadə edərək şifrə sıfırlama sorğusu göndər
    // Service layer always returns success to prevent email enumeration / Service layer email siyahıya almağın qarşısını almaq üçün həmişə uğur qaytarır
    await forgotPassword(email);

    return successResponse(null, SUCCESS_MESSAGE);
  } catch (error) {
    return handleApiError(error, "forgot password");
  }
}
