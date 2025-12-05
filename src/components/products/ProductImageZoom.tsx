/**
 * Product Image Zoom Component / Məhsul Şəkil Zoom Komponenti
 * Image zoom with lightbox functionality / Lightbox funksionallığı ilə şəkil zoom
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { calculateZoomTransform, getZoomFromWheel, getImagePositionFromMouse } from '@/lib/media/image-zoom';
import { useTranslations } from 'next-intl';

interface ProductImageZoomProps {
  imageUrl: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductImageZoom({ imageUrl, alt, isOpen, onClose }: ProductImageZoomProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const t = useTranslations('products');

  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = getZoomFromWheel(e.deltaY, scale);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pinch zoom / Pinch zoom üçün touch handler-lar
  const [touchDistance, setTouchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  const getTouchDistance = (touches: TouchList): number => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      setTouchDistance(distance);
      setInitialScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance !== null) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches);
      const newScale = (distance / touchDistance) * initialScale;
      setScale(Math.max(1, Math.min(5, newScale)));
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(null);
  };

  const handleZoomIn = () => {
    setScale(Math.min(5, scale + 0.5));
  };

  const handleZoomOut = () => {
    const newScale = Math.max(1, scale - 0.5);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  const transform = calculateZoomTransform(
    imageRef.current?.getBoundingClientRect() || new DOMRect(),
    containerRef.current?.getBoundingClientRect() || new DOMRect(),
    scale,
    position.x,
    position.y
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center p-4"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button / Bağla Düyməsi */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 p-2 text-white transition-colors"
          aria-label={t('close') || 'Close'}
        >
          <X className="h-6 w-6" />
        </button>

        {/* Zoom Controls / Zoom Kontrolları */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomIn();
            }}
            variant="outline"
            size="sm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white/30"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleZoomOut();
            }}
            variant="outline"
            size="sm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white/30"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleReset();
            }}
            variant="outline"
            size="sm"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white/30"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Image / Şəkil */}
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt || 'Product image'}
          className="max-w-full max-h-full object-contain cursor-move"
          style={{
            transform: transform.transform,
            transformOrigin: transform.origin,
          }}
          draggable={false}
        />

        {/* Zoom Level Indicator / Zoom Səviyyəsi Göstəricisi */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}

