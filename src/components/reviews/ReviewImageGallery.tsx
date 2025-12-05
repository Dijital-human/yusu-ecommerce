/**
 * Review Image Gallery Component / Rəy Şəkil Qalereyası Komponenti
 * Display review images in a gallery / Rəy şəkillərini qalereyada göstər
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReviewImageGalleryProps {
  images: Array<{
    id: string;
    imageUrl: string;
    order: number;
  }>;
}

export function ReviewImageGallery({ images }: ReviewImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const handleImageClick = (index: number) => {
    setSelectedImage(index);
  };

  const handleNext = () => {
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  const handlePrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  return (
    <>
      <div className="flex gap-2 mt-2 flex-wrap">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleImageClick(index)}
          >
            <Image
              src={image.imageUrl}
              alt={`Review image ${index + 1}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Lightbox / Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 bg-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-5 w-5" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  disabled={selectedImage === 0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={selectedImage === images.length - 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            <div className="relative w-full h-[80vh]">
              <Image
                src={images[selectedImage].imageUrl}
                alt={`Review image ${selectedImage + 1}`}
                fill
                className="object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
                {selectedImage + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

