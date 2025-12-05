/**
 * Products API Route v1 / Məhsullar API Route-u v1
 * This file handles CRUD operations for products (v1)
 * Bu fayl məhsullar üçün CRUD əməliyyatlarını idarə edir (v1)
 */

import { NextRequest } from "next/server";
import { requireAuth, requireSeller } from "@/lib/api/middleware";
import { parsePagination, createPaginationInfo } from "@/lib/api/pagination";
import { successResponseWithPagination, successResponse, badRequestResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { cache, cacheKeys } from "@/lib/cache/cache-wrapper";
import { getProductsWithFilters } from "@/lib/db/queries/product-queries";
import { createProduct } from "@/services/product.service";
import { traceFunction } from "@/lib/monitoring/tracing";
import { withVersioning, DEFAULT_VERSION } from "@/lib/api/version-middleware";
import { validateProductName, validateProductDescription, validatePrice, validateRequiredFields } from "@/lib/validators/product-validators";

// GET /api/v1/products - Get all products / Bütün məhsulları əldə et
async function GETHandler(request: NextRequest, version: string) {
  return traceFunction('api.v1.products.GET', async (span) => {
    try {
      span.setAttribute('http.method', 'GET');
      span.setAttribute('http.route', '/api/v1/products');
      span.setAttribute('api.version', version);
    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = parsePagination(searchParams, 12);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Build cache key from query parameters / Sorğu parametrlərindən cache açarı qur
    const cacheKey = cacheKeys.products(
      `v1:page:${page}:limit:${limit}:category:${category || 'all'}:search:${search || 'none'}:sortBy:${sortBy}:sortOrder:${sortOrder}:minPrice:${minPrice || 'none'}:maxPrice:${maxPrice || 'none'}`
    );

    // Try to get from cache first / Əvvəlcə cache-dən almağa cəhd et
    const cachedResult = await cache.get<{
      products: any[];
      total: number;
      pagination: any;
    }>(cacheKey);

    if (cachedResult) {
      return successResponseWithPagination(cachedResult.products, cachedResult.pagination);
    }

    // Use query helper to get products / Məhsulları almaq üçün query helper istifadə et
    let result;
    try {
      result = await getProductsWithFilters(
        {
          categoryId: category || undefined,
          search: search || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          sortBy: sortBy,
          sortOrder: sortOrder as "asc" | "desc",
        },
        page,
        limit
      );
    } catch (error) {
      // If query fails, return empty result / Əgər sorğu uğursuz olarsa, boş nəticə qaytar
      result = {
        products: [],
        total: 0,
      };
    }

    const pagination = createPaginationInfo(page, limit, result.total || 0);
    
    // Cache result for 1 hour (3600 seconds) / Nəticəni 1 saat (3600 saniyə) cache et
    try {
      await cache.set(cacheKey, {
        products: result.products || [],
        total: result.total || 0,
        pagination,
      }, 3600);
    } catch (cacheError) {
      // Ignore cache errors / Cache xətalarını ignore et
    }

      return successResponseWithPagination(result.products || [], pagination);
    } catch (error) {
      return handleApiError(error, "fetch products");
    }
  });
}

// POST /api/v1/products - Create new product / Yeni məhsul yarat
async function POSTHandler(request: NextRequest, version: string) {
  return traceFunction('api.v1.products.POST', async (span) => {
    try {
      span.setAttribute('http.method', 'POST');
      span.setAttribute('http.route', '/api/v1/products');
      span.setAttribute('api.version', version);
      span.setAttribute('http.url', request.url);
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is seller or admin / İstifadəçinin satıcı və ya admin olduğunu yoxla
    const roleCheck = requireSeller(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const {
      name,
      description,
      price,
      images,
      categoryId,
      stock,
    } = body;

    // Validate required fields using helper / Helper istifadə edərək tələb olunan sahələri yoxla
    const requiredFieldsCheck = validateRequiredFields(body, ['name', 'description', 'price', 'categoryId']);
    if (!requiredFieldsCheck.isValid) {
      return badRequestResponse(
        `Missing required fields: ${requiredFieldsCheck.missingFields.join(', ')} / Tələb olunan sahələr çatışmır: ${requiredFieldsCheck.missingFields.join(', ')}`
      );
    }

    // Validate product name / Məhsul adını yoxla
    if (!validateProductName(name)) {
      return badRequestResponse("Invalid product name. Must be between 3 and 200 characters / Yanlış məhsul adı. 3-200 simvol arası olmalıdır");
    }

    // Validate product description / Məhsul təsvirini yoxla
    if (!validateProductDescription(description)) {
      return badRequestResponse("Invalid product description. Must be between 10 and 5000 characters / Yanlış məhsul təsviri. 10-5000 simvol arası olmalıdır");
    }

    // Validate price / Qiyməti yoxla
    if (!validatePrice(price)) {
      return badRequestResponse("Invalid price. Must be a positive number / Yanlış qiymət. Müsbət rəqəm olmalıdır");
    }

    // Create product using service layer / Service layer istifadə edərək məhsul yarat
    const product = await createProduct({
      name,
      description,
      price,
      images,
      categoryId,
      stock: parseInt(stock) || 0,
    }, user.id);

      return successResponse(product, "Product created successfully / Məhsul uğurla yaradıldı");
    } catch (error) {
      return handleApiError(error, "create product");
    }
  });
}

// Export versioned handlers / Versiyalaşdırılmış handler-ləri export et
export const GET = withVersioning(GETHandler);
export const POST = withVersioning(POSTHandler);

