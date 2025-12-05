/**
 * 3D Model Loader / 3D Model Yükləyici
 * Utility functions for loading and validating 3D models / 3D modelləri yükləmək və yoxlamaq üçün yardımçı funksiyalar
 * 
 * Note: Three.js must be installed: npm install three @types/three
 * Qeyd: Three.js quraşdırılmalıdır: npm install three @types/three
 */

// Dynamic imports will be used in components / Komponentlərdə dinamik import istifadə olunacaq

/**
 * Validate 3D model file / 3D model faylını yoxla
 */
export function validate3DModelFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const validFormats = ['gltf', 'glb'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !validFormats.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'Invalid file format. Only GLTF and GLB files are supported / Etibarsız fayl formatı. Yalnız GLTF və GLB faylları dəstəklənir',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size exceeds 50MB limit / Fayl ölçüsü 50MB limitini aşır',
    };
  }

  return { isValid: true };
}

/**
 * Load 3D model from URL / URL-dən 3D model yüklə
 * Note: This function requires Three.js to be installed / Qeyd: Bu funksiya Three.js quraşdırılmasını tələb edir
 */
export async function load3DModel(
  url: string,
  onProgress?: (progress: number) => void
): Promise<any> {
  // Dynamic import for Three.js / Three.js üçün dinamik import
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
  
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    // Setup DRACO loader for compressed models / Sıxılmış modellər üçün DRACO loader quraşdır
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        resolve(gltf.scene);
      },
      (progress) => {
        if (onProgress && progress.total > 0) {
          onProgress((progress.loaded / progress.total) * 100);
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Get 3D model info / 3D model məlumatını al
 * Note: This function requires Three.js to be installed / Qeyd: Bu funksiya Three.js quraşdırılmasını tələb edir
 */
export async function get3DModelInfo(url: string): Promise<{
  format: string;
  size: number;
  hasAnimations: boolean;
  meshCount: number;
}> {
  // Dynamic import for Three.js / Three.js üçün dinamik import
  const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
  const THREE = await import('three');
  
  const loader = new GLTFLoader();
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        let meshCount = 0;
        let hasAnimations = gltf.animations.length > 0;

        scene.traverse((child: any) => {
          if (child instanceof THREE.Mesh) {
            meshCount++;
          }
        });

        resolve({
          format: url.endsWith('.glb') ? 'glb' : 'gltf',
          size: 0, // Size would need to be fetched separately / Ölçü ayrıca alınmalıdır
          hasAnimations,
          meshCount,
        });
      },
      undefined,
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Generate 3D model thumbnail / 3D model thumbnail yarat
 * Note: This function requires Three.js to be installed / Qeyd: Bu funksiya Three.js quraşdırılmasını tələb edir
 */
export async function generate3DModelThumbnail(
  modelUrl: string,
  width: number = 512,
  height: number = 512
): Promise<string> {
  // Dynamic import for Three.js / Three.js üçün dinamik import
  const THREE = await import('three');
  const model = await load3DModel(modelUrl);
  
  return new Promise(async (resolve, reject) => {
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);

      // Model already loaded / Model artıq yüklənib
      scene.add(model);

      // Setup lighting / İşıqlandırmayı quraşdır
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Center and scale model / Modeli mərkəzləşdir və miqyasla
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim;

      model.scale.multiplyScalar(scale);
      model.position.sub(center.multiplyScalar(scale));

      // Position camera / Kameranı yerləşdir
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0);

      // Render / Render et
      renderer.render(scene, camera);

      // Convert to data URL / Data URL-ə çevir
      const dataUrl = renderer.domElement.toDataURL('image/png');
      resolve(dataUrl);
    } catch (error) {
      reject(error);
    }
  });
}

