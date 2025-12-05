-- CreateTable
-- Product 3D Model Model / Məhsul 3D Model Modeli
-- 3D models for AR/VR preview / AR/VR önizləmə üçün 3D modellər
CREATE TABLE "product_3d_models" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "modelUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "format" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_3d_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
-- Indexes for better query performance / Daha yaxşı sorğu performansı üçün index-lər
CREATE UNIQUE INDEX "product_3d_models_productId_key" ON "product_3d_models"("productId");

CREATE INDEX "product_3d_models_productId_idx" ON "product_3d_models"("productId");

CREATE INDEX "product_3d_models_isActive_idx" ON "product_3d_models"("isActive");

-- AddForeignKey
-- Foreign key constraints / Xarici açar məhdudiyyətləri
ALTER TABLE "product_3d_models" ADD CONSTRAINT "product_3d_models_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

