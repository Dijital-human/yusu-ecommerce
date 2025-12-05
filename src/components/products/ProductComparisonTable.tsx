/**
 * Product Comparison Table Component / Məhsul Müqayisəsi Cədvəli Komponenti
 * Table view for comparing products side by side / Məhsulları yan-yana müqayisə etmək üçün cədvəl görünüşü
 */

'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string | string[];
  averageRating?: number;
  reviewCount?: number;
  stock: number;
  description?: string;
  category?: {
    name: string;
  };
  seller?: {
    name: string;
  };
}

interface ProductComparisonTableProps {
  products: Product[];
  onRemove: (productId: string) => void;
}

export function ProductComparisonTable({ products, onRemove }: ProductComparisonTableProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  if (products.length === 0) {
    return null;
  }

  const getImage = (product: Product): string => {
    if (Array.isArray(product.images)) {
      return product.images[0] || '/placeholder-product.jpg';
    }
    return product.images || '/placeholder-product.jpg';
  };

  const comparisonFields = [
    {
      label: t('image') || 'Image',
      render: (product: Product) => (
        <div className="relative aspect-square w-24 h-24 mx-auto">
          <Image
            src={getImage(product)}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      ),
    },
    {
      label: t('name') || 'Name',
      render: (product: Product) => (
        <Link href={`/products/${product.id}`} className="font-semibold text-blue-600 hover:underline">
          {product.name}
        </Link>
      ),
    },
    {
      label: t('price') || 'Price',
      render: (product: Product) => (
        <div>
          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      label: t('rating') || 'Rating',
      render: (product: Product) => (
        <div>
          {product.averageRating ? (
            <>
              <span className="font-semibold">{product.averageRating.toFixed(1)}</span>
              {product.reviewCount && (
                <span className="text-sm text-gray-500 ml-1">({product.reviewCount})</span>
              )}
            </>
          ) : (
            <span className="text-gray-500">{t('noRating') || 'No rating'}</span>
          )}
        </div>
      ),
    },
    {
      label: t('stock') || 'Stock',
      render: (product: Product) => (
        <span className={product.stock > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {product.stock > 0 ? `${product.stock} ${t('inStock') || 'In Stock'}` : t('outOfStock') || 'Out of Stock'}
        </span>
      ),
    },
    {
      label: t('category') || 'Category',
      render: (product: Product) => (
        <span>{product.category?.name || t('noCategory') || 'No category'}</span>
      ),
    },
    {
      label: t('seller') || 'Seller',
      render: (product: Product) => (
        <span>{product.seller?.name || t('noSeller') || 'No seller'}</span>
      ),
    },
    {
      label: t('description') || 'Description',
      render: (product: Product) => (
        <p className="text-sm line-clamp-3">{product.description || t('noDescription') || 'No description'}</p>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="p-4 text-left font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10">
              {t('feature') || 'Feature'}
            </th>
            {products.map((product) => (
              <th key={product.id} className="p-4 text-center font-semibold text-gray-900 bg-gray-50 relative min-w-[200px]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(product.id)}
                  className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="mt-6">
                  <Link href={`/products/${product.id}`} className="font-semibold text-blue-600 hover:underline">
                    {product.name}
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonFields.map((field, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10">
                {field.label}
              </td>
              {products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  {field.render(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

