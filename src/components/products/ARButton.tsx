/**
 * AR Button Component / AR Düymə Komponenti
 * Button to launch AR preview / AR önizləməni başlatmaq üçün düymə
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Box } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ProductARView } from './ProductARView';
import { isARSupported, getARPlatform, getARButtonText } from '@/lib/ar/ar-viewer';

interface ARButtonProps {
  modelUrl: string;
  className?: string;
}

export function ARButton({ modelUrl, className }: ARButtonProps) {
  const t = useTranslations('products');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'webxr' | 'unsupported'>('unsupported');
  const [showARView, setShowARView] = useState(false);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    const supported = await isARSupported();
    const platformInfo = getARPlatform();
    setIsSupported(supported);
    setPlatform(platformInfo);
  };

  if (isSupported === null) {
    return null; // Still checking / Hələ yoxlanılır
  }

  if (!isSupported && platform === 'unsupported') {
    return null; // Don't show button if AR is not supported / AR dəstəklənmirsə düyməni göstərmə
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowARView(true)}
        className={className}
      >
        <Box className="h-4 w-4 mr-2" />
        {getARButtonText(platform)}
      </Button>

      {showARView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <ProductARView
              modelUrl={modelUrl}
              onClose={() => setShowARView(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

