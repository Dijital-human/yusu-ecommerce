/**
 * Product Variant Selector Component / Məhsul Variantı Seçici Komponenti
 * Advanced variant selection with color swatches, size selection, etc. / Rəng swatch-ləri, ölçü seçimi və s. ilə təkmilləşdirilmiş variant seçimi
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTranslations } from 'next-intl';
import { VariantAttributes } from '@/lib/db/product-variants';
import { formatVariantName, getVariantImage, getStockStatusText } from '@/lib/products/variants';

interface ProductVariant {
  id: string;
  name: string;
  price?: number;
  stock: number;
  attributes: VariantAttributes;
  image?: string;
}

interface VariantCombinations {
  colors: string[];
  sizes: string[];
  materials: string[];
  combinations: Array<{
    attributes: VariantAttributes;
    variantId: string;
    price?: number;
    stock: number;
    image?: string;
  }>;
}

interface ProductVariantSelectorProps {
  productId: string;
  basePrice: number;
  productImages?: string[];
  onVariantSelect?: (variantId: string, variant: ProductVariant) => void;
  className?: string;
}

export function ProductVariantSelector({
  productId,
  basePrice,
  productImages = [],
  onVariantSelect,
  className = '',
}: ProductVariantSelectorProps) {
  const t = useTranslations('products');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [combinations, setCombinations] = useState<VariantCombinations | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<VariantAttributes>({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockCheckLoading, setStockCheckLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  useEffect(() => {
    if (selectedAttributes && Object.keys(selectedAttributes).length > 0) {
      findMatchingVariant();
    }
  }, [selectedAttributes, variants]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${productId}/variants?combinations=true`);
      const data = await response.json();
      
      if (data.success) {
        setVariants(data.data.variants || []);
        setCombinations(data.data.combinations || null);
      } else {
        setError(data.error || 'Failed to fetch variants');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch variants');
    } finally {
      setLoading(false);
    }
  };

  const findMatchingVariant = () => {
    const matchingVariant = variants.find((variant) => {
      const variantAttrs = variant.attributes;
      return Object.keys(selectedAttributes).every((key) => {
        return variantAttrs[key] === selectedAttributes[key];
      });
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      if (onVariantSelect) {
        onVariantSelect(matchingVariant.id, matchingVariant);
      }
    } else {
      setSelectedVariant(null);
    }
  };

  const handleAttributeSelect = async (key: string, value: string) => {
    setSelectedAttributes((prev) => {
      const newAttributes = {
        ...prev,
        [key]: value,
      };
      
      // Real-time stock check / Real-time stok yoxlama
      checkVariantStock(newAttributes);
      
      return newAttributes;
    });
  };

  const checkVariantStock = async (attributes: VariantAttributes) => {
    const matchingVariant = variants.find((variant) => {
      const variantAttrs = variant.attributes;
      return Object.keys(attributes).every((key) => {
        return variantAttrs[key] === attributes[key];
      });
    });

    if (matchingVariant) {
      const variantKey = `${matchingVariant.id}`;
      setStockCheckLoading((prev) => ({ ...prev, [variantKey]: true }));
      
      try {
        const response = await fetch(`/api/products/${productId}/variants?variantId=${matchingVariant.id}&quantity=1`);
        const data = await response.json();
        
        if (data.success && data.data) {
          // Update variant stock in local state / Lokal state-də variant stokunu yenilə
          setVariants((prev) =>
            prev.map((v) =>
              v.id === matchingVariant.id
                ? { ...v, stock: data.data.available ? data.data.stock : 0 }
                : v
            )
          );
        }
      } catch (error) {
        console.error('Failed to check variant stock:', error);
      } finally {
        setStockCheckLoading((prev) => ({ ...prev, [variantKey]: false }));
      }
    }
  };

  const getAvailableOptions = (key: string): string[] => {
    if (!combinations) return [];
    
    switch (key) {
      case 'color':
        return combinations.colors;
      case 'size':
        return combinations.sizes;
      case 'material':
        return combinations.materials;
      default:
        return [];
    }
  };

  const isOptionAvailable = (key: string, value: string): boolean => {
    if (!combinations) return false;
    
    const tempAttributes = { ...selectedAttributes, [key]: value };
    return combinations.combinations.some((combo) => {
      return Object.keys(tempAttributes).every((k) => {
        return combo.attributes[k] === tempAttributes[k];
      });
    });
  };

  const getCurrentPrice = (): number => {
    if (selectedVariant?.price !== undefined) {
      return selectedVariant.price;
    }
    return basePrice;
  };

  const getCurrentImage = (): string => {
    return getVariantImage(selectedVariant?.image, productImages);
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !combinations || variants.length === 0) {
    return null; // Don't show variant selector if no variants / Variant yoxdursa variant selector göstərmə
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Color Selection / Rəng Seçimi */}
      {combinations.colors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('color') || 'Color'} {selectedAttributes.color && `: ${selectedAttributes.color}`}
          </label>
          <div className="flex flex-wrap gap-2">
            {combinations.colors.map((color) => {
              const isSelected = selectedAttributes.color === color;
              const isAvailable = isOptionAvailable('color', color);
              
              // Find variant image for this color / Bu rəng üçün variant şəklini tap
              const colorVariant = combinations.combinations.find(
                (c) => c.attributes.color === color
              );
              const colorImage = colorVariant?.image;
              
              return (
                <button
                  key={color}
                  onClick={() => handleAttributeSelect('color', color)}
                  disabled={!isAvailable}
                  className={`
                    relative rounded-lg border-2 transition-all overflow-hidden
                    ${isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${colorImage ? 'w-16 h-16' : 'px-4 py-2'}
                  `}
                  title={color}
                >
                  {colorImage ? (
                    <Image
                      src={colorImage}
                      alt={color}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium">{color}</span>
                  )}
                  {isSelected && (
                    <Check className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 bg-white rounded-full shadow-sm" />
                  )}
                  {!isAvailable && (
                    <X className="absolute -top-1 -right-1 h-4 w-4 text-red-500 bg-white rounded-full shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection / Ölçü Seçimi */}
      {combinations.sizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('size') || 'Size'} {selectedAttributes.size && `: ${selectedAttributes.size}`}
          </label>
          <div className="flex flex-wrap gap-2">
            {combinations.sizes.map((size) => {
              const isSelected = selectedAttributes.size === size;
              const isAvailable = isOptionAvailable('size', size);
              const variant = combinations.combinations.find(
                (c) => c.attributes.size === size && 
                (!selectedAttributes.color || c.attributes.color === selectedAttributes.color)
              );
              const stockStatus = variant ? getStockStatusText(variant.stock) : null;
              
              return (
                <button
                  key={size}
                  onClick={() => handleAttributeSelect('size', size)}
                  disabled={!isAvailable}
                  className={`
                    relative px-4 py-2 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={size}
                >
                  <span className="text-sm font-medium">{size}</span>
                  {isSelected && (
                    <Check className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 bg-white rounded-full" />
                  )}
                  {!isAvailable && (
                    <X className="absolute -top-1 -right-1 h-4 w-4 text-red-500 bg-white rounded-full" />
                  )}
                  {stockStatus && variant && variant.stock > 0 && (
                    <Badge className={`absolute -bottom-1 -right-1 text-xs ${stockStatus.color}`}>
                      {variant.stock}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Material Selection / Material Seçimi */}
      {combinations.materials.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('material') || 'Material'} {selectedAttributes.material && `: ${selectedAttributes.material}`}
          </label>
          <div className="flex flex-wrap gap-2">
            {combinations.materials.map((material) => {
              const isSelected = selectedAttributes.material === material;
              const isAvailable = isOptionAvailable('material', material);
              
              return (
                <button
                  key={material}
                  onClick={() => handleAttributeSelect('material', material)}
                  disabled={!isAvailable}
                  className={`
                    relative px-4 py-2 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  title={material}
                >
                  <span className="text-sm font-medium">{material}</span>
                  {isSelected && (
                    <Check className="absolute -top-1 -right-1 h-4 w-4 text-blue-500 bg-white rounded-full" />
                  )}
                  {!isAvailable && (
                    <X className="absolute -top-1 -right-1 h-4 w-4 text-red-500 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info / Seçilmiş Variant Məlumatı */}
      {selectedVariant && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('selectedVariant') || 'Selected Variant'}: {selectedVariant.name}
            </span>
            <Badge className={getStockStatusText(selectedVariant.stock).color}>
              {getStockStatusText(selectedVariant.stock).text}
            </Badge>
          </div>
          <div className="text-lg font-bold text-gray-900">
            ${getCurrentPrice().toFixed(2)}
            {selectedVariant.price !== undefined && selectedVariant.price !== basePrice && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${basePrice.toFixed(2)}
              </span>
            )}
          </div>
          {selectedVariant.stock === 0 && (
            <p className="text-sm text-red-600 mt-2">
              {t('outOfStock') || 'Out of Stock'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

