/**
 * Slider Component / Slider Komponenti
 * Range slider for price filtering
 * Qiymət filtrləməsi üçün range slider
 */

"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: [number, number];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  ...props
}: SliderProps) {
  const [minValue, maxValue] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxValue - step);
    onValueChange([newMin, maxValue]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minValue + step);
    onValueChange([minValue, newMax]);
  };

  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-2 bg-blue-600 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minValue}
        onChange={handleMinChange}
        className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
        {...props}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxValue}
        onChange={handleMaxChange}
        className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
        {...props}
      />
      <div className="flex justify-between mt-2">
        <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md" />
        <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md" />
      </div>
    </div>
  );
}

