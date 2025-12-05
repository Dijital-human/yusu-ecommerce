#!/usr/bin/env bash
# Cleanup script: move env backups and known backup dirs into .cleanup/archive
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ARCHIVE_DIR="$ROOT_DIR/.cleanup/archive"
mkdir -p "$ARCHIVE_DIR"

echo "Searching for env backup files..."
# Find typical env backup files
find "$ROOT_DIR" -type f \( -iname ".env*.bak" -o -iname "*.env.backup" -o -iname ".env-backups" -o -iname "env.local.bak*" \) -print > "$ARCHIVE_DIR/files-to-move.txt" || true

# Move found files (if any)
while IFS= read -r file; do
  # Skip node_modules and .git directories
  if [[ "$file" == *"/node_modules/"* ]] || [[ "$file" == *"/.git/"* ]]; then
    continue
  fi
  echo "Archiving: $file"
  mkdir -p "$(dirname "$ARCHIVE_DIR/$file")"
  mv "$file" "$ARCHIVE_DIR/" || true
done < "$ARCHIVE_DIR/files-to-move.txt" || true

# Find env-backups directories and move them
find "$ROOT_DIR" -type d -name ".env-backups" -print | while IFS= read -r dir; do
  echo "Archiving dir: $dir"
  mv "$dir" "$ARCHIVE_DIR/" || true
done || true

# Create README in cleanup folder
cat > "$ROOT_DIR/.cleanup/README.md" <<'EOF'
Bu klasörde repository'den arşivlenmiş environment yedekleri ve konfigürasyon backup'ları bulunur.
Otomatik script tarafından taşındılar. Lütfen hassas bilgi içerdiklerinden dolayı bu klasörü git'e dahil etmeyin.
EOF

# Create a gitignore hint file
cat > "$ARCHIVE_DIR/.gitkeep" <<'EOF'
# Keep archive directory in git. Actual backups should not be tracked.
EOF

echo "Cleanup complete. Archived files list at $ARCHIVE_DIR/files-to-move.txt"
exit 0
