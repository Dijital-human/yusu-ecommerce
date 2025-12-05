#!/bin/bash

# Production Backup Script / Production Backup Scripti
# Comprehensive backup solution for all services / Bütün xidmətlər üçün hərtərəfli backup həlli

set -e

# Configuration / Konfiqurasiya
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
LOG_FILE="/var/log/backup.log"

# Database configuration / Veritabanı konfiqurasiyası
DB_HOST="postgres"
DB_NAME="${DATABASE_NAME:-yusu_production}"
DB_USER="${DATABASE_USER:-yusu_admin}"
DB_PASSWORD="${DATABASE_PASSWORD}"

# Redis configuration / Redis konfiqurasiyası
REDIS_HOST="redis"
REDIS_PASSWORD="${REDIS_PASSWORD}"

# Application configuration / Tətbiq konfiqurasiyası
APP_DIR="/app"
UPLOADS_DIR="/app/uploads"
LOGS_DIR="/app/logs"

# Logging function / Loglama funksiyası
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling / Xəta idarəetməsi
error_exit() {
    log "ERROR: $1"
    exit 1
}

# Create backup directory / Backup qovluğu yarat
create_backup_dir() {
    local backup_path="$BACKUP_DIR/$DATE"
    mkdir -p "$backup_path"
    echo "$backup_path"
}

# Database backup / Veritabanı backup
backup_database() {
    local backup_path="$1"
    log "Starting database backup..."
    
    # Create database dump / Veritabanı dump yarat
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-password \
        --format=custom \
        --compress=9 \
        --file="$backup_path/database_backup.dump" \
        || error_exit "Database backup failed"
    
    # Create SQL dump as well / SQL dump da yarat
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        --no-password \
        --format=plain \
        --file="$backup_path/database_backup.sql" \
        || error_exit "SQL dump creation failed"
    
    log "Database backup completed successfully"
}

# Redis backup / Redis backup
backup_redis() {
    local backup_path="$1"
    log "Starting Redis backup..."
    
    # Create Redis dump / Redis dump yarat
    redis-cli -h "$REDIS_HOST" -a "$REDIS_PASSWORD" --rdb "$backup_path/redis_backup.rdb" \
        || error_exit "Redis backup failed"
    
    # Export Redis data as JSON / Redis məlumatlarını JSON kimi ixrac et
    redis-cli -h "$REDIS_HOST" -a "$REDIS_PASSWORD" --scan --pattern "*" | \
    while read key; do
        redis-cli -h "$REDIS_HOST" -a "$REDIS_PASSWORD" --raw dump "$key" | \
        xxd -r -p > "$backup_path/redis_$key.bin"
    done
    
    log "Redis backup completed successfully"
}

# Application files backup / Tətbiq faylları backup
backup_application_files() {
    local backup_path="$1"
    log "Starting application files backup..."
    
    # Backup uploads directory / Uploads qovluğunu backup et
    if [ -d "$UPLOADS_DIR" ]; then
        tar -czf "$backup_path/uploads_backup.tar.gz" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")" \
            || error_exit "Uploads backup failed"
    fi
    
    # Backup configuration files / Konfiqurasiya fayllarını backup et
    if [ -d "$APP_DIR" ]; then
        tar -czf "$backup_path/config_backup.tar.gz" \
            -C "$APP_DIR" \
            --exclude="node_modules" \
            --exclude=".next" \
            --exclude="logs" \
            --exclude="uploads" \
            . \
            || error_exit "Configuration backup failed"
    fi
    
    log "Application files backup completed successfully"
}

# Logs backup / Loglar backup
backup_logs() {
    local backup_path="$1"
    log "Starting logs backup..."
    
    if [ -d "$LOGS_DIR" ]; then
        tar -czf "$backup_path/logs_backup.tar.gz" -C "$(dirname "$LOGS_DIR")" "$(basename "$LOGS_DIR")" \
            || error_exit "Logs backup failed"
    fi
    
    log "Logs backup completed successfully"
}

