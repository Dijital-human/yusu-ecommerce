/**
 * Email Automation Service / Email Avtomatlaşdırma Xidməti
 * Service functions for email automation / Email avtomatlaşdırma üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface EmailAutomationInput {
  name: string;
  triggerType: string;
  triggerConditions: any;
  templateId?: string;
  createdBy: string;
}

/**
 * Create email automation / Email avtomatlaşdırması yarat
 */
export async function createEmailAutomation(data: EmailAutomationInput) {
  try {
    const writeClient = await getWriteClient();

    const automation = await writeClient.emailAutomation.create({
      data: {
        name: data.name,
        triggerType: data.triggerType,
        triggerConditions: data.triggerConditions,
        templateId: data.templateId,
        createdBy: data.createdBy,
      },
      include: {
        template: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    logger.info("Email automation created / Email avtomatlaşdırması yaradıldı", {
      automationId: automation.id,
      name: automation.name,
    });

    return automation;
  } catch (error) {
    logger.error("Error creating email automation / Email avtomatlaşdırması yaratma xətası", {
      error,
      data,
    });
    throw error;
  }
}

/**
 * Get email automations / Email avtomatlaşdırmalarını al
 */
export async function getEmailAutomations(filters?: {
  triggerType?: string;
  isActive?: boolean;
}) {
  try {
    const readClient = await getReadClient();
    const { triggerType, isActive } = filters || {};

    const where: any = {};
    if (triggerType) {
      where.triggerType = triggerType;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const automations = await readClient.emailAutomation.findMany({
      where,
      include: {
        template: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workflows: {
          orderBy: {
            stepOrder: "asc",
          },
          include: {
            template: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return automations;
  } catch (error) {
    logger.error("Error fetching email automations / Email avtomatlaşdırmalarını alma xətası", {
      error,
    });
    throw error;
  }
}

/**
 * Process automation trigger / Avtomatlaşdırma triggerini işlə
 */
export async function processAutomationTrigger(
  triggerType: string,
  userId: string,
  context: any
) {
  try {
    const readClient = await getReadClient();

    // Find active automations for this trigger type / Bu trigger tipi üçün aktiv avtomatlaşdırmaları tap
    const automations = await readClient.emailAutomation.findMany({
      where: {
        triggerType,
        isActive: true,
      },
      include: {
        workflows: {
          orderBy: {
            stepOrder: "asc",
          },
          include: {
            template: true,
          },
        },
      },
    });

    // Process each automation / Hər avtomatlaşdırması işlə
    for (const automation of automations) {
      // Check trigger conditions / Trigger şərtlərini yoxla
      const conditionsMet = checkTriggerConditions(
        automation.triggerConditions,
        context
      );

      if (conditionsMet) {
        // Process workflows / İş axınlarını işlə
        for (const workflow of automation.workflows) {
          // TODO: Schedule email sending based on delayDays / delayDays-ə əsasən email göndərməni planlaşdır
          logger.info("Automation workflow triggered / Avtomatlaşdırma iş axını trigger edildi", {
            automationId: automation.id,
            workflowId: workflow.id,
            userId,
          });
        }
      }
    }
  } catch (error) {
    logger.error("Error processing automation trigger / Avtomatlaşdırma triggerini işləmə xətası", {
      error,
      triggerType,
      userId,
    });
    throw error;
  }
}

/**
 * Check trigger conditions / Trigger şərtlərini yoxla
 */
function checkTriggerConditions(conditions: any, context: any): boolean {
  // TODO: Implement condition checking logic / Şərt yoxlama məntiqini tətbiq et
  return true;
}

