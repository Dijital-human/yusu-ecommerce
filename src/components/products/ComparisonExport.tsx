/**
 * Comparison Export Component / Müqayisə Export Komponenti
 * Export comparison to PDF or CSV / Müqayisəni PDF və ya CSV formatında export et
 */

'use client';

import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
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

interface ComparisonExportProps {
  products: Product[];
}

export function ComparisonExport({ products }: ComparisonExportProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');

  const exportToCSV = () => {
    if (products.length === 0) return;

    const headers = [
      t('name') || 'Name',
      t('price') || 'Price',
      t('originalPrice') || 'Original Price',
      t('rating') || 'Rating',
      t('reviewCount') || 'Review Count',
      t('stock') || 'Stock',
      t('category') || 'Category',
      t('seller') || 'Seller',
      t('description') || 'Description',
    ];

    const rows = products.map((product) => [
      product.name,
      product.price.toString(),
      product.originalPrice?.toString() || '',
      product.averageRating?.toString() || '',
      product.reviewCount?.toString() || '',
      product.stock.toString(),
      product.category?.name || '',
      product.seller?.name || '',
      product.description || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `product-comparison-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    // PDF export would require a library like jsPDF or pdfmake
    // For now, we'll use window.print() as a simple solution
    // In production, you might want to use a server-side PDF generation
    window.print();
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {t('exportCSV') || 'Export CSV'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        {t('exportPDF') || 'Export PDF'}
      </Button>
    </div>
  );
}

