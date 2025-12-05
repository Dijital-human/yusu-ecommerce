/**
 * Size Guide Modal Component / Ölçü Bələdçisi Modal Komponenti
 * Displays size guide in a modal / Modal-də ölçü bələdçisini göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { Ruler } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface SizeGuide {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category?: {
    id: string;
    name: string;
  };
}

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
}

export function SizeGuideModal({ isOpen, onClose, categoryId }: SizeGuideModalProps) {
  const t = useTranslations("products");
  const [sizeGuide, setSizeGuide] = useState<SizeGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && categoryId) {
      fetchSizeGuide();
    } else if (isOpen && !categoryId) {
      // If no category, try to get general size guide / Əgər kateqoriya yoxdursa, ümumi ölçü bələdçisini al
      fetchAllSizeGuides();
    }
  }, [isOpen, categoryId]);

  const fetchSizeGuide = async () => {
    if (!categoryId) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/size-guides/category/${categoryId}`);
      const data = await response.json();

      if (data.success && data.data.sizeGuide) {
        setSizeGuide(data.data.sizeGuide);
      } else {
        setError(data.error || "Size guide not found");
      }
    } catch (err) {
      setError("Failed to fetch size guide");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSizeGuides = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/size-guides");
      const data = await response.json();

      if (data.success && data.data.sizeGuides && data.data.sizeGuides.length > 0) {
        // Use first general guide / İlk ümumi bələdçini istifadə et
        setSizeGuide(data.data.sizeGuides[0]);
      } else {
        setError("No size guide available");
      }
    } catch (err) {
      setError("Failed to fetch size guide");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            {t("sizeGuide") || "Size Guide"}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : sizeGuide ? (
          <div className="space-y-6">
            {sizeGuide.imageUrl && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={sizeGuide.imageUrl}
                  alt={sizeGuide.title}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold mb-4">{sizeGuide.title}</h3>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sizeGuide.content }}
              />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

