/**
 * Product Video Gallery Component / Məhsul Video Qalereyası Komponenti
 * Gallery for multiple product videos / Çoxlu məhsul videoları üçün qalereya
 */

'use client';

import { useState } from 'react';
import { ProductVideoPlayer } from './ProductVideoPlayer';
import { Play } from 'lucide-react';

interface ProductVideo {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  type: string;
  duration?: number;
  isPrimary: boolean;
}

interface ProductVideoGalleryProps {
  videos: ProductVideo[];
  className?: string;
}

export function ProductVideoGallery({ videos, className = '' }: ProductVideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<ProductVideo | null>(
    videos.find((v) => v.isPrimary) || videos[0] || null
  );

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Main Video Player / Əsas Video Player */}
      {selectedVideo && (
        <div className="mb-4">
          <ProductVideoPlayer
            videoUrl={selectedVideo.videoUrl}
            thumbnailUrl={selectedVideo.thumbnailUrl}
            autoplay={false}
            muted={true}
            controls={true}
            className="w-full h-96"
          />
        </div>
      )}

      {/* Video Thumbnails / Video Thumbnail-ləri */}
      {videos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {videos.map((video) => (
            <button
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                selectedVideo?.id === video.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={`Video ${video.id}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Play className="h-8 w-8 text-gray-400" />
                </div>
              )}
              {video.duration && (
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              )}
              {video.isPrimary && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                  Primary
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

