/**
 * Order Filters Component / Sifariş Filtrləri Komponenti
 * Filter sidebar for orders / Sifarişlər üçün filtr sidebar
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { X, Filter, Calendar, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
  productName?: string;
  sellerName?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onClear: () => void;
}

export function OrderFilters({ filters, onFiltersChange, onClear }: OrderFiltersProps) {
  const t = useTranslations('orders');
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof OrderFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== undefined && v !== '').length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button / Filtr Açma Düyməsi */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('filters') || 'Filters'}
          {activeFiltersCount > 0 && (
            <Badge className="ml-2">{activeFiltersCount}</Badge>
          )}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            {t('clearAll') || 'Clear All'}
          </Button>
        )}
      </div>

      {/* Filter Panel / Filtr Paneli */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('filterOrders') || 'Filter Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Filter / Status Filtr */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('status') || 'Status'}
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">{t('allStatuses') || 'All Statuses'}</option>
                <option value="PENDING">{t('pending') || 'Pending'}</option>
                <option value="CONFIRMED">{t('confirmed') || 'Confirmed'}</option>
                <option value="SHIPPED">{t('shipped') || 'Shipped'}</option>
                <option value="DELIVERED">{t('delivered') || 'Delivered'}</option>
                <option value="CANCELLED">{t('cancelled') || 'Cancelled'}</option>
              </select>
            </div>

            {/* Date Range Filter / Tarix Aralığı Filtr */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('dateRange') || 'Date Range'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  placeholder={t('startDate') || 'Start Date'}
                />
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  placeholder={t('endDate') || 'End Date'}
                />
              </div>
            </div>

            {/* Price Range Filter / Qiymət Aralığı Filtr */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('priceRange') || 'Price Range'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder={t('minPrice') || 'Min'}
                />
                <Input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder={t('maxPrice') || 'Max'}
                />
              </div>
            </div>

            {/* Product Name Filter / Məhsul Adı Filtr */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('productName') || 'Product Name'}
              </label>
              <Input
                value={filters.productName || ''}
                onChange={(e) => handleFilterChange('productName', e.target.value)}
                placeholder={t('searchByProduct') || 'Search by product name'}
              />
            </div>

            {/* Seller Name Filter / Satıcı Adı Filtr */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sellerName') || 'Seller Name'}
              </label>
              <Input
                value={filters.sellerName || ''}
                onChange={(e) => handleFilterChange('sellerName', e.target.value)}
                placeholder={t('searchBySeller') || 'Search by seller name'}
              />
            </div>

            {/* Sort Options / Sıralama Seçimləri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sortBy') || 'Sort By'}
              </label>
              <div className="space-y-2">
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="createdAt">{t('date') || 'Date'}</option>
                  <option value="price">{t('price') || 'Price'}</option>
                  <option value="status">{t('status') || 'Status'}</option>
                </select>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="desc">{t('newestFirst') || 'Newest First'}</option>
                  <option value="asc">{t('oldestFirst') || 'Oldest First'}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Chips / Aktiv Filtr Çipləri */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('status')}: {filters.status}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('from')}: {filters.startDate}
              <button
                onClick={() => handleFilterChange('startDate', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('to')}: {filters.endDate}
              <button
                onClick={() => handleFilterChange('endDate', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.minPrice && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('min')}: ${filters.minPrice}
              <button
                onClick={() => handleFilterChange('minPrice', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.maxPrice && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t('max')}: ${filters.maxPrice}
              <button
                onClick={() => handleFilterChange('maxPrice', undefined)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

