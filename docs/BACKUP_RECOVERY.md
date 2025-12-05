# Backup & Recovery Guide / Backup & Bərpa Təlimatı

## Overview / Xülasə

This document describes the backup and recovery procedures for the Yusu E-commerce platform.
Bu sənəd Yusu E-ticarət platforması üçün backup və bərpa prosedurlarını təsvir edir.

## Backup Procedures / Backup Prosedurları

### Automated Backups / Avtomatik Backup-lar

The system performs automated backups on the following schedule:
Sistem aşağıdakı cədvələ əsasən avtomatik backup-lar yerinə yetirir:

- **Daily Backups / Günlük Backup-lar**: Every day at 2 AM UTC / Hər gün UTC saat 2-də
- **Weekly Backups / Həftəlik Backup-lar**: Every Sunday at 3 AM UTC / Hər bazar günü UTC saat 3-də
- **Monthly Backups / Aylıq Backup-lar**: First day of month at 4 AM UTC / Hər ayın 1-i UTC saat 4-də

### Backup Retention / Backup Saxlama

- **Daily Backups**: Retained for 7 days / 7 gün saxlanılır
- **Weekly Backups**: Retained for 30 days / 30 gün saxlanılır
- **Monthly Backups**: Retained for 365 days / 365 gün saxlanılır

### Backup Components / Backup Komponentləri

Each backup includes:
Hər backup daxil edir:

1. **Database Backup / Veritabanı Backup**
   - Full database dump (custom format) / Tam veritabanı dump (custom format)
   - SQL dump (plain text) / SQL dump (plain text)
   - Compression (gzip) / Sıxışdırma (gzip)
   - Encryption (optional) / Şifrələmə (opsiyonal)

2. **Redis Backup / Redis Backup**
   - RDB file / RDB faylı
   - Key-value exports / Key-value ixracı

3. **Application Files / Tətbiq Faylları**
   - Uploads directory / Uploads qovluğu
   - Configuration files / Konfiqurasiya faylları

4. **Docker Volumes / Docker Volume-ları**
   - All application volumes / Bütün tətbiq volume-ları

## Recovery Procedures / Bərpa Prosedurları

### Recovery Time Objectives (RTO) / Bərpa Vaxtı Məqsədləri

- **RTO**: 4 hours / 4 saat
- **Target**: Restore service within 4 hours of failure / Xidməti uğursuzluqdan sonra 4 saat ərzində bərpa et

### Recovery Point Objectives (RPO) / Bərpa Nöqtəsi Məqsədləri

- **RPO**: 24 hours / 24 saat
- **Target**: Maximum data loss of 24 hours / Maksimum 24 saatlıq məlumat itkisi

### Recovery Types / Bərpa Növləri

#### 1. Full Database Recovery / Tam Veritabanı Bərpası

Restores the entire database from a backup.
Backup-dan bütün veritabanını bərpa edir.

**Steps / Addımlar:**

1. Identify the backup file / Backup faylını müəyyənləşdir
2. Verify backup integrity / Backup bütövlüyünü yoxla
3. Stop application services / Tətbiq xidmətlərini dayandır
4. Restore database / Veritabanını bərpa et
5. Verify data integrity / Məlumat bütövlüyünü yoxla
6. Restart application services / Tətbiq xidmətlərini yenidən başlat

**Command / Əmr:**

```bash
npm run backup:recover -- --backup-path /backups/backup_2025-01-28_020000.dump.gz
```

#### 2. Point-in-Time Recovery / Point-in-Time Bərpa

Restores database to a specific point in time (requires WAL archiving).
Veritabanını müəyyən bir zaman nöqtəsinə bərpa edir (WAL arxivləməsi tələb edir).

**Prerequisites / Tələblər:**

- WAL archiving enabled / WAL arxivləməsi aktiv
- Base backup available / Əsas backup mövcud
- WAL files archived / WAL faylları arxivlənib

**Steps / Addımlar:**

1. Restore base backup / Əsas backup-ı bərpa et
2. Apply WAL files up to target time / Hədəf zamana qədər WAL fayllarını tətbiq et
3. Verify recovery / Bərpanı yoxla

#### 3. Partial Recovery / Qismən Bərpa

Restores specific tables or data.
Müəyyən cədvəlləri və ya məlumatları bərpa edir.

**Use Cases / İstifadə Halları:**

- Accidental data deletion / Təsadüfi məlumat silinməsi
- Table corruption / Cədvəl korrupsiyası
- Data migration errors / Məlumat miqrasiya xətaları

## Manual Backup / Manual Backup

### Create Manual Backup / Manual Backup Yarat

