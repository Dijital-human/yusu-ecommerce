-- CreateEnum / Enum yarat
CREATE TYPE "BannerPosition" AS ENUM ('HERO', 'TOP', 'MIDDLE', 'BOTTOM', 'SIDEBAR', 'FOOTER');

CREATE TYPE "SectionType" AS ENUM (
  'HERO_CAROUSEL',
  'CATEGORIES',
  'FEATURED_PRODUCTS',
  'TRENDING_PRODUCTS',
  'NEW_ARRIVALS',
  'BEST_SELLERS',
  'TESTIMONIALS',
  'STATISTICS',
  'NEWS',
  'PROMOTIONS',
  'CUSTOM_HTML'
);

-- CreateTable / Banner cədvəli yarat
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "position" "BannerPosition" NOT NULL DEFAULT 'HERO',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "targetAudience" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable / HomepageSection cədvəli yarat
CREATE TABLE "homepage_sections" (
    "id" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "config" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable / Page cədvəli yarat
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable / ContentVersion cədvəli yarat
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "changes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex / Index-lər yarat
CREATE INDEX "banners_position_idx" ON "banners"("position");
CREATE INDEX "banners_isActive_idx" ON "banners"("isActive");
CREATE INDEX "banners_startDate_endDate_idx" ON "banners"("startDate", "endDate");
CREATE INDEX "banners_priority_idx" ON "banners"("priority");

CREATE INDEX "homepage_sections_type_idx" ON "homepage_sections"("type");
CREATE INDEX "homepage_sections_isActive_idx" ON "homepage_sections"("isActive");
CREATE INDEX "homepage_sections_order_idx" ON "homepage_sections"("order");

CREATE INDEX "pages_slug_idx" ON "pages"("slug");
CREATE INDEX "pages_isPublished_idx" ON "pages"("isPublished");

CREATE UNIQUE INDEX "content_versions_resourceType_resourceId_version_key" ON "content_versions"("resourceType", "resourceId", "version");
CREATE INDEX "content_versions_resourceType_resourceId_idx" ON "content_versions"("resourceType", "resourceId");

-- CreateUniqueIndex / Unique index-lər yarat
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- AddForeignKey / Foreign key-lər əlavə et
ALTER TABLE "banners" ADD CONSTRAINT "banners_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "banners" ADD CONSTRAINT "banners_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "homepage_sections" ADD CONSTRAINT "homepage_sections_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pages" ADD CONSTRAINT "pages_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pages" ADD CONSTRAINT "pages_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

