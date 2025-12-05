/**
 * File Upload API Route / Fayl Yükləmə API Route
 * Handles file uploads for chat attachments and other purposes
 * Chat əlavələri və digər məqsədlər üçün fayl yükləmələrini idarə edir
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { uploadToCDN } from '@/lib/utils/cdn';
import { logger } from '@/lib/utils/logger';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication / Autentifikasiyanı yoxla
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized / Yetkisiz' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded / Fayl yüklənməyib' },
        { status: 400 }
      );
    }

    // Validate file size / Fayl ölçüsünü doğrula
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit / Fayl ölçüsü ${MAX_FILE_SIZE / 1024 / 1024}MB limitini aşır` },
        { status: 400 }
      );
    }

    // Validate file type / Fayl tipini doğrula
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed / Fayl tipi icazə verilmir' },
        { status: 400 }
      );
    }

    // Generate unique filename / Unikal fayl adı yarat
    const fileExtension = file.name.split('.').pop() || 'bin';
    const fileName = `${randomUUID()}.${fileExtension}`;
    const filePath = `${folder}/${session.user.id}/${fileName}`;

    // Convert file to buffer / Faylı buffer-ə çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to CDN / CDN-ə yüklə
    const fileUrl = await uploadToCDN(buffer, filePath, {
      contentType: file.type,
      public: true,
    });

    logger.info('File uploaded successfully / Fayl uğurla yükləndi', {
      userId: session.user.id,
      fileName: file.name,
      filePath,
      fileSize: file.size,
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    logger.error('File upload failed / Fayl yükləmə uğursuz oldu', error);
    return NextResponse.json(
      { error: 'Failed to upload file / Fayl yükləmək uğursuz oldu' },
      { status: 500 }
    );
  }
}

