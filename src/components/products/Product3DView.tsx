/**
 * Product 3D View Component / Məhsul 3D Görünüş Komponenti
 * 3D model viewer using Three.js / Three.js istifadə edərək 3D model görüntüləyici
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, RotateCw, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Product3DViewProps {
  modelUrl: string;
  className?: string;
}

export function Product3DView({ modelUrl, className }: Product3DViewProps) {
  const t = useTranslations('products');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scene: any;
    let camera: any;
    let renderer: any;
    let model: any;
    let animationId: number;

    const init3DView = async () => {
      try {
        // Dynamic import for Three.js (client-side only) / Three.js üçün dinamik import (yalnız client-side)
        // Note: Three.js must be installed: npm install three @types/three
        // Qeyd: Three.js quraşdırılmalıdır: npm install three @types/three
        let THREE: any;
        let GLTFLoader: any;
        let OrbitControls: any;

        try {
          // @ts-ignore - Three.js may not be installed / Three.js quraşdırılmayıb ola bilər
          THREE = await import('three');
          // @ts-ignore
          GLTFLoader = (await import('three/examples/jsm/loaders/GLTFLoader.js')).GLTFLoader;
          // @ts-ignore
          OrbitControls = (await import('three/examples/jsm/controls/OrbitControls.js')).OrbitControls;
        } catch (importError) {
          setError('Three.js is not installed. Please install: npm install three @types/three / Three.js quraşdırılmayıb. Zəhmət olmasa quraşdırın: npm install three @types/three');
          setIsLoading(false);
          return;
        }

        if (!containerRef.current) return;

        // Setup scene / Səhnəni quraşdır
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);

        // Setup camera / Kameranı quraşdır
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 5);

        // Setup renderer / Renderer-i quraşdır
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        containerRef.current.appendChild(renderer.domElement);

        // Setup controls / Kontrolları quraşdır
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Setup lighting / İşıqlandırmayı quraşdır
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Load model / Modeli yüklə
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf: any) => {
            model = gltf.scene;
            scene.add(model);

            // Center and scale model / Modeli mərkəzləşdir və miqyasla
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2 / maxDim;

            model.scale.multiplyScalar(scale);
            model.position.sub(center.multiplyScalar(scale));

            setIsLoading(false);
          },
          undefined,
          (error: any) => {
            console.error('Error loading 3D model', error);
            setError('Failed to load 3D model / 3D model yükləmək uğursuz oldu');
            setIsLoading(false);
          }
        );

        // Animation loop / Animasiya döngüsü
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Handle resize / Ölçü dəyişikliyini idarə et
        const handleResize = () => {
          if (!containerRef.current) return;
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup / Təmizləmə
        return () => {
          window.removeEventListener('resize', handleResize);
          cancelAnimationFrame(animationId);
          if (containerRef.current && renderer.domElement) {
            containerRef.current.removeChild(renderer.domElement);
          }
          renderer.dispose();
        };
      } catch (err) {
        console.error('Error initializing 3D view', err);
        setError('Failed to initialize 3D view / 3D görünüşü başlatmaq uğursuz oldu');
        setIsLoading(false);
      }
    };

    init3DView();
  }, [modelUrl]);

  const handleReset = () => {
    // Reset view will be handled by OrbitControls / Görünüş sıfırlama OrbitControls tərəfindən idarə olunacaq
    window.location.reload();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        <div
          ref={containerRef}
          className="w-full h-[500px] bg-gray-100 rounded-lg relative"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {t('loading3DModel') || 'Loading 3D model...'}
                </p>
              </div>
            </div>
          )}

          {/* Controls / Kontrollar */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="bg-white"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFullscreen}
              className="bg-white"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            {t('3DViewInstructions') || 'Drag to rotate, scroll to zoom / Döndərmək üçün sürükləyin, yaxınlaşdırmaq üçün scroll edin'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

