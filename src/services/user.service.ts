/**
 * User Service / İstifadəçi Xidməti
 * Business logic for user operations
 * İstifadəçi əməliyyatları üçün business logic
 */

import { prisma } from "@/lib/db";
import { validateEmail } from "@/lib/api/validators";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { sendPasswordReset, sendEmailVerification } from "@/lib/email";
import { logger } from "@/lib/utils/logger";
import { UserRole } from "@/types";
import { emitUserRegistered, emitUserUpdated, emitUserDeleted, emitUserLogin, emitUserLogout } from "@/lib/events/user-events";

/**
 * Create new user / Yeni istifadəçi yarat
 */
export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  role?: UserRole | string;
  phone?: string;
}) {
  // Validate email / Email-i yoxla
  const validatedEmail = validateEmail(data.email);
  if (validatedEmail instanceof Response) {
    throw new Error("Invalid email / Etibarsız email");
  }

  // Check if user already exists / İstifadəçinin artıq mövcud olub-olmadığını yoxla
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedEmail }
  });

  if (existingUser) {
    throw new Error("User with this email already exists / Bu e-poçt ilə istifadəçi artıq mövcuddur");
  }

  // Validate and normalize role / Role-u yoxla və normallaşdır
  const normalizedRole = (data.role || "CUSTOMER").toUpperCase() as UserRole;

  // Hash password if provided / Əgər şifrə verilibsə hash et
  let passwordHash: string | null = null;
  if (data.password) {
    passwordHash = await hash(data.password, 12);
  }

  // Generate email verification token / Email təsdiq token-i yarat
  const crypto = require('crypto');
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours / 24 saat

  // Create user / İstifadəçi yarat
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: validatedEmail,
      role: normalizedRole,
      phone: data.phone || null,
      passwordHash: passwordHash,
      isActive: true,
      emailVerified: false,
      emailVerificationToken: emailVerificationToken,
      emailVerificationTokenExpiry: emailVerificationTokenExpiry,
    },
  });

  // Send email verification email / Email təsdiq email-i göndər
  try {
    await sendEmailVerification({
      email: user.email,
      token: emailVerificationToken,
      name: user.name || undefined,
    });
    logger.info("Email verification sent / Email təsdiq göndərildi", { email: user.email });
  } catch (emailError) {
    logger.error("Failed to send verification email / Təsdiq email-i göndərilmədi", emailError instanceof Error ? emailError : new Error(String(emailError)), { email: user.email });
    // Don't throw error - user is created, email can be resent later / Xəta atma - istifadəçi yaradıldı, email sonra yenidən göndərilə bilər
  }

  // Emit user registered event / İstifadəçi qeydiyyatdan keçdi event-i emit et
  try {
    emitUserRegistered(user);
  } catch (eventError) {
    logger.error("Failed to emit user registered event / İstifadəçi qeydiyyatdan keçdi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { userId: user.id });
  }

  // Remove password and tokens from response / Cavabdan şifrə və token-ləri çıxar
  const { passwordHash: _, emailVerificationToken: __, ...userWithoutPassword } = user;

  return userWithoutPassword;
}

/**
 * Reset password with token / Token ilə şifrəni sıfırla
 */
export async function resetPassword(token: string, password: string) {
  // Find user with valid reset token / Etibarlı sıfırlama token-i olan istifadəçini tap
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(), // Token hasn't expired / Token müddəti bitməyib
      },
      isActive: true,
    },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token / Yanlış və ya müddəti bitmiş sıfırlama token-i");
  }

  // Hash new password / Yeni şifrəni hash et
  const hashedPassword = await hash(password, 12);

  // Update user password and clear reset token / İstifadəçi şifrəsini yenilə və sıfırlama token-ini təmizlə
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    },
  });

  // Emit user updated event / İstifadəçi yeniləndi event-i emit et
  try {
    emitUserUpdated(user.id, {
      passwordReset: true,
    });
  } catch (eventError) {
    logger.error("Failed to emit user updated event / İstifadəçi yeniləndi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { userId: user.id });
  }
}

/**
 * Verify email with token / Token ilə email-i təsdiqlə
 */
export async function verifyEmail(token: string) {
  // Find user with verification token / Təsdiq token-i olan istifadəçini tap
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationTokenExpiry: {
        gt: new Date(), // Token hasn't expired / Token müddəti bitməyib
      },
      isActive: true,
    },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token / Yanlış və ya müddəti bitmiş təsdiq token-i");
  }

  // Check if already verified / Artıq təsdiqlənibmi yoxla
  if (user.emailVerified) {
    throw new Error("Email is already verified / Email artıq təsdiqlənib");
  }

  // Update user to mark email as verified / İstifadəçini email təsdiqlənmiş kimi işarələ
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
      updatedAt: new Date(),
    },
  });

  // Emit user updated event / İstifadəçi yeniləndi event-i emit et
  try {
    emitUserUpdated(user.id, {
      emailVerified: true,
    });
  } catch (eventError) {
    logger.error("Failed to emit user updated event / İstifadəçi yeniləndi event-i emit etmək uğursuz oldu", eventError instanceof Error ? eventError : new Error(String(eventError)), { userId: user.id });
  }
}

/**
 * Send verification email / Təsdiq email-i göndər
 */
