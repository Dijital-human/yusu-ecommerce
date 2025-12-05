/**
 * User Addresses Service / İstifadəçi Ünvanları Xidməti
 * Database operations for user addresses / İstifadəçi ünvanları üçün veritabanı əməliyyatları
 */

import { getReadClient, getWriteClient } from '@/lib/db/query-client';
import { logger } from '@/lib/utils/logger';

export interface CreateAddressData {
  userId: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

/**
 * Get user addresses / İstifadəçi ünvanlarını al
 */
export async function getUserAddresses(userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  } catch (error) {
    logger.error('Failed to get user addresses / İstifadəçi ünvanlarını almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get default address / Default ünvanı al
 */
export async function getDefaultAddress(userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  } catch (error) {
    logger.error('Failed to get default address / Default ünvanı almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Get address by ID / ID-yə görə ünvanı al
 */
export async function getAddressById(addressId: string, userId: string) {
  try {
    const readClient = await getReadClient();
    return await (readClient as any).address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });
  } catch (error) {
    logger.error('Failed to get address / Ünvanı almaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Create address / Ünvan yarat
 */
export async function createAddress(data: CreateAddressData) {
  try {
    const writeClient = await getWriteClient();
    
    // If this is set as default, unset other default addresses / Əgər bu default olaraq təyin edilibsə, digər default ünvanları sıfırla
    if (data.isDefault) {
      await (writeClient as any).address.updateMany({
        where: {
          userId: data.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return await (writeClient as any).address.create({
      data,
    });
  } catch (error) {
    logger.error('Failed to create address / Ünvan yaratmaq uğursuz oldu', error);
    throw error;
  }
}

/**
 * Update address / Ünvanı yenilə
 */
export async function updateAddress(addressId: string, userId: string, data: UpdateAddressData) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership / Mülkiyyəti yoxla
    const address = await getAddressById(addressId, userId);
    if (!address) {
      throw new Error('Address not found / Ünvan tapılmadı');
    }

    // If this is set as default, unset other default addresses / Əgər bu default olaraq təyin edilibsə, digər default ünvanları sıfırla
    if (data.isDefault) {
      await (writeClient as any).address.updateMany({
        where: {
          userId,
          isDefault: true,
          id: { not: addressId },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return await (writeClient as any).address.update({
      where: { id: addressId },
      data,
    });
  } catch (error) {
    logger.error('Failed to update address / Ünvanı yeniləmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Delete address / Ünvanı sil
 */
export async function deleteAddress(addressId: string, userId: string) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership / Mülkiyyəti yoxla
    const address = await getAddressById(addressId, userId);
    if (!address) {
      throw new Error('Address not found / Ünvan tapılmadı');
    }

    return await (writeClient as any).address.delete({
      where: { id: addressId },
    });
  } catch (error) {
    logger.error('Failed to delete address / Ünvanı silmək uğursuz oldu', error);
    throw error;
  }
}

/**
 * Set default address / Default ünvanı təyin et
 */
export async function setDefaultAddress(addressId: string, userId: string) {
  try {
    const writeClient = await getWriteClient();
    
    // Verify ownership / Mülkiyyəti yoxla
    const address = await getAddressById(addressId, userId);
    if (!address) {
      throw new Error('Address not found / Ünvan tapılmadı');
    }

    // Unset other default addresses / Digər default ünvanları sıfırla
    await (writeClient as any).address.updateMany({
      where: {
        userId,
        isDefault: true,
        id: { not: addressId },
      },
      data: {
        isDefault: false,
      },
    });

    // Set this as default / Bunu default olaraq təyin et
    return await (writeClient as any).address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  } catch (error) {
    logger.error('Failed to set default address / Default ünvanı təyin etmək uğursuz oldu', error);
    throw error;
  }
}

