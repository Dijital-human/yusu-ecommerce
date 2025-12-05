How to apply the .gitignore patch and commit safely

1) Preview the patch:
   git apply --stat patches/gitignore-update.patch
   git apply --check patches/gitignore-update.patch

2) Apply the patch:
   git apply patches/gitignore-update.patch

3) Verify changes:
   git diff -- .gitignore
   git status

4) Archive and remove sensitive files from git index (if not done):
   chmod +x scripts/remove-and-archive-sensitive.sh
   ./scripts/remove-and-archive-sensitive.sh

5) Commit & push:
   git add .gitignore .cleanup
   git commit -m "chore: update .gitignore — ignore env backups, caches, uploads"

   # Add remote if needed (only if you want to push now)
   git remote remove origin 2>/dev/null || true
   git remote add origin https://github.com/Dijital-human/ulustore.com.git
   BRANCH=$(git branch --show-current)
   if [ -z "$BRANCH" ]; then BRANCH=main; fi
   git push -u origin "$BRANCH"

Notes:
- The patch adds ignore rules for env backups, caches and uploads.
- Do not commit actual .env files. If secrets were previously committed, revoke and rotate them immediately and consider using git filter-repo/BFG to remove history.
- Review CI configuration after push to ensure env validation in pipelines.
