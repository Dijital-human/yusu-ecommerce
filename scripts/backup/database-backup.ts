/**
 * Database Backup Script / Veritabanı Backup Scripti
 * Automated database backup with compression and encryption
 * Sıxışdırma və şifrələmə ilə avtomatik veritabanı backup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '@/lib/utils/logger';
import * as crypto from 'crypto';

const execAsync = promisify(exec);

export interface BackupOptions {
  outputDir: string;
  databaseUrl: string;
  compress?: boolean;
  encrypt?: boolean;
  encryptionKey?: string;
  retentionDays?: number;
}

export interface BackupResult {
  success: boolean;
  backupPath: string;
  size: number;
  timestamp: Date;
  error?: string;
}

/**
 * Create full database backup / Tam veritabanı backup yarat
 */
export async function createFullBackup(options: BackupOptions): Promise<BackupResult> {
  const {
    outputDir,
    databaseUrl,
    compress = true,
    encrypt = false,
    encryptionKey,
    retentionDays = 30,
  } = options;

  try {
    // Parse database URL / Veritabanı URL-ni parse et
    const dbUrl = new URL(databaseUrl);
    const dbName = dbUrl.pathname.slice(1);
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || '5432';
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;

    // Create backup directory / Backup qovluğu yarat
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(outputDir, `backup_${timestamp}`);
    await fs.mkdir(backupDir, { recursive: true });

    // Set PGPASSWORD environment variable / PGPASSWORD environment dəyişənini təyin et
    process.env.PGPASSWORD = dbPassword;

    // Create database dump / Veritabanı dump yarat
    const dumpFile = path.join(backupDir, 'database.dump');
    const dumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f ${dumpFile}`;

    logger.info('Creating database dump / Veritabanı dump yaradılır', { dbHost, dbName });
    await execAsync(dumpCommand);

    // Create SQL dump as well / SQL dump da yarat
    const sqlFile = path.join(backupDir, 'database.sql');
    const sqlCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F p -f ${sqlFile}`;

    logger.info('Creating SQL dump / SQL dump yaradılır');
    await execAsync(sqlCommand);

    // Compress backup / Backup-ı sıxışdır
    let finalBackupPath = dumpFile;
    if (compress) {
      logger.info('Compressing backup / Backup sıxışdırılır');
      const compressedFile = `${dumpFile}.gz`;
      await execAsync(`gzip -9 ${dumpFile}`);
      finalBackupPath = compressedFile;
    }

    // Encrypt backup / Backup-ı şifrələ
    if (encrypt && encryptionKey) {
      logger.info('Encrypting backup / Backup şifrələnir');
      const encryptedFile = `${finalBackupPath}.enc`;
      await encryptFile(finalBackupPath, encryptedFile, encryptionKey);
      await fs.unlink(finalBackupPath); // Remove unencrypted file / Şifrələnməmiş faylı sil
      finalBackupPath = encryptedFile;
    }

    // Get backup size / Backup ölçüsünü al
    const stats = await fs.stat(finalBackupPath);
    const size = stats.size;

    // Create backup manifest / Backup manifest yarat
    const manifest = {
      timestamp: new Date().toISOString(),
      type: 'full',
      database: {
        host: dbHost,
        name: dbName,
        user: dbUser,
      },
      files: {
        dump: path.basename(finalBackupPath),
        sql: path.basename(sqlFile),
      },
      size,
      compressed: compress,
      encrypted: encrypt,
      retentionDays,
    };

    const manifestPath = path.join(backupDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    logger.info('Database backup completed / Veritabanı backup tamamlandı', {
      backupPath: finalBackupPath,
      size: `${(size / 1024 / 1024).toFixed(2)} MB`,
    });

    return {
      success: true,
      backupPath: finalBackupPath,
      size,
      timestamp: new Date(),
    };
  } catch (error) {
    logger.error('Database backup failed / Veritabanı backup uğursuz oldu', error);
    return {
      success: false,
      backupPath: '',
      size: 0,
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create incremental backup / İnkremental backup yarat
 */
export async function createIncrementalBackup(
  options: BackupOptions,
  lastBackupTimestamp: Date
): Promise<BackupResult> {
  // For PostgreSQL, incremental backups are typically done using WAL archiving
  // PostgreSQL üçün inkremental backup-lar adətən WAL arxivləməsi ilə edilir
  // This is a simplified version / Bu sadələşdirilmiş versiyadır
  
  logger.warn('Incremental backup requires WAL archiving setup / İnkremental backup WAL arxivləməsi quraşdırması tələb edir');
  
  // For now, create a full backup / Hələlik tam backup yarat
  return await createFullBackup(options);
}

/**
 * Encrypt file / Faylı şifrələ
 */
async function encryptFile(inputPath: string, outputPath: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const algorithm = 'aes-256-gcm';
    const keyBuffer = crypto.scryptSync(key, 'salt', 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, keyBuffer, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Write IV at the beginning / IV-ni əvvəldə yaz
    output.write(iv);

    input.pipe(cipher).pipe(output);

    output.on('finish', resolve);
    output.on('error', reject);
    input.on('error', reject);
  });
}

/**
 * Decrypt file / Faylı deşifrələ
 */
export async function decryptFile(inputPath: string, outputPath: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const algorithm = 'aes-256-gcm';
    const keyBuffer = crypto.scryptSync(key, 'salt', 32);

    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);

    // Read IV from the beginning / IV-ni əvvəldən oxu
    const ivBuffer = Buffer.alloc(16);
    input.read(ivBuffer, 0, 16, 0);

    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
    input.pipe(decipher).pipe(output);

    output.on('finish', resolve);
    output.on('error', reject);
    input.on('error', reject);
  });
}

