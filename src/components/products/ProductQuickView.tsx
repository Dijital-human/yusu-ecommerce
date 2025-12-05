"use client";

/**
 * Product Quick View Modal / Məhsul Tez Baxış Modalı
 * Shows a lightweight product preview in a modal. Fetches minimal product data by id.
 */

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/AlertDialog";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface Props {
  productId: string;
  onClose: () => void;
}

export default function ProductQuickView({ productId, onClose }: Props) {
  const t = useTranslations('common');
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (mounted) setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProduct();
    return () => { mounted = false; };
  }, [productId]);

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin h-6 w-6 border-b-2 rounded-full" />
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative h-80">
                <Image src={product.images || '/placeholder-product.jpg'} alt={product.name} fill className="object-cover rounded" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <div className="text-lg font-semibold text-gray-900 mb-2">{formatCurrency(product.price)}</div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-4">{product.description}</p>
                <div className="flex items-center space-x-2">
                  <Link href={`/products/${product.id}`} onClick={onClose}>
                    <Button>
                      {t('viewFullProduct')}
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={onClose}>{t('close')}</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">Product not found / Məhsul tapılmadı</div>
          )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
