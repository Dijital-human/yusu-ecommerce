/**
 * Product Image Hover Zoom Component / Məhsul Şəkil Hover Zoom Komponenti
 * Hover zoom functionality for product images / Məhsul şəkilləri üçün hover zoom funksionallığı
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';

interface ProductImageHoverZoomProps {
  imageUrl: string;
  alt?: string;
  zoomLevel?: number;
  zoomAreaSize?: number;
  className?: string;
}

export function ProductImageHoverZoom({
  imageUrl,
  alt = 'Product image',
  zoomLevel = 2,
  zoomAreaSize = 200,
  className = '',
}: ProductImageHoverZoomProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp mouse position within container bounds / Mouse mövqeyini container hədləri daxilində saxla
    const clampedX = Math.max(0, Math.min(rect.width, x));
    const clampedY = Math.max(0, Math.min(rect.height, y));

    setMousePosition({ x: clampedX, y: clampedY });

    // Calculate zoom position / Zoom mövqeyini hesabla
    const imageRect = imageRef.current.getBoundingClientRect();
    const relativeX = clampedX / rect.width;
    const relativeY = clampedY / rect.height;

    setZoomPosition({
      x: relativeX * 100,
      y: relativeY * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image / Əsas Şəkil */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Zoom Indicator / Zoom Göstəricisi */}
        {isHovering && (
          <div
            className="absolute pointer-events-none border-2 border-blue-500 bg-blue-500 bg-opacity-20"
            style={{
              width: `${zoomAreaSize}px`,
              height: `${zoomAreaSize}px`,
              left: `${mousePosition.x - zoomAreaSize / 2}px`,
              top: `${mousePosition.y - zoomAreaSize / 2}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </div>

      {/* Zoom Preview / Zoom Önizləməsi */}
      {isHovering && (
        <div
          ref={zoomRef}
          className="absolute right-0 top-0 w-96 h-96 border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xl z-10 pointer-events-none"
          style={{
            transform: 'translateX(calc(100% + 16px))',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
      )}

      {/* Zoom Icon / Zoom İkonu */}
      {isHovering && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full">
          <ZoomIn className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}

