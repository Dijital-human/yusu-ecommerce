/**
 * Product 360° Viewer Component / Məhsul 360° Görüntüləyici Komponenti
 * Interactive 360° product viewer / İnteraktiv 360° məhsul görüntüləyici
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { calculateFrameIndex, preloadImages } from '@/lib/utils/360-viewer';

interface Product360ViewerProps {
  imageUrls: string[];
  thumbnailUrl?: string;
  onClose?: () => void;
  className?: string;
}

export function Product360Viewer({
  imageUrls,
  thumbnailUrl,
  onClose,
  className = '',
}: Product360ViewerProps) {
  const t = useTranslations('products');
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const autoRotateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const frameCount = imageUrls.length;

  // Preload images / Şəkilləri ön-yüklə
  useEffect(() => {
    setIsLoading(true);
    preloadImages(imageUrls)
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error preloading images:', error);
        setIsLoading(false);
      });
  }, [imageUrls]);

  // Auto-rotate effect / Avtomatik fırlanma effekti
  useEffect(() => {
    if (isAutoRotating && !isDragging) {
      autoRotateIntervalRef.current = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = prev + 1;
          const frameIndex = calculateFrameIndex(newAngle, frameCount);
          setCurrentFrame(frameIndex);
          return newAngle;
        });
      }, 50); // Rotate every 50ms / Hər 50ms-də fırlan
    } else {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
        autoRotateIntervalRef.current = null;
      }
    }

    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, [isAutoRotating, isDragging, frameCount]);

  // Mouse drag handlers / Mouse sürükləmə handler-ləri
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setIsAutoRotating(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const deltaX = e.clientX - startX;
      const width = containerRef.current.clientWidth;
      const angleDelta = (deltaX / width) * 360;
      const newAngle = rotationAngle + angleDelta;
      const frameIndex = calculateFrameIndex(newAngle, frameCount);

      setRotationAngle(newAngle);
      setCurrentFrame(frameIndex);
      setStartX(e.clientX);
    },
    [isDragging, startX, rotationAngle, frameCount]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers / Touch handler-ləri
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsAutoRotating(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const deltaX = e.touches[0].clientX - startX;
      const width = containerRef.current.clientWidth;
      const angleDelta = (deltaX / width) * 360;
      const newAngle = rotationAngle + angleDelta;
      const frameIndex = calculateFrameIndex(newAngle, frameCount);

      setRotationAngle(newAngle);
      setCurrentFrame(frameIndex);
      setStartX(e.touches[0].clientX);
    },
    [isDragging, startX, rotationAngle, frameCount]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Zoom handlers / Yaxınlaşdırma handler-ləri
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  }, []);

  // Fullscreen handlers / Tam ekran handler-ləri
  const handleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Auto-rotate toggle / Avtomatik fırlanma toggle
  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => !prev);
  }, []);

  // Update frame when rotation angle changes / Fırlanma bucağı dəyişəndə kadrı yenilə
  useEffect(() => {
    const frameIndex = calculateFrameIndex(rotationAngle, frameCount);
    setCurrentFrame(frameIndex);
  }, [rotationAngle, frameCount]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-gray-900 ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button / Bağlama düyməsi */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          aria-label={t('close') || 'Close'}
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Controls / Kontrollar */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAutoRotate}
          className="bg-black bg-opacity-50 text-white border-white/20 hover:bg-opacity-70"
        >
          {isAutoRotating ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          className="bg-black bg-opacity-50 text-white border-white/20 hover:bg-opacity-70"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          className="bg-black bg-opacity-50 text-white border-white/20 hover:bg-opacity-70"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFullscreen}
          className="bg-black bg-opacity-50 text-white border-white/20 hover:bg-opacity-70"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Image display / Şəkil göstəricisi */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="text-white text-center">
            <RotateCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>{t('loading360View') || 'Loading 360° view...'}</p>
          </div>
        ) : (
          <Image
            ref={imageRef}
            src={imageUrls[currentFrame]}
            alt={`360° view frame ${currentFrame + 1}`}
            width={800}
            height={800}
            className="object-contain transition-opacity duration-200"
            style={{
              transform: `scale(${zoom})`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            priority
          />
        )}
      </div>

      {/* Instructions / Təlimatlar */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
        {t('360ViewInstructions') || 'Drag to rotate, use controls to zoom / Fırlanmaq üçün sürükləyin, yaxınlaşdırmaq üçün kontrollardan istifadə edin'}
      </div>

      {/* Frame indicator / Kadr göstəricisi */}
      <div className="absolute bottom-4 right-4 z-20 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
        {currentFrame + 1} / {frameCount}
      </div>
    </div>
  );
}

