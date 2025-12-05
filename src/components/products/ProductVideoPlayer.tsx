/**
 * Product Video Player Component / Məhsul Video Pleyer Komponenti
 * Video player for product videos / Məhsul videoları üçün video player
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import {
  isExternalVideoUrl,
  extractYouTubeVideoId,
  extractVimeoVideoId,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
} from '@/lib/db/product-videos';

interface ProductVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
}

export function ProductVideoPlayer({
  videoUrl,
  thumbnailUrl,
  autoplay = false,
  muted = false,
  controls = true,
  className = '',
}: ProductVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations('products');

  // Check if video is external (YouTube/Vimeo) / Video-nun xarici (YouTube/Vimeo) olub-olmadığını yoxla
  const isExternal = isExternalVideoUrl(videoUrl);
  const youtubeVideoId = extractYouTubeVideoId(videoUrl);
  const vimeoVideoId = extractVimeoVideoId(videoUrl);
  const embedUrl = youtubeVideoId
    ? getYouTubeEmbedUrl(youtubeVideoId)
    : vimeoVideoId
    ? getVimeoEmbedUrl(vimeoVideoId)
    : null;

  useEffect(() => {
    if (videoRef.current && autoplay) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, user interaction required / Autoplay uğursuz oldu, istifadəçi qarşılığı tələb olunur
      });
    }
  }, [autoplay]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
    }
  };

  // Render external video (YouTube/Vimeo) / Xarici video (YouTube/Vimeo) render et
  if (isExternal && embedUrl) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Product video"
          />
        </div>
      </div>
    );
  }

  // Render self-hosted video / Öz host edilən videonu render et
  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full object-cover rounded-lg"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        loop
      />

      {/* Controls Overlay / Kontrol Overlay */}
      {controls && (
        <div
          className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity ${
            showControls ? 'bg-opacity-30' : ''
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Play/Pause Button / Oynat/Duraklat Düyməsi */}
            <button
              onClick={togglePlay}
              className="rounded-full bg-black bg-opacity-50 p-4 text-white hover:bg-opacity-70 transition-all"
              aria-label={isPlaying ? t('pause') || 'Pause' : t('play') || 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8" />
              )}
            </button>
          </div>

          {/* Bottom Controls / Alt Kontrollar */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={toggleMute}
                className="rounded p-2 text-white hover:bg-white/20 transition-colors"
                aria-label={isMuted ? t('unmute') || 'Unmute' : t('mute') || 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={toggleFullscreen}
                className="rounded p-2 text-white hover:bg-white/20 transition-colors"
                aria-label={isFullscreen ? t('exitFullscreen') || 'Exit Fullscreen' : t('fullscreen') || 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

