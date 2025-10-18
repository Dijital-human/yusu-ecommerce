import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

// Profile update schema / Profil yeniləmə sxemi
const profileSchema = z.object({
  name: z.string().min(1, "Name is required / Ad tələb olunur"),
  phone: z.string().min(1, "Phone is required / Telefon tələb olunur"),
  address: z.string().min(1, "Address is required / Ünvan tələb olunur"),
  vehicleType: z.string().min(1, "Vehicle type is required / Nəqliyyat növü tələb olunur"),
  licenseNumber: z.string().min(1, "License number is required / Lisenziya nömrəsi tələb olunur"),
});

/**
 * GET /api/courier/profile
 * Fetches the profile of the authenticated courier.
 * Authenticated user must be a COURIER.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response containing courier profile or an error.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "COURIER") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const courier = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!courier) {
      return NextResponse.json({ error: "Courier not found / Kuryer tapılmadı" }, { status: 404 });
    }

    // Get courier stats
    // Kuryer statistikalarını al
    const totalDeliveries = await prisma.order.count({
      where: { courierId: session.user.id },
    });

    const completedDeliveries = await prisma.order.count({
      where: { 
        courierId: session.user.id,
        status: OrderStatus.DELIVERED,
      },
    });

    const earningsResult = await prisma.order.aggregate({
      where: {
        courierId: session.user.id,
        status: OrderStatus.DELIVERED,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalEarnings = earningsResult._sum.totalAmount || 0;

    // Placeholder for average rating
    // Orta reytinq üçün yer tutucu
    const averageRating = 4.5;

    // For now, we'll use placeholder values for courier-specific fields
    // İndi üçün kuryerə xas sahələr üçün yer tutucu dəyərlər istifadə edəcəyik
    const profile = {
      id: courier.id,
      name: courier.name || "",
      email: courier.email || "",
      phone: courier.phone || "",
      address: "123 Main St, City, State", // Placeholder / Yer tutucu
      vehicleType: "Motorcycle", // Placeholder / Yer tutucu
      licenseNumber: "ABC123456", // Placeholder / Yer tutucu
      isActive: courier.isActive,
      createdAt: courier.createdAt.toISOString(),
      stats: {
        totalDeliveries,
        completedDeliveries,
        averageRating,
        totalEarnings,
      },
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching courier profile:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}

/**
 * PUT /api/courier/profile
 * Updates the profile of the authenticated courier.
 * Authenticated user must be a COURIER.
 *
 * @param {NextRequest} req - The incoming request.
 * @returns {NextResponse} - A response indicating success or an error.
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "COURIER") {
      return NextResponse.json({ error: "Unauthorized / Yetkisiz" }, { status: 401 });
    }

    const body = await request.json();
    const validatedFields = profileSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json({ 
        error: "Validation error / Yoxlama xətası",
        details: validatedFields.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { name, phone, address, vehicleType, licenseNumber } = validatedFields.data;

    // Update user profile
    // İstifadəçi profilini yenilə
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        // Note: address, vehicleType, licenseNumber would need additional fields in User model
        // Qeyd: address, vehicleType, licenseNumber User modelində əlavə sahələr tələb edəcək
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully / Profil uğurla yeniləndi",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating courier profile:", error);
    return NextResponse.json({ error: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
