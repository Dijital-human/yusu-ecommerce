/**
 * Flash Sale Countdown Component / Flash Sale Geri Sayım Komponenti
 * Displays a countdown timer for flash sales
 * Flash sale-lər üçün geri sayım timer-i göstərir
 */

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";

interface FlashSaleCountdownProps {
  endDate: Date | string; // End date for the flash sale / Flash sale-in bitmə tarixi
  onEnd?: () => void; // Callback when countdown ends / Geri sayım bitdikdə callback
  className?: string; // Additional CSS classes / Əlavə CSS sinifləri
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function FlashSaleCountdown({ 
  endDate, 
  onEnd,
  className = "" 
}: FlashSaleCountdownProps) {
  const t = useTranslations('deals');
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const endTime = end.getTime();
      const difference = endTime - now;

      if (difference <= 0) {
        setIsEnded(true);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        if (onEnd) {
          onEnd();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    // Update immediately / Dərhal yenilə
    updateCountdown();

    // Update every second / Hər saniyə yenilə
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [endDate, onEnd]);

  if (isEnded) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <Clock className="h-5 w-5" />
        <span className="font-semibold">{t('ended')}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="h-5 w-5 text-primary-600" />
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">{t('endsIn')}:</span>
        <div className="flex items-center gap-1">
          {timeRemaining.days > 0 && (
            <div className="flex flex-col items-center bg-primary-100 dark:bg-primary-900 rounded-lg px-2 py-1 min-w-[50px]">
              <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                {String(timeRemaining.days).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{t('days')}</span>
            </div>
          )}
          <div className="flex flex-col items-center bg-primary-100 dark:bg-primary-900 rounded-lg px-2 py-1 min-w-[50px]">
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {String(timeRemaining.hours).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{t('hours')}</span>
          </div>
          <div className="flex flex-col items-center bg-primary-100 dark:bg-primary-900 rounded-lg px-2 py-1 min-w-[50px]">
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {String(timeRemaining.minutes).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{t('minutes')}</span>
          </div>
          <div className="flex flex-col items-center bg-primary-100 dark:bg-primary-900 rounded-lg px-2 py-1 min-w-[50px]">
            <span className="text-2xl font-bold text-primary-700 dark:text-primary-300">
              {String(timeRemaining.seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{t('seconds')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