# Docker volumes backup / Docker volume-ları backup
backup_docker_volumes() {
    local backup_path="$1"
    log "Starting Docker volumes backup..."
    
    # List all Docker volumes / Bütün Docker volume-ları siyahıla
    docker volume ls --format "{{.Name}}" | while read volume; do
        if [[ "$volume" == *"yusu"* ]]; then
            log "Backing up volume: $volume"
            docker run --rm \
                -v "$volume":/source \
                -v "$backup_path":/backup \
                alpine:latest \
                tar -czf "/backup/volume_${volume}.tar.gz" -C /source . \
                || error_exit "Volume backup failed for $volume"
        fi
    done
    
    log "Docker volumes backup completed successfully"
}

# Create backup manifest / Backup manifest yarat
create_backup_manifest() {
    local backup_path="$1"
    local manifest_file="$backup_path/backup_manifest.json"
    
    cat > "$manifest_file" << EOF
{
    "backup_date": "$(date -Iseconds)",
    "backup_type": "full",
    "services": {
        "database": {
            "host": "$DB_HOST",
            "name": "$DB_NAME",
            "user": "$DB_USER"
        },
        "redis": {
            "host": "$REDIS_HOST"
        },
        "application": {
            "directory": "$APP_DIR"
        }
    },
    "files": [
        "database_backup.dump",
        "database_backup.sql",
        "redis_backup.rdb",
        "uploads_backup.tar.gz",
        "config_backup.tar.gz",
        "logs_backup.tar.gz"
    ],
    "backup_size": "$(du -sh "$backup_path" | cut -f1)",
    "retention_days": $RETENTION_DAYS
}
EOF
    
    log "Backup manifest created: $manifest_file"
}

# Compress backup / Backup-ı sıxışdır
compress_backup() {
    local backup_path="$1"
    local compressed_file="$BACKUP_DIR/yusu_backup_$DATE.tar.gz"
    
    log "Compressing backup..."
    tar -czf "$compressed_file" -C "$(dirname "$backup_path")" "$(basename "$backup_path")" \
        || error_exit "Backup compression failed"
    
    # Remove uncompressed directory / Sıxışdırılmamış qovluğu sil
    rm -rf "$backup_path"
    
    log "Backup compressed: $compressed_file"
    echo "$compressed_file"
}

