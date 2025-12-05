/**
 * Reset Password API Route / Şifrə Sıfırlama API Route-u
 * This endpoint handles password reset with token
 * Bu endpoint token ilə şifrə sıfırlamasını idarə edir
 */

import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { resetPassword } from "@/services/user.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input / Girişi yoxla
    const validatedData = resetPasswordSchema.parse(body);
    const { token, password } = validatedData;

    // Reset password using service layer / Service layer istifadə edərək şifrəni sıfırla
    await resetPassword(token, password);

    return successResponse(
      null,
      "Password has been reset successfully / Şifrə uğurla sıfırlandı"
    );
  } catch (error: any) {
    if (error.message?.includes("Invalid or expired")) {
      return badRequestResponse(error.message);
    }
    return handleApiError(error, "reset password");
  }
}
