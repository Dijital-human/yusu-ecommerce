/**
 * Loyalty Program Enhancements / Sədaqət Proqramı Təkmilləşdirmələri
 * Enhanced features for loyalty program / Sədaqət proqramı üçün təkmilləşdirilmiş funksiyalar
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { earnPoints, getUserPoints } from './points-manager';
import { logger } from '@/lib/utils/logger';

/**
 * Check and award birthday reward / Doğum günü mükafatını yoxla və ver
 */
export async function checkAndAwardBirthdayReward(userId: string) {
  try {
    const readClient = await getReadClient();
    const user = await (readClient as any).user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        birthday: true,
        lastBirthdayReward: true,
        email: true,
        name: true,
      },
    });

    if (!user || !user.birthday) {
      return { awarded: false, reason: 'No birthday set / Doğum günü təyin edilməyib' };
    }

    const today = new Date();
    const birthday = new Date(user.birthday);
    const lastReward = user.lastBirthdayReward ? new Date(user.lastBirthdayReward) : null;

    // Check if birthday is today / Doğum gününün bu gün olub olmadığını yoxla
    const isBirthdayToday = birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();

    // Check if reward was already given this year / Mükafatın bu il artıq verilib-verilmədiyini yoxla
    const rewardGivenThisYear = lastReward && lastReward.getFullYear() === today.getFullYear();

    if (!isBirthdayToday || rewardGivenThisYear) {
      return { awarded: false, reason: 'Not birthday or already rewarded / Doğum günü deyil və ya artıq mükafat verilib' };
    }

    // Get loyalty program / Sədaqət proqramını al
    const program = await (readClient as any).loyaltyProgram.findFirst({
      where: { isActive: true },
    });

    if (!program || !program.birthdayRewardPoints) {
      return { awarded: false, reason: 'Birthday reward not configured / Doğum günü mükafatı konfiqurasiya edilməyib' };
    }

    // Award birthday points / Doğum günü xallarını ver
    await earnPoints(
      userId,
      program.birthdayRewardPoints,
      'birthday',
      `Birthday reward / Doğum günü mükafatı`
    );

    // Update last birthday reward date / Son doğum günü mükafatı tarixini yenilə
    const writeClient = await getWriteClient();
    await (writeClient as any).user.update({
      where: { id: userId },
      data: {
        lastBirthdayReward: today,
      },
    });

    logger.info('Birthday reward awarded / Doğum günü mükafatı verildi', {
      userId,
      points: program.birthdayRewardPoints,
    });

    return { awarded: true, points: program.birthdayRewardPoints };
  } catch (error) {
    logger.error('Failed to check and award birthday reward / Doğum günü mükafatını yoxlamaq və vermək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Check and award anniversary reward / İldönümü mükafatını yoxla və ver
 */
export async function checkAndAwardAnniversaryReward(userId: string) {
  try {
    const readClient = await getReadClient();
    const user = await (readClient as any).user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        createdAt: true,
        lastAnniversaryReward: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return { awarded: false, reason: 'User not found / İstifadəçi tapılmadı' };
    }

    const today = new Date();
    const accountCreated = new Date(user.createdAt);
    const lastReward = user.lastAnniversaryReward ? new Date(user.lastAnniversaryReward) : null;

    // Calculate years since account creation / Hesab yaradılmasından neçə il keçdiyini hesabla
    const yearsSinceCreation = today.getFullYear() - accountCreated.getFullYear();
    const monthDiff = today.getMonth() - accountCreated.getMonth();
    const dayDiff = today.getDate() - accountCreated.getDate();

    // Check if anniversary is today (same month and day) / İldönümünün bu gün olub olmadığını yoxla (eyni ay və gün)
    const isAnniversaryToday = monthDiff === 0 && dayDiff === 0 && yearsSinceCreation > 0;

    // Check if reward was already given this year / Mükafatın bu il artıq verilib-verilmədiyini yoxla
    const rewardGivenThisYear = lastReward && lastReward.getFullYear() === today.getFullYear();

    if (!isAnniversaryToday || rewardGivenThisYear) {
      return { awarded: false, reason: 'Not anniversary or already rewarded / İldönümü deyil və ya artıq mükafat verilib' };
    }

    // Get loyalty program / Sədaqət proqramını al
    const program = await (readClient as any).loyaltyProgram.findFirst({
      where: { isActive: true },
    });

    if (!program || !program.anniversaryRewardPoints) {
      return { awarded: false, reason: 'Anniversary reward not configured / İldönümü mükafatı konfiqurasiya edilməyib' };
    }

    // Calculate reward points (can be multiplied by years) / Mükafat xallarını hesabla (illərə vurula bilər)
    const rewardPoints = program.anniversaryRewardPoints * yearsSinceCreation;

    // Award anniversary points / İldönümü xallarını ver
    await earnPoints(
      userId,
      rewardPoints,
      'anniversary',
      `${yearsSinceCreation} year anniversary reward / ${yearsSinceCreation} il ildönümü mükafatı`
    );

    // Update last anniversary reward date / Son ildönümü mükafatı tarixini yenilə
    const writeClient = await getWriteClient();
    await (writeClient as any).user.update({
      where: { id: userId },
      data: {
        lastAnniversaryReward: today,
      },
    });

    logger.info('Anniversary reward awarded / İldönümü mükafatı verildi', {
      userId,
      years: yearsSinceCreation,
      points: rewardPoints,
    });

    return { awarded: true, points: rewardPoints, years: yearsSinceCreation };
  } catch (error) {
    logger.error('Failed to check and award anniversary reward / İldönümü mükafatını yoxlamaq və vermək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Award special event bonus / Xüsusi tədbir bonusu ver
 */
export async function awardSpecialEventBonus(
  userId: string,
  eventId: string,
  eventName: string,
  points: number
) {
  try {
    const readClient = await getReadClient();
    const user = await (readClient as any).user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error('User not found / İstifadəçi tapılmadı');
    }

    // Check if user already received this event bonus / İstifadəçinin bu tədbir bonusunu artıq alıb-almadığını yoxla
    const existingTransaction = await (readClient as any).pointsTransaction.findFirst({
      where: {
        userId,
        eventId,
        type: 'event',
      },
    });

    if (existingTransaction) {
      return { awarded: false, reason: 'Event bonus already awarded / Tədbir bonusu artıq verilib' };
    }

    // Award event points / Tədbir xallarını ver
    await earnPoints(
      userId,
      points,
      'event',
      `Special event: ${eventName} / Xüsusi tədbir: ${eventName}`
    );

    // Update transaction with event ID / Əməliyyatı tədbir ID-si ilə yenilə
    const writeClient = await getWriteClient();
    await (writeClient as any).pointsTransaction.updateMany({
      where: {
        userId,
        type: 'event',
        description: { contains: eventName },
      },
      data: {
        eventId,
      },
    });

    logger.info('Special event bonus awarded / Xüsusi tədbir bonusu verildi', {
      userId,
      eventId,
      eventName,
      points,
    });

    return { awarded: true, points };
  } catch (error) {
    logger.error('Failed to award special event bonus / Xüsusi tədbir bonusu vermək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Process birthday rewards for all users / Bütün istifadəçilər üçün doğum günü mükafatlarını emal et
 */
export async function processBirthdayRewards() {
  try {
    const readClient = await getReadClient();
    const today = new Date();
    
    // Find users with birthdays today / Bu gün doğum günü olan istifadəçiləri tap
    const users = await (readClient as any).user.findMany({
      where: {
        birthday: {
          not: null,
        },
        OR: [
          { lastBirthdayReward: null },
          { lastBirthdayReward: { lt: new Date(today.getFullYear(), 0, 1) } }, // Not rewarded this year / Bu il mükafat verilməyib
        ],
      },
      select: {
        id: true,
        birthday: true,
      },
    });

    let awardedCount = 0;
    for (const user of users) {
      const birthday = new Date(user.birthday);
      if (birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()) {
        try {
          const result = await checkAndAwardBirthdayReward(user.id);
          if (result.awarded) {
            awardedCount++;
          }
        } catch (error) {
          logger.error('Failed to award birthday reward for user / İstifadəçi üçün doğum günü mükafatı vermək uğursuz oldu', error, {
            userId: user.id,
          });
        }
      }
    }

    logger.info('Birthday rewards processed / Doğum günü mükafatları emal olundu', {
      totalUsers: users.length,
      awardedCount,
    });

    return { processed: users.length, awarded: awardedCount };
  } catch (error) {
    logger.error('Failed to process birthday rewards / Doğum günü mükafatlarını emal etmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Process anniversary rewards for all users / Bütün istifadəçilər üçün ildönümü mükafatlarını emal et
 */
export async function processAnniversaryRewards() {
  try {
    const readClient = await getReadClient();
    const today = new Date();
    
    // Find users with anniversaries today / Bu gün ildönümü olan istifadəçiləri tap
    const users = await (readClient as any).user.findMany({
      where: {
        createdAt: {
          not: null,
        },
        OR: [
          { lastAnniversaryReward: null },
          { lastAnniversaryReward: { lt: new Date(today.getFullYear(), 0, 1) } }, // Not rewarded this year / Bu il mükafat verilməyib
        ],
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    let awardedCount = 0;
    for (const user of users) {
      const accountCreated = new Date(user.createdAt);
      const monthDiff = today.getMonth() - accountCreated.getMonth();
      const dayDiff = today.getDate() - accountCreated.getDate();
      
      if (monthDiff === 0 && dayDiff === 0) {
        try {
          const result = await checkAndAwardAnniversaryReward(user.id);
          if (result.awarded) {
            awardedCount++;
          }
        } catch (error) {
          logger.error('Failed to award anniversary reward for user / İstifadəçi üçün ildönümü mükafatı vermək uğursuz oldu', error, {
            userId: user.id,
          });
        }
      }
    }

    logger.info('Anniversary rewards processed / İldönümü mükafatları emal olundu', {
      totalUsers: users.length,
      awardedCount,
    });

    return { processed: users.length, awarded: awardedCount };
  } catch (error) {
    logger.error('Failed to process anniversary rewards / İldönümü mükafatlarını emal etmək uğursuz oldu', error);
    throw error;
  }
}

