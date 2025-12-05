/**
 * Email Campaigns Service / Email Kampaniyaları Xidməti
 * Service functions for email campaign management / Email kampaniya idarəetməsi üçün xidmət funksiyaları
 */

import { getReadClient, getWriteClient } from "@/lib/db/query-client";
import { logger } from "@/lib/utils/logger";

export interface EmailCampaignInput {
  name: string;
  subject: string;
  templateId?: string;
  content: string;
  campaignType: string;
  audienceSegment?: any;
  scheduledAt?: Date;
  createdBy: string;
}

/**
 * Create email campaign / Email kampaniyası yarat
 */
export async function createEmailCampaign(data: EmailCampaignInput) {
  try {
    const writeClient = await getWriteClient();

    const campaign = await writeClient.emailCampaign.create({
      data: {
        name: data.name,
        subject: data.subject,
        templateId: data.templateId,
        content: data.content,
        campaignType: data.campaignType,
        audienceSegment: data.audienceSegment,
        scheduledAt: data.scheduledAt,
        createdBy: data.createdBy,
        status: data.scheduledAt ? "scheduled" : "draft",
        analytics: {
          create: {
            totalSent: 0,
            totalDelivered: 0,
            totalOpened: 0,
            totalClicked: 0,
            totalBounced: 0,
            totalUnsubscribed: 0,
          },
        },
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

    logger.info("Email campaign created / Email kampaniyası yaradıldı", {
      campaignId: campaign.id,
      name: campaign.name,
    });

    return campaign;
  } catch (error) {
    logger.error("Error creating email campaign / Email kampaniyası yaratma xətası", {
      error,
      data,
    });
    throw error;
  }
}

/**
 * Get email campaigns / Email kampaniyalarını al
 */
export async function getEmailCampaigns(filters?: {
  status?: string;
  campaignType?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const readClient = await getReadClient();
    const { status, campaignType, page = 1, limit = 20 } = filters || {};

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (campaignType) {
      where.campaignType = campaignType;
    }

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      readClient.emailCampaign.findMany({
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
          analytics: true,
          _count: {
            select: {
              recipients: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      readClient.emailCampaign.count({ where }),
    ]);

    return {
      campaigns,
      pagination: {
        totalItems: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error("Error fetching email campaigns / Email kampaniyalarını alma xətası", {
      error,
    });
    throw error;
  }
}

/**
 * Get email campaign by ID / ID ilə email kampaniyasını al
 */
export async function getEmailCampaignById(campaignId: string) {
  try {
    const readClient = await getReadClient();

    const campaign = await readClient.emailCampaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        analytics: true,
        recipients: {
          take: 100,
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            recipients: true,
          },
        },
      },
    });

    return campaign;
  } catch (error) {
    logger.error("Error fetching email campaign / Email kampaniyasını alma xətası", {
      error,
      campaignId,
    });
    throw error;
  }
}

/**
 * Update email campaign status / Email kampaniyası statusunu yenilə
 */
export async function updateEmailCampaignStatus(
  campaignId: string,
  status: string
) {
  try {
    const writeClient = await getWriteClient();

    const updateData: any = { status };
    if (status === "sent") {
      updateData.sentAt = new Date();
    }

    const campaign = await writeClient.emailCampaign.update({
      where: { id: campaignId },
      data: updateData,
    });

    logger.info("Email campaign status updated / Email kampaniyası statusu yeniləndi", {
      campaignId,
      status,
    });

    return campaign;
  } catch (error) {
    logger.error(
      "Error updating email campaign status / Email kampaniyası statusunu yeniləmə xətası",
      { error, campaignId }
    );
    throw error;
  }
}

/**
 * Get email templates / Email şablonlarını al
 */
export async function getEmailTemplates(category?: string) {
  try {
    const readClient = await getReadClient();

    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    const templates = await readClient.emailTemplate.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return templates;
  } catch (error) {
    logger.error("Error fetching email templates / Email şablonlarını alma xətası", {
      error,
    });
    throw error;
  }
}

