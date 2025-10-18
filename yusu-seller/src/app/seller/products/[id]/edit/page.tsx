"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { 
  Package, 
  ArrowLeft, 
  Save, 
  Loader2,
  Upload,
  X
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { ExclamationTriangleIcon, CheckCircledIcon } from "@radix-ui/react-icons";

// Product update schema / Məhsul yeniləmə sxemi
const productSchema = z.object({
  name: z.string().min(1, "Product name is required / Məhsul adı tələb olunur"),
  description: z.string().min(10, "Description must be at least 10 characters / Təsvir ən azı 10 simvol olmalıdır"),
  price: z.number().positive("Price must be positive / Qiymət müsbət olmalıdır"),
  stock: z.number().int().min(0, "Stock cannot be negative / Stok mənfi ola bilməz"),
  categoryId: z.string().min(1, "Category is required / Kateqoriya tələb olunur"),
  isActive: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: string[];
  category: {
    id: string;
    name: string;
  };
}

export default function EditProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.role !== "SELLER") {
      router.push("/auth/signin");
      return;
    }

    fetchProduct();
    fetchCategories();
  }, [session, status, router, productId]);

  const fetchProduct = async () => {
    setIsLoadingProduct(true);
    setError(null);
    try {
      const res = await fetch(`/api/seller/products/${productId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }
      const productData = await res.json();
      setProduct(productData);
      setImages(productData.images || []);
      
      // Set form values
      setValue("name", productData.name);
      setValue("description", productData.description);
      setValue("price", productData.price);
      setValue("stock", productData.stock);
      setValue("categoryId", productData.categoryId);
      setValue("isActive", productData.isActive);
    } catch (err: any) {
      setError(err.message || "Failed to fetch product");
      console.error("Error fetching product:", err);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch categories");
      console.error("Error fetching categories:", err);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newImages.push(e.target.result as string);
            if (newImages.length === files.length) {
              setImages(prev => [...prev, ...newImages]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/seller/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          images,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      setSuccess("Product updated successfully / Məhsul uğurla yeniləndi");
      setTimeout(() => {
        router.push("/seller/products");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred while updating product");
      console.error("Error updating product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoadingProduct) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found / Məhsul tapılmadı</h1>
            <Button onClick={() => router.push("/seller/products")}>
              Back to Products / Məhsullara Qayıt
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        {/* Header / Başlıq */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back / Geri
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Product / Məhsul Redaktə Et</h1>
              <p className="text-gray-600 mt-2">Update product information / Məhsul məlumatlarını yenilə</p>
            </div>
          </div>
        </div>

        {/* Form / Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Information / Məhsul Məlumatları
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Error/Success Messages / Xəta/Uğur Mesajları */}
                {error && (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error / Xəta</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <CheckCircledIcon className="h-4 w-4" />
                    <AlertTitle>Success / Uğurlu</AlertTitle>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                {/* Product Name / Məhsul Adı */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name / Məhsul Adı *</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name / Məhsul adını daxil edin"
                    {...register("name")}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Description / Təsvir */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description / Təsvir *</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description / Məhsul təsvirini daxil edin"
                    rows={4}
                    {...register("description")}
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description.message}</p>
                  )}
                </div>

                {/* Price and Stock / Qiymət və Stok */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price / Qiymət ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("price", { valueAsNumber: true })}
                      disabled={isLoading}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500">{errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock / Stok *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      {...register("stock", { valueAsNumber: true })}
                      disabled={isLoading}
                    />
                    {errors.stock && (
                      <p className="text-sm text-red-500">{errors.stock.message}</p>
                    )}
                  </div>
                </div>

                {/* Category / Kateqoriya */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category / Kateqoriya *</Label>
                  <Select
                    onValueChange={(value) => setValue("categoryId", value)}
                    disabled={isLoading}
                    defaultValue={product.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category / Kateqoriya seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Status / Status */}
                <div className="space-y-2">
                  <Label>Status / Status</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register("isActive")}
                      disabled={isLoading}
                      className="rounded"
                    />
                    <Label htmlFor="isActive" className="text-sm">
                      Active / Aktiv
                    </Label>
                  </div>
                </div>

                {/* Image Upload / Şəkil Yükləmə */}
                <div className="space-y-2">
                  <Label>Product Images / Məhsul Şəkilləri</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload images / Şəkilləri yüklə
                          </span>
                          <span className="mt-1 block text-sm text-gray-500">
                            PNG, JPG, GIF up to 10MB / PNG, JPG, GIF 10MB-ə qədər
                          </span>
                        </Label>
                        <input
                          id="image-upload"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Display uploaded images / Yüklənmiş şəkilləri göstər */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => removeImage(index)}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button / Göndər Düyməsi */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancel / Ləğv Et
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating... / Yenilənir...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Product / Məhsul Yenilə
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
