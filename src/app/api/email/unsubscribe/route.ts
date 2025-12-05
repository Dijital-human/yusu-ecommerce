/**
 * Email Unsubscribe API / Email Abunəlikdən Çıxma API
 * Handles email unsubscription requests
 * Email abunəlikdən çıxma sorğularını emal edir
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const unsubscribeSchema = z.object({
  email: z.string().email(),
  token: z.string(),
  unsubscribeAll: z.boolean().optional(),
  preferences: z.object({
    newsletter: z.boolean(),
    promotions: z.boolean(),
  }).optional(),
});

/**
 * Generate unsubscribe token / Abunəlikdən çıxma token-i yarat
 */
function generateUnsubscribeToken(email: string): string {
  const secret = process.env.UNSUBSCRIBE_SECRET || "default-secret-change-in-production";
  return crypto
    .createHmac("sha256", secret)
    .update(email)
    .digest("hex");
}

/**
 * Verify unsubscribe token / Abunəlikdən çıxma token-ini yoxla
 */
function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expectedToken = generateUnsubscribeToken(email);
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}

/**
 * POST /api/email/unsubscribe
 * Unsubscribes a user from email campaigns
 * İstifadəçini email kampaniyalarından abunəlikdən çıxarır
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = unsubscribeSchema.parse(body);

    const { email, token, unsubscribeAll, preferences } = validatedData;

    // Verify token / Token-i yoxla
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json(
        { error: "Invalid token / Keçərsiz token" },
        { status: 401 }
      );
    }

    // Find user by email / Email-ə görə istifadəçini tap
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found / İstifadəçi tapılmadı" },
        { status: 404 }
      );
    }

    // Update or create subscription / Abunəliyi yenilə və ya yarat
    const subscriptionData = unsubscribeAll
      ? {
          isSubscribed: false,
          newsletter: false,
          promotions: false,
        }
      : {
          isSubscribed: preferences?.newsletter || preferences?.promotions || false,
          newsletter: preferences?.newsletter || false,
          promotions: preferences?.promotions || false,
        };

    let subscription: any;

    // Try to use Prisma model first / Əvvəlcə Prisma model istifadə etməyə cəhd et
    if ((db as any).email_subscriptions) {
      subscription = await (db as any).email_subscriptions.upsert({
        where: { userId: user.id },
        update: subscriptionData,
        create: {
          userId: user.id,
          email: user.email,
          ...subscriptionData,
        },
      });
    } else {
      // Fallback to raw SQL / Raw SQL-ə keç
      const result = await db.$queryRawUnsafe<any[]>(
        `INSERT INTO email_subscriptions (id, "userId", email, "isSubscribed", newsletter, promotions, "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, NOW(), NOW())
         ON CONFLICT ("userId") 
         DO UPDATE SET 
           "isSubscribed" = EXCLUDED."isSubscribed",
           newsletter = EXCLUDED.newsletter,
           promotions = EXCLUDED.promotions,
           "updatedAt" = NOW()
         RETURNING *`,
        user.id,
        user.email,
        subscriptionData.isSubscribed,
        subscriptionData.newsletter,
        subscriptionData.promotions
      );
      
      subscription = result[0];
    }

    // Record unsubscribe event in analytics / Abunəlikdən çıxma hadisəsini analitikada qeyd et
    try {
      if ((db as any).email_analytics) {
        await (db as any).email_analytics.create({
          data: {
            campaignId: "system", // System-wide unsubscribe / Sistem genişli abunəlikdən çıxma
            eventType: "unsubscribed",
            userId: user.id,
            email: user.email,
            metadata: JSON.stringify({ reason: unsubscribeAll ? "all" : "preferences" }),
          },
        });
      }
    } catch (error) {
      console.error("Error recording unsubscribe event:", error);
      // Don't fail the request if analytics fails / Analitika uğursuz olsa sorğunu uğursuz etmə
    }

    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully / Abunəlikdən uğurla çıxıldı",
      subscription: {
        isSubscribed: subscription.isSubscribed,
        newsletter: subscription.newsletter,
        promotions: subscription.promotions,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error / Validasiya xətası", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error unsubscribing:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe / Abunəlikdən çıxmaq uğursuz oldu" },
      { status: 500 }
    );
  }
}

