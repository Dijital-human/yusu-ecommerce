/**
 * Product Media Carousel Component / Məhsul Media Karusel Komponenti
 * Carousel for product images and videos / Məhsul şəkilləri və videoları üçün karusel
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProductVideoPlayer } from './ProductVideoPlayer';
import { ProductImageZoom } from './ProductImageZoom';
import { ProductImageHoverZoom } from './ProductImageHoverZoom';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  alt?: string;
}

interface ProductMediaCarouselProps {
  images: string[];
  videos?: Array<{
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
  }>;
  className?: string;
  enableHoverZoom?: boolean;
}

export function ProductMediaCarousel({
  images,
  videos = [],
  className = '',
  enableHoverZoom = true,
}: ProductMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Combine images and videos / Şəkilləri və videoları birləşdir
  const mediaItems: MediaItem[] = [
    ...images.map((img, index) => ({
      id: `image-${index}`,
      type: 'image' as const,
      url: img,
      alt: `Product image ${index + 1}`,
    })),
    ...videos.map((video) => ({
      id: video.id,
      type: 'video' as const,
      url: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
    })),
  ];

  if (mediaItems.length === 0) {
    return null;
  }

  const currentItem = mediaItems[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowZoom(true);
  };

  return (
    <div className={className}>
      {/* Main Media Display / Əsas Media Göstəricisi */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
        {currentItem.type === 'image' ? (
          enableHoverZoom ? (
            <ProductImageHoverZoom
              imageUrl={currentItem.url}
              alt={currentItem.alt || 'Product image'}
              className="w-full h-full"
            />
          ) : (
            <Image
              src={currentItem.url}
              alt={currentItem.alt || 'Product image'}
              fill
              className="object-cover cursor-zoom-in"
              onClick={() => handleImageClick(currentItem.url)}
            />
          )
        ) : (
          <ProductVideoPlayer
            videoUrl={currentItem.url}
            thumbnailUrl={currentItem.thumbnailUrl}
            autoplay={false}
            muted={true}
            controls={true}
            className="w-full h-full"
          />
        )}

        {/* Navigation Arrows / Naviqasiya Oxları */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 p-2 shadow-lg transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 p-2 shadow-lg transition-all"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Media Type Indicator / Media Tipi Göstəricisi */}
        {currentItem.type === 'video' && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Play className="h-3 w-3" />
            Video
          </div>
        )}
      </div>

      {/* Thumbnail Gallery / Thumbnail Qalereyası */}
      {mediaItems.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mediaItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {item.type === 'image' ? (
                <Image
                  src={item.url}
                  alt={item.alt || `Thumbnail ${index + 1}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt="Video thumbnail"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Play className="h-6 w-6 text-gray-400" />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Zoom Modal / Şəkil Zoom Modal */}
      {showZoom && selectedImage && (
        <ProductImageZoom
          imageUrl={selectedImage}
          alt="Product image"
          isOpen={showZoom}
          onClose={() => {
            setShowZoom(false);
            setSelectedImage(null);
          }}
        />
      )}
    </div>
  );
}