# Upload to cloud storage / Cloud storage-a yüklə
upload_to_cloud() {
    local backup_file="$1"
    
    # AWS S3 upload / AWS S3 yükləmə
    if [ -n "$AWS_S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
        log "Uploading to AWS S3..."
        aws s3 cp "$backup_file" "s3://$AWS_S3_BUCKET/backups/" \
            || error_exit "AWS S3 upload failed"
        log "Upload to AWS S3 completed"
    fi
    
    # Google Cloud Storage upload / Google Cloud Storage yükləmə
    if [ -n "$GCS_BUCKET" ] && [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        log "Uploading to Google Cloud Storage..."
        gsutil cp "$backup_file" "gs://$GCS_BUCKET/backups/" \
            || error_exit "Google Cloud Storage upload failed"
        log "Upload to Google Cloud Storage completed"
    fi
}

# Cleanup old backups / Köhnə backup-ları təmizlə
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    find "$BACKUP_DIR" -name "yusu_backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete \
        || error_exit "Old backups cleanup failed"
    
    log "Old backups cleanup completed"
}

# Send backup notification / Backup bildirişi göndər
send_backup_notification() {
    local status="$1"
    local backup_file="$2"
    local message=""
    
    if [ "$status" = "success" ]; then
        message="✅ Backup completed successfully\n📁 File: $(basename "$backup_file")\n📊 Size: $(du -sh "$backup_file" | cut -f1)\n🕒 Time: $(date)"
    else
        message="❌ Backup failed\n🕒 Time: $(date)\n📝 Check logs: $LOG_FILE"
    fi
    
    # Send email notification / Email bildirişi göndər
    if [ -n "$BACKUP_NOTIFICATION_EMAIL" ]; then
        echo -e "$message" | mail -s "Yusu Backup $status" "$BACKUP_NOTIFICATION_EMAIL" \
            || log "Failed to send email notification"
    fi
    
    # Send Slack notification / Slack bildirişi göndər
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK_URL" \
            || log "Failed to send Slack notification"
    fi
}

# Main backup function / Əsas backup funksiyası
main() {
    log "Starting Yusu production backup..."
    
    # Create backup directory / Backup qovluğu yarat
    local backup_path=$(create_backup_dir)
    
    # Perform backups / Backup-ları yerinə yetir
    backup_database "$backup_path"
    backup_redis "$backup_path"
    backup_application_files "$backup_path"
    backup_logs "$backup_path"
    backup_docker_volumes "$backup_path"
    
    # Create manifest / Manifest yarat
    create_backup_manifest "$backup_path"
    
    # Compress backup / Backup-ı sıxışdır
    local compressed_backup=$(compress_backup "$backup_path")
    
    # Upload to cloud storage / Cloud storage-a yüklə
    upload_to_cloud "$compressed_backup"
    
    # Cleanup old backups / Köhnə backup-ları təmizlə
    cleanup_old_backups
    
    # Send success notification / Uğur bildirişi göndər
    send_backup_notification "success" "$compressed_backup"
    
    log "Backup completed successfully: $compressed_backup"
}

# Recovery function / Bərpa funksiyası
recover() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        error_exit "Backup file not specified"
    fi
    
    if [ ! -f "$backup_file" ]; then
        error_exit "Backup file not found: $backup_file"
    fi
    
    log "Starting recovery from: $backup_file"
    
    # Extract backup / Backup-ı çıxar
    local temp_dir="/tmp/recovery_$(date +%s)"
    mkdir -p "$temp_dir"
    tar -xzf "$backup_file" -C "$temp_dir" \
        || error_exit "Failed to extract backup"
    
    # Restore database / Veritabanını bərpa et
    if [ -f "$temp_dir/database_backup.dump" ]; then
        log "Restoring database..."
        PGPASSWORD="$DB_PASSWORD" pg_restore \
            -h "$DB_HOST" \
            -U "$DB_USER" \
            -d "$DB_NAME" \
            --verbose \
            --no-password \
            --clean \
            --if-exists \
            "$temp_dir/database_backup.dump" \
            || error_exit "Database restore failed"
        log "Database restored successfully"
    fi
    
    # Restore Redis / Redis-i bərpa et
    if [ -f "$temp_dir/redis_backup.rdb" ]; then
        log "Restoring Redis..."
        redis-cli -h "$REDIS_HOST" -a "$REDIS_PASSWORD" --rdb "$temp_dir/redis_backup.rdb" \
            || error_exit "Redis restore failed"
        log "Redis restored successfully"
    fi
    
    # Restore application files / Tətbiq fayllarını bərpa et
    if [ -f "$temp_dir/uploads_backup.tar.gz" ]; then
        log "Restoring uploads..."
        tar -xzf "$temp_dir/uploads_backup.tar.gz" -C "/" \
            || error_exit "Uploads restore failed"
        log "Uploads restored successfully"
    fi
    
    # Cleanup / Təmizlik
    rm -rf "$temp_dir"
    
    log "Recovery completed successfully"
}

# Script execution / Script icrası
case "${1:-backup}" in
    "backup")
        main
        ;;
    "recover")
        recover "$2"
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    *)
        echo "Usage: $0 {backup|recover|cleanup}"
        echo "  backup  - Create full backup"
        echo "  recover <backup_file> - Restore from backup"
        echo "  cleanup - Remove old backups"
        exit 1
        ;;
esac
