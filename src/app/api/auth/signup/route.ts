/**
 * Signup API Route / Qeydiyyat API Route-u
 * This endpoint handles user registration
 * Bu endpoint istifadəçi qeydiyyatını idarə edir
 */

import { NextRequest } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { successResponse, badRequestResponse } from "@/lib/api/response";
import { validateEmail } from "@/lib/api/validators";
import { validateRequiredFields } from "@/lib/validators/product-validators";
import { createUser } from "@/services/user.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      password, 
      role = "CUSTOMER",
      phone
    } = body;

    // Validate required fields using helper / Helper ilə tələb olunan sahələri yoxla
    const requiredFieldsValidation = validateRequiredFields(body, ['name', 'password']);
    if (!requiredFieldsValidation.isValid) {
      return badRequestResponse(
        `Missing required fields: ${requiredFieldsValidation.missingFields.join(', ')} / Tələb olunan sahələr çatışmır: ${requiredFieldsValidation.missingFields.join(', ')}`
      );
    }

    // Validate email if provided / Əgər təmin olunubsa email-i yoxla
    let validatedEmailValue = email;
    if (email) {
      const validatedEmail = validateEmail(email);
      if (validatedEmail instanceof Response) {
        return validatedEmail;
      }
      validatedEmailValue = validatedEmail;
    }

    // Create user using service layer / Service layer istifadə edərək istifadəçi yarat
    const user = await createUser({
      name,
      email: validatedEmailValue,
      password, // Password will be hashed in createUser function / Şifrə createUser funksiyasında hash olunacaq
      role,
      phone,
    });

    return successResponse(
      { 
        user,
        message: "Account created successfully! Please check your email to verify your account. / Hesab uğurla yaradıldı! Zəhmət olmasa hesabınızı təsdiq etmək üçün email-inizi yoxlayın."
      },
      "User created successfully. Please check your email for verification link. / İstifadəçi uğurla yaradıldı. Zəhmət olmasa təsdiq linki üçün email-inizi yoxlayın."
    );
  } catch (error) {
    return handleApiError(error, "signup");
  }
}
