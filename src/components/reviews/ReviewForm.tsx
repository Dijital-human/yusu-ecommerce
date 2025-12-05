/**
 * Review Form Component / Rəy Formu Komponenti
 * This component allows users to write reviews for products
 * Bu komponent istifadəçilərə məhsullar üçün rəy yazmağa imkan verir
 */

"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Star, AlertCircle, CheckCircle, Image as ImageIcon, X } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image selection / Şəkil seçimini idarə et
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      setError(t("maxImages") || "Maximum 5 images allowed / Maksimum 5 şəkil icazə verilir");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create previews / Önizləmələr yarat
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Remove image / Şəkli sil
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (rating === 0) {
      setError(t("required"));
      return;
    }

    try {
      setLoading(true);
      
      // Create review first / Əvvəlcə rəy yarat
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to submit review");
        return;
      }

      const reviewId = data.data?.id;

      // Upload images if any / Əgər şəkillər varsa yüklə
      if (images.length > 0 && reviewId) {
        const formData = new FormData();
        images.forEach((image) => {
          formData.append('images', image);
        });

        try {
          await fetch(`/api/products/${productId}/reviews/${reviewId}/images`, {
            method: "POST",
            body: formData,
          });
        } catch (imageError) {
          console.error("Error uploading images:", imageError);
          // Don't fail review if image upload fails / Şəkil yükləmə uğursuz olarsa rəyi uğursuz etmə
        }
      }

      setSuccess(true);
      setRating(0);
      setComment("");
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("writeReview")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{t("reviewSubmitted")}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label>{t("yourRating")} *</Label>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">{t("yourComment")}</Label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("yourComment")}
            />
          </div>

          {/* Image upload / Şəkil yükləmə */}
          <div>
            <Label>{t("addImages") || "Add Images / Şəkillər Əlavə Et"} (Max 5)</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="review-images"
              />
              <label
                htmlFor="review-images"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                {t("selectImages") || "Select Images / Şəkillər Seç"}
              </label>
            </div>
            
            {/* Image previews / Şəkil önizləmələri */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button type="submit" disabled={loading || rating === 0}>
              {loading ? tCommon("loading") : t("submit")}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

