/**
 * Admin Notification Templates API Route / Admin Bildiriş Şablonları API Route-u
 * This endpoint handles notification templates management
 * Bu endpoint bildiriş şablonlarının idarəetməsini idarə edir
 * 
 * NOTE: This API is for yusu-admin project to consume
 * QEYD: Bu API yusu-admin proyekti tərəfindən istifadə olunur
 */

import { NextRequest } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api/middleware";
import { successResponse, badRequestResponse, notFoundResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import { logger } from "@/lib/utils/logger";

// For now, we'll use a simple in-memory storage for templates
// Production-da bu Prisma schema-da NotificationTemplate model olmalıdır
// Hal-hazırda sadə in-memory storage istifadə edəcəyik
// Production-da bu Prisma schema-da NotificationTemplate model olmalıdır

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  variables?: string[]; // Template variables like {{name}}, {{orderId}}
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (production-da database-də olmalıdır)
const templates: Map<string, NotificationTemplate> = new Map();

// GET /api/admin/notifications/templates - Get all templates / Bütün şablonları al
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const templatesArray = Array.from(templates.values());

    logger.info('Admin fetched notification templates / Admin bildiriş şablonlarını əldə etdi', {
      adminId: user.id,
      count: templatesArray.length,
    });

    return successResponse(templatesArray);
  } catch (error) {
    return handleApiError(error, "fetch notification templates");
  }
}

// POST /api/admin/notifications/templates - Create template / Şablon yarat
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { name, title, message, type = "info", variables = [] } = body;

    // Validate required fields / Tələb olunan sahələri yoxla
    if (!name || !title || !message) {
      return badRequestResponse("Name, title, and message are required / Ad, başlıq və mesaj tələb olunur");
    }

    const templateId = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const template: NotificationTemplate = {
      id: templateId,
      name,
      title,
      message,
      type,
      variables,
      createdAt: now,
      updatedAt: now,
    };

    templates.set(templateId, template);

    logger.info('Admin created notification template / Admin bildiriş şablonu yaratdı', {
      adminId: user.id,
      templateId,
      name,
    });

    return successResponse(template, "Template created successfully / Şablon uğurla yaradıldı");
  } catch (error) {
    return handleApiError(error, "create notification template");
  }
}

// PUT /api/admin/notifications/templates - Update template / Şablon yenilə
export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const body = await request.json();
    const { id, name, title, message, type, variables } = body;

    if (!id) {
      return badRequestResponse("Template ID is required / Şablon ID tələb olunur");
    }

    const existingTemplate = templates.get(id);
    if (!existingTemplate) {
      return notFoundResponse("Template not found / Şablon tapılmadı");
    }

    const updatedTemplate: NotificationTemplate = {
      ...existingTemplate,
      ...(name && { name }),
      ...(title && { title }),
      ...(message && { message }),
      ...(type && { type }),
      ...(variables && { variables }),
      updatedAt: new Date().toISOString(),
    };

    templates.set(id, updatedTemplate);

    logger.info('Admin updated notification template / Admin bildiriş şablonunu yenilədi', {
      adminId: user.id,
      templateId: id,
    });

    return successResponse(updatedTemplate, "Template updated successfully / Şablon uğurla yeniləndi");
  } catch (error) {
    return handleApiError(error, "update notification template");
  }
}

// DELETE /api/admin/notifications/templates - Delete template / Şablon sil
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof Response) return authResult;
    
    const { user } = authResult;
    
    // Check if user is admin / İstifadəçinin admin olduğunu yoxla
    const roleCheck = requireAdmin(user);
    if (roleCheck) return roleCheck;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return badRequestResponse("Template ID is required / Şablon ID tələb olunur");
    }

    const existingTemplate = templates.get(id);
    if (!existingTemplate) {
      return notFoundResponse("Template not found / Şablon tapılmadı");
    }

    templates.delete(id);

    logger.info('Admin deleted notification template / Admin bildiriş şablonunu sildi', {
      adminId: user.id,
      templateId: id,
    });

    return successResponse({ id }, "Template deleted successfully / Şablon uğurla silindi");
  } catch (error) {
    return handleApiError(error, "delete notification template");
  }
}

