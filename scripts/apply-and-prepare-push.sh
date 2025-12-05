#!/usr/bin/env bash
# Apply gitignore patch, archive sensitive files, stage & commit changes.
# By default the script DOES NOT push. To push, set PUSH=true environment variable.
# Usage:
#   chmod +x scripts/apply-and-prepare-push.sh
#   ./scripts/apply-and-prepare-push.sh       # prepare commit only
#   PUSH=true ./scripts/apply-and-prepare-push.sh   # also push (requires git auth)

set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

PATCH_FILE="patches/gitignore-update.patch"
CLEANUP_SCRIPT="scripts/remove-and-archive-sensitive.sh"
if [ ! -f "$PATCH_FILE" ]; then
  echo "Patch file $PATCH_FILE not found. Aborting."
  exit 1
fi

echo "1) Checking patch..."
git apply --stat "$PATCH_FILE"
git apply --check "$PATCH_FILE"

echo "2) Applying patch to .gitignore..."
git apply "$PATCH_FILE"

echo "3) Ensure cleanup script is executable..."
if [ -f "$CLEANUP_SCRIPT" ]; then
  chmod +x "$CLEANUP_SCRIPT"
  echo "Running cleanup script to archive sensitive files (dry-run inside script may move files)..."
  "$CLEANUP_SCRIPT"
else
  echo "Warning: cleanup script not found at $CLEANUP_SCRIPT. Skipping archival step."
fi

echo "4) Safety check: ensure no .env files are staged for commit"
if git ls-files --error-unmatch .env .env.local .env.production >/dev/null 2>&1; then
  echo "Warning: repository still tracks .env files. They must be removed from index before committing."
  echo "Running: git rm --cached --ignore-unmatch .env .env.local .env.production"
  git rm --cached --ignore-unmatch .env .env.local .env.production || true
fi

echo "5) Stage .gitignore and cleanup folder"
git add .gitignore .cleanup || true

# Show staged changes
echo
 echo "Staged changes (git diff --staged):"
 git --no-pager diff --staged -- .gitignore || true
 echo

# Prepare commit
COMMIT_MSG="chore: update .gitignore — ignore env backups, caches, uploads\n\nAutomated: applied patches/gitignore-update.patch and archived env backups."

echo "6) Committing changes (if any)..."
if git diff --staged --quiet; then
  echo "No staged changes to commit."
else
  git commit -m "$COMMIT_MSG"
  echo "Committed."
fi

# Final safety before push
if [ "${PUSH:-false}" = "true" ]; then
  echo "PUSH=true detected — will attempt to push. Ensure you have git remote 'origin' set to the target repo."
  # If origin missing, set remote to the requested repo
  if ! git remote get-url origin >/dev/null 2>&1; then
    echo "No origin remote set. Adding origin https://github.com/Dijital-human/ulustore.com.git"
    git remote add origin https://github.com/Dijital-human/ulustore.com.git
  fi

  BRANCH=$(git branch --show-current || echo "main")
  echo "Pushing branch $BRANCH to origin..."
  git push -u origin "$BRANCH"
  echo "Push complete."
else
  echo "PUSH not enabled. To push, run: PUSH=true ./scripts/apply-and-prepare-push.sh"
fi

echo "All done. Review commits and push when ready."
