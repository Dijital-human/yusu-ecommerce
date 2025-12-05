/**
 * Marketing Automation API Route / Marketinq Avtomatlaşdırması API Route
 * Handles marketing automation operations / Marketinq avtomatlaşdırması əməliyyatlarını idarə edir
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware";
import { successResponse } from "@/lib/api/response";
import { handleApiError } from "@/lib/api/error-handler";
import {
  createMarketingAutomationWorkflow,
  addStepToWorkflow,
  getMarketingAutomationWorkflows,
  triggerMarketingAutomation,
  MarketingAutomationWorkflowInput,
  MarketingAutomationStepInput,
} from "@/lib/marketing/automation";

/**
 * GET /api/marketing/automation
 * Get marketing automation workflows / Marketinq avtomatlaşdırması iş axınlarını al
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Only admins can view automations / Yalnız adminlər avtomatlaşdırmalara baxa bilər
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      workflowType: searchParams.get("workflowType") || undefined,
      triggerType: searchParams.get("triggerType") || undefined,
      isActive: searchParams.get("isActive")
        ? searchParams.get("isActive") === "true"
        : undefined,
    };

    const workflows = await getMarketingAutomationWorkflows(filters);
    return successResponse(workflows);
  } catch (error) {
    return handleApiError(error, "get marketing automation workflows");
  }
}

/**
 * POST /api/marketing/automation
 * Create marketing automation workflow or trigger / Marketinq avtomatlaşdırması iş axını yarat və ya trigger et
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if it's a trigger request / Trigger sorğusu olub olmadığını yoxla
    if (body.trigger && body.workflowType && body.userId && body.context) {
      await triggerMarketingAutomation(
        body.workflowType,
        body.userId,
        body.context
      );
      return successResponse(
        { success: true },
        "Marketing automation triggered / Marketinq avtomatlaşdırması trigger edildi"
      );
    }

    // Create workflow (admin only) / İş axını yarat (yalnız admin)
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized / Yetkisiz" },
        { status: 403 }
      );
    }

    const { name, workflowType, triggerType, triggerConditions, steps } = body;

    if (!name || !workflowType || !triggerType || !triggerConditions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields / Tələb olunan sahələr çatışmır",
        },
        { status: 400 }
      );
    }

    const workflowData: MarketingAutomationWorkflowInput = {
      name,
      workflowType,
      triggerType,
      triggerConditions,
      createdBy: user.id,
    };

    const workflow = await createMarketingAutomationWorkflow(workflowData);

    // Add steps if provided / Əgər verilmişdirsə addımları əlavə et
    if (steps && Array.isArray(steps)) {
      for (const step of steps) {
        const stepData: MarketingAutomationStepInput = {
          workflowId: workflow.id,
          stepOrder: step.stepOrder,
          actionType: step.actionType,
          delayHours: step.delayHours,
          actionConfig: step.actionConfig,
          conditions: step.conditions,
        };
        await addStepToWorkflow(stepData);
      }
    }

    return successResponse(
      workflow,
      "Marketing automation workflow created successfully / Marketinq avtomatlaşdırması iş axını uğurla yaradıldı"
    );
  } catch (error) {
    return handleApiError(error, "create marketing automation workflow");
  }
}

