/**
 * Email Verification API Route / Email Təsdiq API Route-u
 * This endpoint handles email verification with token
 * Bu endpoint token ilə email təsdiqini idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/error-handler";
import { validateEmail } from "@/lib/api/validators";
import { verifyEmail, sendVerificationEmail } from "@/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Verification token is required / Təsdiq token-i tələb olunur" 
        },
        { status: 400 }
      );
    }

    // Verify email using service layer / Service layer istifadə edərək email-i təsdiqlə
    await verifyEmail(token);

    return NextResponse.json({
      success: true,
      message: "Email has been verified successfully / Email uğurla təsdiq edildi",
    });

  } catch (error: any) {
    if (error.message?.includes("Invalid or expired")) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message
        },
        { status: 400 }
      );
    }
    
    const errorResponse = handleApiError(error, "verify email");
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error / Daxili server xətası" 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email using helper / Helper ilə email-i yoxla
    const validatedEmail = validateEmail(email);
    if (validatedEmail instanceof Response) {
      return NextResponse.json(
        { 
          success: false, 
          error: validatedEmail instanceof Response ? (await validatedEmail.json()).error : "Email is required / Email tələb olunur" 
        },
        { status: 400 }
      );
    }

    // Send verification email using service layer / Service layer istifadə edərək təsdiq email-i göndər
    await sendVerificationEmail(validatedEmail);

    return NextResponse.json({
      success: true,
      message: "Verification email has been sent / Təsdiq email-i göndərildi",
    });

  } catch (error: any) {
    if (error.message?.includes("User not found")) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message
        },
        { status: 404 }
      );
    }
    
    if (error.message?.includes("Failed to send")) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error / Daxili server xətası" 
      },
      { status: 500 }
    );
  }
}