/**
 * Restore database from backup / Backup-dan veritabanını bərpa et
 */
export async function restoreDatabase(
  backupPath: string,
  databaseUrl: string,
  encryptionKey?: string
): Promise<boolean> {
  try {
    // Parse database URL / Veritabanı URL-ni parse et
    const dbUrl = new URL(databaseUrl);
    const dbName = dbUrl.pathname.slice(1);
    const dbHost = dbUrl.hostname;
    const dbPort = dbUrl.port || '5432';
    const dbUser = dbUrl.username;
    const dbPassword = dbUrl.password;

    // Decrypt if needed / Lazımdırsa deşifrələ
    let restorePath = backupPath;
    if (backupPath.endsWith('.enc') && encryptionKey) {
      logger.info('Decrypting backup / Backup deşifrələnir');
      const decryptedPath = backupPath.replace('.enc', '');
      await decryptFile(backupPath, decryptedPath, encryptionKey);
      restorePath = decryptedPath;
    }

    // Decompress if needed / Lazımdırsa sıxışdırmadan çıxar
    if (restorePath.endsWith('.gz')) {
      logger.info('Decompressing backup / Backup sıxışdırmadan çıxarılır');
      await execAsync(`gunzip ${restorePath}`);
      restorePath = restorePath.replace('.gz', '');
    }

    // Set PGPASSWORD environment variable / PGPASSWORD environment dəyişənini təyin et
    process.env.PGPASSWORD = dbPassword;

    // Restore database / Veritabanını bərpa et
    const restoreCommand = `pg_restore -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --clean --if-exists ${restorePath}`;

    logger.info('Restoring database / Veritabanı bərpa edilir', { dbHost, dbName });
    await execAsync(restoreCommand);

    logger.info('Database restored successfully / Veritabanı uğurla bərpa edildi');
    return true;
  } catch (error) {
    logger.error('Database restore failed / Veritabanı bərpası uğursuz oldu', error);
    return false;
  }
}

/**
 * Cleanup old backups / Köhnə backup-ları təmizlə
 */
export async function cleanupOldBackups(
  backupDir: string,
  retentionDays: number = 30
): Promise<number> {
  try {
    const files = await fs.readdir(backupDir);
    const now = Date.now();
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > retentionMs) {
        await fs.unlink(filePath);
        deletedCount++;
        logger.info('Deleted old backup / Köhnə backup silindi', { file });
      }
    }

    logger.info('Backup cleanup completed / Backup təmizliyi tamamlandı', { deletedCount });
    return deletedCount;
  } catch (error) {
    logger.error('Backup cleanup failed / Backup təmizliyi uğursuz oldu', error);
    return 0;
  }
}

