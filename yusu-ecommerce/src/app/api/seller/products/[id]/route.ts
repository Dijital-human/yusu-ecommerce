import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

/**
 * DELETE /api/seller/products/[id]
 * Deletes a product for the authenticated seller.
 * Authenticated user must be a SELLER and own the product.
 *
 * @param {Request} req - The incoming request.
 * @param {Object} params - Route parameters containing the product ID.
 * @returns {NextResponse} - A response indicating success or error.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized / icazəsiz giriş" }, { status: 401 });
    }

    const productId = params.id;

    // Check if product exists and belongs to the seller
    // Məhsulun mövcudluğunu və satıcıya aid olduğunu yoxla
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found / Məhsul tapılmadı" }, { status: 404 });
    }

    if (existingProduct.sellerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to delete this product / Bu məhsulu silmək üçün icazəniz yoxdur" }, { status: 403 });
    }

    // Soft delete by setting isActive to false
    // Yumşaq silmə - isActive-i false et
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Product deleted successfully / Məhsul uğurla silindi" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}

/**
 * GET /api/seller/products/[id]
 * Fetches a specific product for the authenticated seller.
 * Authenticated user must be a SELLER and own the product.
 *
 * @param {Request} req - The incoming request.
 * @param {Object} params - Route parameters containing the product ID.
 * @returns {NextResponse} - A response containing the product or an error.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized / icazəsiz giriş" }, { status: 401 });
    }

    const productId = params.id;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found / Məhsul tapılmadı" }, { status: 404 });
    }

    if (product.sellerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to view this product / Bu məhsula baxmaq üçün icazəniz yoxdur" }, { status: 403 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ message: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}

/**
 * PUT /api/seller/products/[id]
 * Updates a product for the authenticated seller.
 * Authenticated user must be a SELLER and own the product.
 *
 * @param {Request} req - The incoming request.
 * @param {Object} params - Route parameters containing the product ID.
 * @returns {NextResponse} - A response containing the updated product or an error.
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SELLER") {
      return NextResponse.json({ message: "Unauthorized / icazəsiz giriş" }, { status: 401 });
    }

    const productId = params.id;
    const body = await req.json();

    // Check if product exists and belongs to the seller
    // Məhsulun mövcudluğunu və satıcıya aid olduğunu yoxla
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found / Məhsul tapılmadı" }, { status: 404 });
    }

    if (existingProduct.sellerId !== session.user.id) {
      return NextResponse.json({ message: "Unauthorized to update this product / Bu məhsulu yeniləmək üçün icazəniz yoxdur" }, { status: 403 });
    }

    // Update product
    // Məhsulu yenilə
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        images: body.images,
        categoryId: body.categoryId,
        stock: body.stock,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: "Internal server error / Daxili server xətası" }, { status: 500 });
  }
}
