/**
 * Camera Modal Component / Kamera Modal Komponenti
 * Allows users to capture images for visual search
 * İstifadəçilərə vizual axtarış üçün şəkil çəkmə imkanı verir
 */

"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { X, Camera, RotateCcw, Check, Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "next-intl";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageFile: File) => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function CameraModal({ isOpen, onClose, onCapture, buttonRef, onMouseEnter, onMouseLeave }: CameraModalProps) {
  const [mode, setMode] = useState<"camera" | "gallery" | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("search");
  const tCommon = useTranslations("common");

  // Validate image file / Şəkil faylını yoxla
  const validateImageFile = (file: File): string | null => {
    // Check file type / Fayl tipini yoxla
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Yalnız JPG, PNG və ya WEBP formatında şəkillər dəstəklənir.";
    }

    // Check file size (max 10MB) / Fayl ölçüsünü yoxla (maksimum 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "Şəkil ölçüsü 10MB-dan böyük ola bilməz.";
    }

    return null;
  };

  // Handle mode selection / Rejim seçimini idarə et
  const handleModeSelect = (selectedMode: "camera" | "gallery") => {
    setMode(selectedMode);
    setError(null);
    
    if (selectedMode === "camera") {
      startCamera();
    } else if (selectedMode === "gallery") {
      fileInputRef.current?.click();
    }
  };

  // Handle file selection from gallery / Qalereyadan fayl seçimini idarə et
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview / Önizləmə yarat
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Start camera stream / Kamera axınını başlat
  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if mediaDevices is available / mediaDevices-in mövcud olub olmadığını yoxla
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Kamera dəstəklənmir. Zəhmət olmasa müasir brauzer istifadə edin.");
        setIsLoading(false);
        return;
      }

      let mediaStream: MediaStream | null = null;

      // Detect mobile device / Mobil cihazı aşkarlama
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      // Video constraints - mobil üçün kiçik ölçülər, desktop üçün böyük ölçülər
      // Video məhdudiyyətləri - mobil üçün kiçik ölçülər, desktop üçün böyük ölçülər
      const videoConstraints = isMobile 
        ? { width: { ideal: 640 }, height: { ideal: 480 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } };

      // Try back camera first (environment), then fallback to front camera (user)
      // Əvvəlcə arxa kameranı cəhd et, sonra ön kameraya keç
      try {
        // Try back camera / Arxa kameranı cəhd et
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Back camera / Arxa kamera
            ...videoConstraints,
          },
        });
      } catch (backCameraError: any) {
        // If back camera fails, try front camera / Əgər arxa kamera uğursuz olarsa, ön kameranı cəhd et
        console.log("Back camera not available, trying front camera:", backCameraError);
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user", // Front camera / Ön kamera
              ...videoConstraints,
            },
          });
        } catch (frontCameraError: any) {
          // If both fail, try without facingMode constraint / Əgər hər ikisi uğursuz olarsa, facingMode məhdudiyyəti olmadan cəhd et
          console.log("Front camera failed, trying default:", frontCameraError);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              ...videoConstraints,
            },
          });
        }
      }

      if (!mediaStream) {
        throw new Error("Kamera açıla bilmədi.");
      }

      // Stream-i təyin et - video oynatma məntiqini useEffect-ə buraxırıq / Set stream - delegate video playback logic to useEffect
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Camera error:", err);
      setIsLoading(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setError("Kamera icazəsi verilməyib. Zəhmət olmasa brauzer parametrlərindən icazə verin.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setError("Kamera tapılmadı. Zəhmət olmasa kameranın qoşulduğundan əmin olun.");
      } else {
        setError("Kamera açıla bilmədi. Zəhmət olmasa yenidən cəhd edin.");
      }
    }
  };

  // Stop camera stream / Kamera axınını dayandır
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Capture image / Şəkil çək
  const captureImage = async () => {
    try {
      // 1. Video, canvas və stream yoxlaması / Check video, canvas and stream
      if (!videoRef.current || !canvasRef.current || !stream) {
        console.error("Video, canvas və ya stream mövcud deyil");
        setError("Kamera hazır deyil. Zəhmət olmasa gözləyin.");
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      // 2. Canvas context yoxlaması / Check canvas context
      if (!ctx) {
        console.error("Canvas context alına bilmədi");
        setError("Görüntü tutula bilmədi. Zəhmət olmasa yenidən cəhd edin.");
        return;
      }

      // 3. Video-nun oynatıldığını təmin et / Ensure video is playing
      if (video.paused) {
        try {
          await video.play();
        } catch (playError) {
          console.error("Video play error:", playError);
        }
      }

      // 4. Video hazırlıq yoxlaması - HAVE_CURRENT_DATA (2) və ya daha yüksək / Video readiness check - HAVE_CURRENT_DATA (2) or higher
      if (video.readyState < 2) {
        console.error("Video hələ də hazır deyil. ReadyState:", video.readyState);
        setError("Video hələ də hazır deyil. Zəhmət olmasa bir az gözləyin.");
        return;
      }

      // 5. Video ölçüləri yoxlaması / Check video dimensions
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      if (!videoWidth || !videoHeight || videoWidth === 0 || videoHeight === 0) {
        console.error("Video ölçüləri düzgün deyil:", { videoWidth, videoHeight });
        // Bir az gözlə və yenidən yoxla / Wait a bit and check again
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryWidth = video.videoWidth;
        const retryHeight = video.videoHeight;
        if (!retryWidth || !retryHeight || retryWidth === 0 || retryHeight === 0) {
          setError("Video ölçüləri düzgün deyil. Zəhmət olmasa yenidən cəhd edin.");
          return;
        }
      }

      // 6. Canvas ölçülərini video-nun real ölçülərinə təyin et / Set canvas dimensions to video's actual dimensions
      const finalWidth = video.videoWidth || videoWidth;
      const finalHeight = video.videoHeight || videoHeight;
      
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // 7. Video frame-i canvas-a çək / Draw video frame to canvas
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch (drawError) {
        console.error("Canvas-a çəkmə xətası:", drawError);
        setError("Görüntü tutula bilmədi. Zəhmət olmasa yenidən cəhd edin.");
        return;
      }

      // 8. Blob-a çevir / Convert to Blob
      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          stopCamera();
        } else {
          console.error("Blob yaradıla bilmədi");
          setError("Görüntü yaradıla bilmədi. Zəhmət olmasa yenidən cəhd edin.");
        }
      }, "image/jpeg", 0.9);
    } catch (error) {
      console.error("Capture image error:", error);
      setError("Görüntü tutula bilmədi. Zəhmət olmasa yenidən cəhd edin.");
    }
  };

  // Handle search with captured/selected image / Çəkilmiş/seçilmiş şəkil ilə axtarışı idarə et
  const handleSearch = () => {
    if (selectedFile) {
      // Use selected file from gallery / Qalereyadan seçilmiş fayldan istifadə et
      onCapture(selectedFile);
      handleClose();
    } else if (canvasRef.current && capturedImage) {
      // Use captured image from camera / Kameradan çəkilmiş şəkildən istifadə et
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onCapture(file);
          handleClose();
        }
      }, "image/jpeg", 0.9);
    }
  };

  // Handle retake/reselect / Yenidən çək/yenidən seç
  const handleRetake = () => {
    setCapturedImage(null);
    setSelectedFile(null);
    setMode(null);
    stopCamera();
  };

  // Handle close / Bağla
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setSelectedFile(null);
    setMode(null);
    setError(null);
    onClose();
  };

  // Calculate position based on buttonRef - centered below button / buttonRef-ə əsasən pozisiyanı hesabla - düymənin altında mərkəzləşdirilmiş
  useEffect(() => {
    // Only run on client side / Yalnız client tərəfində işlə
    if (typeof window === 'undefined') return;
    
    if (buttonRef?.current && (mode === "camera" || mode === "gallery" || capturedImage || error)) {
      const updatePosition = () => {
        if (buttonRef?.current && typeof window !== 'undefined') {
          const rect = buttonRef.current.getBoundingClientRect();
          // Modal width: 50vw or max 600px
          const modalWidth = Math.min(window.innerWidth * 0.5, 600);
          // Calculate left position: button center minus half modal width
          const buttonCenter = rect.left + (rect.width / 2);
          const leftPosition = buttonCenter - (modalWidth / 2);
          
          // Ensure modal doesn't go off-screen
          const finalLeft = Math.max(8, Math.min(leftPosition, window.innerWidth - modalWidth - 8));
          
          setPosition({
            top: rect.bottom + 28, // 8px gap below button
            left: finalLeft,
          });
        }
      };

      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [buttonRef, mode, capturedImage, error]);

  // Reset state when modal opens/closes / Modal açıldıqda/bağlandıqda state-i sıfırla
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setSelectedFile(null);
      setMode(null);
      setError(null);
    }
  }, [isOpen]);

  // Video stream təyin edildikdən sonra oynatma / Play video after stream is assigned
  useEffect(() => {
    if (videoRef.current && stream && mode === "camera") {
      const video = videoRef.current;
      
      // Video-nun srcObject-ini təyin et (əgər hələ təyin edilməyibsə) / Set video srcObject if not already set
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // Video-nun oynatılmasını təmin et / Ensure video playback
      const playVideo = async () => {
        try {
          // Video hazır olduqda oynat / Play when video is ready
          if (video.readyState >= 2) {
            await video.play();
            setIsLoading(false);
          } else {
            // Video hələ hazır deyil, metadata-nı gözlə / Wait for metadata if video is not ready
            const handleLoadedMetadata = async () => {
              try {
                // Ensure srcObject is set / srcObject-in təyin olunduğundan əmin ol
                if (video.srcObject !== stream) {
                  video.srcObject = stream;
                }
                await video.play();
                setIsLoading(false);
              } catch (err) {
                console.error("Video play error on loadedmetadata:", err);
                setIsLoading(false);
              }
            };
            
            // Əvvəlki event listener-ləri təmizlə / Clear previous event listeners
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
          }
        } catch (err) {
          console.error("Video play error:", err);
          setIsLoading(false);
        }
      };
      
      // Video-nun oynatılmasını təmin et / Ensure video playback
      const handleCanPlay = async () => {
        try {
          if (video.paused) {
            await video.play();
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Video play error on canplay:", err);
        }
      };
      
      // Video-nun oynadığını təmin et / Ensure video is playing
      const handlePlaying = () => {
        setIsLoading(false);
      };
      
      // Video xətası üçün handler / Handler for video errors
      const handleError = (e: Event) => {
        console.error("Video error:", e);
        setError("Video yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin.");
        setIsLoading(false);
      };
      
      // Əvvəlki event listener-ləri təmizlə / Clear previous event listeners
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      
      // Yeni event listener-ləri əlavə et / Add new event listeners
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);
      
      // Video-nu oynat / Play video
      playVideo();
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
      };
    } else if (!stream && mode === "camera") {
      // Stream yoxdursa loading-i dayandır / Stop loading if stream is not available
      setIsLoading(false);
    }
  }, [stream, mode]);

  // Cleanup on unmount / Unmount zamanı təmizlə
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Don't render anything if not open and no active mode / Açıq deyilsə və aktiv rejim yoxdursa heç nə render etmə
  if (!isOpen && mode === null) return null;

  return (
    <>
      {/* Camera Dropdown / Kamera Dropdown - Mode Selection (only when mode is null) */}
      {/* Mobile: Bottom sheet, Desktop: Top-right dropdown / Mobil: Alt pəncərə, Desktop: Yuxarı-sağ dropdown */}
      {isOpen && mode === null && (
        <>
          {/* Mobile Backdrop / Mobil Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-[90] md:hidden"
            onClick={onClose}
          />
          
          {/* Camera Dropdown Container / Kamera Dropdown Konteyneri */}
          {/* Desktop: 600px height, Mobile: Auto height / Desktop: 600px hündürlük, Mobil: Avtomatik hündürlük */}
          {/* Mouse dropdown-dan kənara çıxdıqda dərhal bağlanır / Closes immediately when mouse leaves dropdown */}
          <div
            className="fixed bottom-0 left-0 right-0 md:absolute md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2 bg-white dark:bg-gray-800 border-t md:border border-gray-200 dark:border-gray-700 md:rounded-lg shadow-2xl z-[100] md:z-50 md:min-w-[200px] md:max-w-[600px] md:h-[200px] rounded-t-2xl md:rounded-t-lg opacity-100"
            onMouseEnter={onMouseEnter}
            onMouseLeave={() => {
              // Mouse dropdown-dan kənara çıxdıqda dərhal bağla / Close immediately when mouse leaves dropdown
              // Desktop-da yalnız / Only on desktop (mobil-də backdrop kliklə bağlanır / on mobile closes with backdrop click)
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                handleClose(); // handleClose() onClose() çağırır ki, bu da SearchBar-dakı setIsCameraOpen(false) çağırır
              }
            }}
          >
          <div className="p-4 md:p-4 space-y-3">
            {/* Mobile drag handle / Mobil sürükləmə tutacağı */}
            <div className="md:hidden flex justify-center mb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            {/* Mode Selection Buttons - Alt-alta - Alibaba style mobile */}
            <div className="flex flex-col space-y-4 md:space-y-2">
              <button
                onClick={() => handleModeSelect("camera")}
                className="w-full flex items-center justify-start px-6 py-5 md:px-4 md:py-3 bg-white dark:bg-gray-800 border-2 md:border border-gray-200 dark:border-gray-700 rounded-2xl md:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-all duration-200 group touch-manipulation min-h-[64px] md:min-h-0 shadow-md md:shadow-none"
              >
                <div className="mr-5 md:mr-3 p-4 md:p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl md:rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Camera className="h-7 w-7 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-semibold md:font-medium text-lg md:text-sm">Kamera</span>
              </button>
              <button
                onClick={() => handleModeSelect("gallery")}
                className="w-full flex items-center justify-start px-6 py-5 md:px-4 md:py-3 bg-white dark:bg-gray-800 border-2 md:border border-gray-200 dark:border-gray-700 rounded-2xl md:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-all duration-200 group touch-manipulation min-h-[64px] md:min-h-0 shadow-md md:shadow-none"
              >
                <div className="mr-5 md:mr-3 p-4 md:p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl md:rounded-lg group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                  <ImageIcon className="h-7 w-7 md:h-5 md:w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-gray-900 dark:text-gray-100 font-semibold md:font-medium text-lg md:text-sm">Qalereya</span>
              </button>
            </div>
          </div>
          </div>
        </>
      )}

      {/* Hidden file input / Gizli fayl input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Hidden canvas for capturing images / Görüntü tutmaq üçün gizli canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera/Gallery Modal Views - Full screen on mobile, centered on desktop */}
      {(mode === "camera" || mode === "gallery" || capturedImage || error) && (
        <>
          {/* Backdrop / Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-[90]"
            onClick={handleClose}
          />
          
          {/* Main Camera/Gallery Modal Container / Əsas Kamera/Qalereya Modal Konteyneri
              - Mobile: Full screen (fixed inset-0) / Mobil: Tam ekran
              - Desktop: Positioned below camera button, centered horizontally / Desktop: Kamera düyməsinin altında, üfüqi mərkəzləşdirilmiş
              - Responsive sizing: 50vw width, max 600px, 50vh height, max 600px on desktop / Responsiv ölçü: Desktop-da 50vw en, maks 600px, 50vh hündürlük, maks 600px
              - Dynamic positioning via style prop based on buttonRef / buttonRef-ə əsasən dinamik mövqe
              - Mouse modal-dan kənara çıxdıqda bağlanır (yalnız desktop-da) / Closes when mouse leaves modal (desktop only)
              - Mobil-də backdrop kliklə bağlanır / On mobile closes with backdrop click */}
          <div 
            className="fixed inset-0 md:inset-auto z-[100] w-full md:w-[50vw] md:max-w-[600px] md:h-[150vh] md:max-h-[600px] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col opacity-100 md:rounded-lg"
            style={{
              ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? {
                top: `${position.top}px`,
                left: `${position.left}px`,
              } : {})
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={() => {
              // Mouse modal-dan kənara çıxdıqda bağla / Close when mouse leaves modal
              // Desktop-da yalnız / Only on desktop (mobil-də backdrop kliklə bağlanır / on mobile closes with backdrop click)
              if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                handleClose();
              }
              // SearchBar-dan gələn onMouseLeave-i də çağır / Also call onMouseLeave from SearchBar
              if (onMouseLeave) {
                onMouseLeave();
              }
            }}
          >
          {/* Header / Başlıq - Alibaba style mobile */}
          <div className="flex items-center justify-between p-4 md:p-4 border-b-2 border-gray-200 dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800 md:bg-gradient-to-r md:from-blue-50 md:via-purple-50 md:to-white md:dark:from-gray-800 md:dark:via-gray-800 md:dark:to-gray-900">
            <h2 className="text-xl md:text-lg font-bold md:font-semibold text-gray-900 dark:text-white">
              {t("cameraSearch") || "Şəkil ilə Axtarış"}
            </h2>
            <button
              onClick={handleClose}
              className="p-3 md:p-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-200 touch-manipulation group relative min-w-[48px] min-h-[48px] md:min-w-[40px] md:min-h-[40px] flex items-center justify-center"
              aria-label={tCommon("close")}
            >
              <X className="h-7 w-7 md:h-5 md:w-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          {/* Content / Məzmun - Alibaba style */}
          <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-80px)]">
              {error ? (
                <div className="text-center py-8 md:py-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <X className="h-6 w-6 md:h-8 md:w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm md:text-base text-red-600 dark:text-red-400 mb-4 px-4">{error}</p>
                  <Button onClick={handleClose} variant="outline" className="min-h-[48px] md:min-h-[44px] touch-manipulation">
                    {tCommon("close")}
                  </Button>
                </div>
              ) : capturedImage ? (
            // Preview captured/selected image / Çəkilmiş/seçilmiş şəkilin önizləməsi - Alibaba style mobile
            <div className="space-y-6 md:space-y-6">
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-2xl md:rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl md:shadow-lg">
                <img
                  src={capturedImage}
                  alt="Selected"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3 md:top-2 md:right-2 bg-black/60 md:bg-black/50 backdrop-blur-sm rounded-full p-2 md:p-1.5">
                  <Check className="h-5 w-5 md:h-4 md:w-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-center md:gap-4">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 w-full md:w-auto min-h-[56px] md:min-h-[44px] touch-manipulation border-2 hover:border-gray-400 dark:hover:border-gray-500 text-base md:text-sm font-semibold md:font-medium rounded-xl md:rounded-lg"
                >
                  <RotateCcw className="h-6 w-6 md:h-4 md:w-4" />
                  <span>
                    {mode === "camera" ? "Yenidən Çək" : "Yenidən Seç"}
                  </span>
                </Button>
                <Button
                  onClick={handleSearch}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full md:w-auto min-h-[56px] md:min-h-[44px] touch-manipulation shadow-xl md:shadow-md hover:shadow-2xl md:hover:shadow-lg transition-all duration-200 text-base md:text-sm font-semibold md:font-medium rounded-xl md:rounded-lg"
                >
                  <Check className="h-6 w-6 md:h-4 md:w-4" />
                  <span>Axtar</span>
                </Button>
              </div>
            </div>
          ) : mode === "camera" ? (
            // Camera view / Kamera görünüşü - Full screen on mobile, centered on desktop
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="relative flex-1 bg-gray-900 rounded-xl overflow-hidden shadow-2xl min-h-[60vh] md:min-h-0 h-[60vh] md:h-full">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 md:w-16 md:h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-base md:text-base font-medium">{t("cameraOpening") || "Kamera açılır..."}</p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                    style={{ display: isLoading ? 'none' : 'block' }}
                    onLoadedMetadata={async () => {
                      // Video metadata yükləndikdə / When video metadata is loaded
                      if (videoRef.current && stream) {
                        try {
                          // Video-nun srcObject-ini təyin et (əgər hələ təyin edilməyibsə) / Set video srcObject if not already set
                          if (videoRef.current.srcObject !== stream) {
                            videoRef.current.srcObject = stream;
                          }
                          // Video-nu oynat / Play video
                          await videoRef.current.play();
                          setIsLoading(false);
                        } catch (err) {
                          console.error("Video play error on loadedmetadata prop:", err);
                          setIsLoading(false);
                        }
                      }
                    }}
                    onCanPlay={async () => {
                      // Video oynadıla biləndə / When video can play
                      if (videoRef.current && videoRef.current.paused) {
                        try {
                          await videoRef.current.play();
                          setIsLoading(false);
                        } catch (err) {
                          console.error("Video play error on canplay prop:", err);
                        }
                      }
                    }}
                    onPlaying={() => {
                      // Video oynadıqda loading-i dayandır / Stop loading when video is playing
                      setIsLoading(false);
                    }}
                    onError={(e) => {
                      // Video xətası zamanı / On video error
                      console.error("Video error:", e);
                      setError("Video yüklənə bilmədi. Zəhmət olmasa yenidən cəhd edin.");
                      setIsLoading(false);
                    }}
                  />
                )}
                {/* Camera overlay frame / Kamera overlay çərçivəsi */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full"></div>
                  <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full"></div>
                  <div className="absolute left-4 top-4 bottom-4 w-1 bg-white/20 rounded-full"></div>
                  <div className="absolute right-4 top-4 bottom-4 w-1 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-center pb-6 px-4">
                <Button
                  onClick={captureImage}
                  disabled={isLoading || !stream}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl hover:shadow-2xl touch-manipulation active:scale-90 transform hover:scale-105 transition-all duration-200 border-4 border-white dark:border-gray-700"
                >
                  <Camera className="h-10 w-10 text-white" />
                </Button>
              </div>
            </div>
          ) : null}
          </div>
        </div>
        </>
      )}
    </>
  );
}

