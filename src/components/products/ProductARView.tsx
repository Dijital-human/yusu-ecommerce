/**
 * Product AR View Component / Məhsul AR Görünüş Komponenti
 * AR preview using WebXR / WebXR istifadə edərək AR önizləmə
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { isARSupported, getARPlatform, getARButtonText } from '@/lib/ar/ar-viewer';

interface ProductARViewProps {
  modelUrl: string;
  onClose?: () => void;
}

export function ProductARView({ modelUrl, onClose }: ProductARViewProps) {
  const t = useTranslations('products');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'webxr' | 'unsupported'>('unsupported');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkARSupport();
  }, []);

  const checkARSupport = async () => {
    const supported = await isARSupported();
    const platformInfo = getARPlatform();
    setIsSupported(supported);
    setPlatform(platformInfo);
    setIsLoading(false);

    if (!supported && platformInfo === 'unsupported') {
      setError(t('arNotSupported') || 'AR is not supported on this device / AR bu cihazda dəstəklənmir');
    }
  };

  const handleStartAR = async () => {
    if (platform === 'ios') {
      // iOS ARKit - Use Quick Look / iOS ARKit - Quick Look istifadə et
      window.location.href = modelUrl.replace(/\.(gltf|glb)$/, '.usdz');
    } else if (platform === 'android') {
      // Android ARCore - Use Scene Viewer / Android ARCore - Scene Viewer istifadə et
      const sceneViewerUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(modelUrl)}&mode=ar_only`;
      window.open(sceneViewerUrl, '_blank');
    } else if (platform === 'webxr') {
      // WebXR - Initialize AR session / WebXR - AR sessiyasını başlat
      try {
        await initializeWebXR();
      } catch (err) {
        setError(t('arInitializationFailed') || 'Failed to initialize AR / AR başlatmaq uğursuz oldu');
      }
    }
  };

  const initializeWebXR = async () => {
    if (typeof navigator === 'undefined' || !navigator.xr) {
      throw new Error('WebXR not available / WebXR mövcud deyil');
    }

    // This would require a full WebXR implementation / Bu tam WebXR tətbiqi tələb edir
    // For now, we'll show a message / İndilik mesaj göstərəcəyik
    setError(t('webxrNotImplemented') || 'WebXR AR is not fully implemented yet / WebXR AR hələ tam tətbiq olunmayıb');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                {t('close') || 'Close'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">
            {t('arPreview') || 'AR Preview'}
          </h3>
          <p className="text-sm text-gray-600">
            {t('arPreviewDescription') || 'View this product in augmented reality / Bu məhsulu artırılmış reallıqda görüntüləyin'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={handleStartAR} disabled={!isSupported}>
              {getARButtonText(platform)}
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline">
                <X className="h-4 w-4 mr-2" />
                {t('close') || 'Close'}
              </Button>
            )}
          </div>
          {platform === 'ios' && (
            <p className="text-xs text-gray-500 mt-4">
              {t('iosARNote') || 'Note: iOS requires USDZ format. Please convert your model to USDZ. / Qeyd: iOS USDZ formatı tələb edir. Zəhmət olmasa modelinizi USDZ-ə çevirin.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

