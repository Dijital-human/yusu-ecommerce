/**
 * Slack Notification Service / Slack Bildiriş Xidməti
 * Provides Slack notification functionality
 * Slack bildiriş funksionallığı təmin edir
 */

import { logger } from '@/lib/utils/logger';

/**
 * Send message to Slack / Slack-ə mesaj göndər
 */
export async function sendSlackNotification(
  message: string,
  channel?: string,
  severity: 'info' | 'warning' | 'error' = 'info'
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const defaultChannel = process.env.SLACK_DEFAULT_CHANNEL || '#alerts';

  if (!webhookUrl) {
    logger.warn('Slack webhook URL not configured. Notification skipped / Slack webhook URL konfiqurasiya edilməyib. Bildiriş atlandı');
    return false;
  }

  try {
    const color = severity === 'error' ? '#FF0000' : severity === 'warning' ? '#FFA500' : '#36A64F';
    const emoji = severity === 'error' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';

    const payload = {
      channel: channel || defaultChannel,
      username: 'Ulustore Bot',
      icon_emoji: ':shopping_cart:',
      attachments: [
        {
          color,
          title: `${emoji} Ulustore Alert`,
          text: message,
          footer: 'Ulustore E-commerce Platform',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Failed to send Slack notification / Slack bildirişi göndərmək uğursuz oldu', new Error(`HTTP ${response.status}`), { message });
      return false;
    }

    logger.info('Slack notification sent / Slack bildirişi göndərildi', { channel: channel || defaultChannel, severity });
    return true;
  } catch (error) {
    logger.error('Failed to send Slack notification / Slack bildirişi göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { message });
    return false;
  }
}

/**
 * Send alert to Slack / Slack-ə alert göndər
 */
export async function sendSlackAlert(
  title: string,
  message: string,
  severity: 'info' | 'warning' | 'error' | 'critical' = 'info',
  fields?: Array<{ title: string; value: string; short?: boolean }>
): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  const alertChannel = process.env.SLACK_ALERT_CHANNEL || process.env.SLACK_DEFAULT_CHANNEL || '#alerts';

  if (!webhookUrl) {
    logger.warn('Slack webhook URL not configured. Alert skipped / Slack webhook URL konfiqurasiya edilməyib. Alert atlandı');
    return false;
  }

  try {
    const color = severity === 'critical' || severity === 'error' ? '#FF0000' : severity === 'warning' ? '#FFA500' : '#36A64F';
    const emoji = severity === 'critical' ? '🚨' : severity === 'error' ? '❌' : severity === 'warning' ? '⚠️' : 'ℹ️';

    const payload = {
      channel: alertChannel,
      username: 'Ulustore Alert Bot',
      icon_emoji: ':rotating_light:',
      attachments: [
        {
          color,
          title: `${emoji} ${title}`,
          text: message,
          fields: fields || [],
          footer: 'Ulustore E-commerce Platform',
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error('Failed to send Slack alert / Slack alert göndərmək uğursuz oldu', new Error(`HTTP ${response.status}`), { title });
      return false;
    }

    logger.info('Slack alert sent / Slack alert göndərildi', { channel: alertChannel, severity, title });
    return true;
  } catch (error) {
    logger.error('Failed to send Slack alert / Slack alert göndərmək uğursuz oldu', error instanceof Error ? error : new Error(String(error)), { title });
    return false;
  }
}