```bash
# Using TypeScript script / TypeScript script istifadə edərək
npm run backup:create

# Using shell script / Shell script istifadə edərək
./scripts/backup.sh backup
```

### Backup Options / Backup Seçimləri

```typescript
import { createFullBackup } from './scripts/backup/database-backup';

const result = await createFullBackup({
  outputDir: '/backups',
  databaseUrl: process.env.DATABASE_URL!,
  compress: true,
  encrypt: true,
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  retentionDays: 30,
});
```

## Recovery Commands / Bərpa Əmrləri

### Full Recovery / Tam Bərpa

```bash
npm run backup:recover -- --backup-path /backups/backup_2025-01-28_020000.dump.gz
```

### Point-in-Time Recovery / Point-in-Time Bərpa

```bash
npm run backup:recover -- --backup-path /backups/backup_2025-01-28_020000.dump.gz --point-in-time "2025-01-28T10:00:00Z"
```

### Partial Recovery / Qismən Bərpa

```bash
npm run backup:recover -- --backup-path /backups/backup_2025-01-28_020000.dump.gz --tables "users,orders,products"
```

## Backup Verification / Backup Yoxlaması

### Verify Backup Integrity / Backup Bütövlüyünü Yoxla

```bash
# Check backup file size / Backup fayl ölçüsünü yoxla
ls -lh /backups/backup_*.dump.gz

# Verify backup manifest / Backup manifest-i yoxla
cat /backups/backup_*/manifest.json

# Test restore on staging / Staging-də bərpa testi
npm run backup:test-restore -- --backup-path /backups/backup_2025-01-28_020000.dump.gz
```

## Cloud Storage Integration / Cloud Storage İnteqrasiyası

### AWS S3

Backups are automatically uploaded to S3 if configured:
Konfiqurasiya edildikdə backup-lar avtomatik olaraq S3-ə yüklənir:

```env
AWS_S3_BUCKET=your-backup-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Google Cloud Storage

Backups can be uploaded to GCS:
Backup-lar GCS-ə yüklənə bilər:

```env
GCS_BUCKET=your-backup-bucket
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
```

## Monitoring & Alerts / Monitorinq & Xəbərdarlıqlar

### Backup Status Monitoring / Backup Status Monitorinqi

- Backup success/failure notifications / Backup uğur/uğursuzluq bildirişləri
- Backup size monitoring / Backup ölçüsü monitorinqi
- Storage usage alerts / Storage istifadə xəbərdarlıqları

### Alert Channels / Xəbərdarlıq Kanalları

- Email notifications / Email bildirişləri
- Slack notifications / Slack bildirişləri
- SMS notifications (optional) / SMS bildirişləri (opsiyonal)

## Best Practices / Ən Yaxşı Təcrübələr

1. **Regular Testing / Müntəzəm Testlər**
   - Test recovery procedures monthly / Bərpa prosedurlarını aylıq test et
   - Verify backup integrity regularly / Backup bütövlüyünü müntəzəm yoxla

2. **Multiple Backup Locations / Çoxlu Backup Yerləri**
   - Store backups in multiple locations / Backup-ları çoxlu yerlərdə saxla
   - Use cloud storage for redundancy / Artıqlıq üçün cloud storage istifadə et

3. **Encryption / Şifrələmə**
   - Encrypt sensitive backups / Həssas backup-ları şifrələ
   - Secure encryption keys / Şifrələmə açarlarını qoruyun

4. **Documentation / Sənədləşdirmə**
   - Document all recovery procedures / Bütün bərpa prosedurlarını sənədləşdir
   - Keep recovery runbooks updated / Bərpa runbook-larını yeniləyin

## Troubleshooting / Problemlərin Həlli

### Common Issues / Ümumi Problemlər

1. **Backup Fails / Backup Uğursuz Olur**
   - Check database connectivity / Veritabanı bağlantısını yoxla
   - Verify disk space / Disk yerini yoxla
   - Check permissions / İcazələri yoxla

2. **Recovery Fails / Bərpa Uğursuz Olur**
   - Verify backup file integrity / Backup fayl bütövlüyünü yoxla
   - Check database version compatibility / Veritabanı versiya uyğunluğunu yoxla
   - Ensure sufficient disk space / Kifayət qədər disk yerini təmin et

3. **Encrypted Backup Issues / Şifrələnmiş Backup Problemləri**
   - Verify encryption key / Şifrələmə açarını yoxla
   - Check key file permissions / Açar fayl icazələrini yoxla

## Support / Dəstək

For backup and recovery support:
Backup və bərpa dəstəyi üçün:

- **Email**: dev@azliner.info
- **Documentation**: https://docs.azliner.info
- **Emergency**: Contact on-call engineer / Təcili: Növbəçi mühəndislə əlaqə saxlayın

