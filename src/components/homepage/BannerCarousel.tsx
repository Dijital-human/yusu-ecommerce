/**
 * Banner Carousel Component / Banner Carousel Komponenti
 * Displays banners in a carousel format
 * Banner-ləri carousel formatında göstərir
 */

"use client";

import { Link } from "@/i18n/routing";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  position: string;
  priority: number;
}

interface BannerCarouselProps {
  banners: Banner[];
  position: "top" | "middle" | "bottom";
}

export function BannerCarousel({ banners, position }: BannerCarouselProps) {
  if (!banners || banners.length === 0) return null;

  const handleBannerClick = async (bannerId: string) => {
    try {
      // Track banner click / Banner klikini izlə
      await fetch(`/api/banners/${bannerId}/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to track banner click:", error);
    }
  };

  const handleBannerView = async (bannerId: string) => {
    try {
      // Track banner impression / Banner görüntüləməsini izlə
      await fetch(`/api/banners/${bannerId}/impression`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Failed to track banner impression:", error);
    }
  };

  // Sort by priority / Prioritetə görə sırala
  const sortedBanners = [...banners].sort((a, b) => b.priority - a.priority);

  return (
    <section className={`py-8 ${position === "top" ? "bg-gray-50" : position === "bottom" ? "bg-gray-100" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBanners.map((banner) => {
            const content = (
              <div
                className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                onMouseEnter={() => handleBannerView(banner.id)}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.png";
                  }}
                />
                {(banner.title || banner.subtitle) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    {banner.title && (
                      <h3 className="text-white font-semibold text-lg mb-1">{banner.title}</h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/90 text-sm">{banner.subtitle}</p>
                    )}
                  </div>
                )}
              </div>
            );

            if (banner.link) {
              return (
                <Link
                  key={banner.id}
                  href={banner.link}
                  onClick={() => handleBannerClick(banner.id)}
                >
                  {content}
                </Link>
              );
            }

            return <div key={banner.id}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}