export async function sendVerificationEmail(email: string) {
  // Check if user exists / İstifadəçinin mövcud olub-olmadığını yoxla
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found / İstifadəçi tapılmadı");
  }

  // Check if already verified / Artıq təsdiqlənibmi yoxla
  if (user.emailVerified) {
    throw new Error("Email is already verified / Email artıq təsdiqlənib");
  }

  // Generate verification token / Təsdiq token-i yarat
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours / 24 saat

  // Save verification token to database / Təsdiq token-ini veritabanına saxla
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: tokenExpiry,
    },
  });

  // Send verification email / Təsdiq email-i göndər
  const emailResult = await sendEmailVerification({
    email: user.email,
    token: verificationToken,
    name: user.name || undefined,
  });

  if (!emailResult.success) {
    logger.error('Failed to send verification email / Təsdiq email-i göndərilmədi', new Error(emailResult.error || 'Unknown error'), { email: user.email });
    throw new Error("Failed to send verification email / Təsdiq email-i göndərilmədi");
  }
}

/**
 * Request password reset / Şifrə sıfırlama sorğusu
 */
export async function forgotPassword(email: string) {
  // Check if user exists / İstifadəçinin mövcud olub-olmadığını yoxla
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
    },
  });

  // Always return success to prevent email enumeration / Email siyahıya almağın qarşısını almaq üçün həmişə uğur qaytar
  if (!user || !user.isActive) {
    return; // Don't throw error to prevent email enumeration / Email siyahıya almağın qarşısını almaq üçün xəta atma
  }

  // Generate reset token / Sıfırlama token-i yarat
  const resetToken = randomBytes(32).toString('hex');
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour / 1 saat

  // Save reset token to database / Sıfırlama token-ini veritabanına saxla
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // Send password reset email / Şifrə sıfırlama email-i göndər
  const emailResult = await sendPasswordReset({
    email: user.email,
    token: resetToken,
    name: user.name || undefined,
  });

  if (!emailResult.success) {
    logger.error('Failed to send password reset email', emailResult.error, { email: user.email });
    // Don't throw error to prevent exposing email sending errors / Email göndərmə xətalarını açıqlamaqdan qaçınmaq üçün xəta atma
  }
}

/**
 * Get user addresses / İstifadəçi ünvanlarını al
 */
export async function getUserAddresses(userId: string) {
  const addresses = await prisma.address.findMany({
    where: {
      userId,
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return addresses;
}

/**
 * Create user address / İstifadəçi ünvanı yarat
 */
export async function createAddress(userId: string, data: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}) {
  // Validate required fields / Tələb olunan sahələri yoxla
  if (!data.street || !data.city || !data.state || !data.zipCode || !data.country) {
    throw new Error("All address fields are required / Bütün ünvan sahələri tələb olunur");
  }

  // If this is set as default, unset other default addresses / Bu default olaraq təyin olunubsa, digər default ünvanları ləğv et
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Create new address / Yeni ünvan yarat
  const address = await prisma.address.create({
    data: {
      userId,
      street: data.street.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      zipCode: data.zipCode.trim(),
      country: data.country.trim(),
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      isDefault: data.isDefault || false,
    },
  });

  return address;
}

/**
 * Update user address / İstifadəçi ünvanını yenilə
 */
export async function updateAddress(
  userId: string,
  addressId: string,
  data: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }
) {
  // Check if address exists and belongs to user / Ünvanın mövcud olduğunu və istifadəçiyə aid olduğunu yoxla
  const existingAddress = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!existingAddress) {
    throw new Error("Address not found / Ünvan tapılmadı");
  }

  if (existingAddress.userId !== userId) {
    throw new Error("You can only update your own addresses / Yalnız öz ünvanlarınızı yeniləyə bilərsiniz");
  }

  // If this is set as default, unset other default addresses / Bu default olaraq təyin olunubsa, digər default ünvanları ləğv et
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
        id: { not: addressId },
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Update address / Ünvanı yenilə
  const updateData: Record<string, any> = {};
  if (data.street !== undefined) updateData.street = data.street.trim();
  if (data.city !== undefined) updateData.city = data.city.trim();
  if (data.state !== undefined) updateData.state = data.state.trim();
  if (data.zipCode !== undefined) updateData.zipCode = data.zipCode.trim();
  if (data.country !== undefined) updateData.country = data.country.trim();
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

  const updatedAddress = await prisma.address.update({
    where: { id: addressId },
    data: updateData,
  });

  return updatedAddress;
}

/**
 * Delete user address / İstifadəçi ünvanını sil
 */
export async function deleteAddress(userId: string, addressId: string) {
  // Check if address exists and belongs to user / Ünvanın mövcud olduğunu və istifadəçiyə aid olduğunu yoxla
  const existingAddress = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!existingAddress) {
    throw new Error("Address not found / Ünvan tapılmadı");
  }

  if (existingAddress.userId !== userId) {
    throw new Error("You can only delete your own addresses / Yalnız öz ünvanlarınızı silə bilərsiniz");
  }

  // Delete address / Ünvanı sil
  await prisma.address.delete({
    where: { id: addressId },
  });
}

/**
 * Get address by ID / ID ilə ünvanı al
 */
export async function getAddressById(userId: string, addressId: string) {
  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    throw new Error("Address not found / Ünvan tapılmadı");
  }

  if (address.userId !== userId) {
    throw new Error("You can only view your own addresses / Yalnız öz ünvanlarınızı görə bilərsiniz");
  }

  return address;
}

