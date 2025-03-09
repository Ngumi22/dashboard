"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface PriceRangeSliderProps {
  minPrice: number; // Minimum price from available filters
  maxPrice: number; // Maximum price from available filters
  currentMin: number | null; // Current minimum price from filters (can be null)
  currentMax: number | null; // Current maximum price from filters (can be null)
  onChange: (min: number, max: number) => void; // Callback when the range changes
}

export function PriceRangeSlider({
  minPrice,
  maxPrice,
  currentMin,
  currentMax,
  onChange,
}: PriceRangeSliderProps) {
  const [minVal, setMinVal] = useState(minPrice); // Default to minPrice from database
  const [maxVal, setMaxVal] = useState(maxPrice); // Default to maxPrice from database

  // Create a debounced version of the onChange callback
  const debouncedOnChange = useRef(
    debounce((min: number, max: number) => {
      onChange(min, max);
    }, 300) // 300ms delay
  ).current;

  // Update the slider values when the currentMin or currentMax props change
  useEffect(() => {
    if (currentMin !== null && currentMax !== null) {
      setMinVal(currentMin);
      setMaxVal(currentMax);
    } else {
      // Reset to full range if no filters are applied
      setMinVal(minPrice);
      setMaxVal(maxPrice);
    }
  }, [currentMin, currentMax, minPrice, maxPrice]);

  // Handle changes to the minimum thumb
  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(event.target.value), maxVal - 1);
    setMinVal(value);
    debouncedOnChange(value, maxVal); // Use the debounced callback
  };

  // Handle changes to the maximum thumb
  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(event.target.value), minVal + 1);
    setMaxVal(value);
    debouncedOnChange(minVal, value); // Use the debounced callback
  };

  // Calculate the position of the thumbs for the slider track
  const minThumbPosition = ((minVal - minPrice) / (maxPrice - minPrice)) * 100;
  const maxThumbPosition = ((maxVal - minPrice) / (maxPrice - minPrice)) * 100;

  return (
    <div className="relative w-full">
      {/* Slider Track */}
      <div className="relative h-1.5 w-full rounded-full bg-gray-200">
        {/* Active Range */}
        <div
          className="absolute h-1.5 rounded-full bg-gray-900"
          style={{
            left: `${minThumbPosition}%`,
            width: `${maxThumbPosition - minThumbPosition}%`,
          }}
        />
      </div>

      {/* Minimum Thumb */}
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={minVal}
        onChange={handleMinChange}
        className="absolute top-0 h-1.5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto"
        style={{ zIndex: minVal > maxPrice - 100 ? 5 : 3 }}
      />

      {/* Maximum Thumb */}
      <input
        type="range"
        min={minPrice}
        max={maxPrice}
        value={maxVal}
        onChange={handleMaxChange}
        className="absolute top-0 h-1.5 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto"
        style={{ zIndex: 4 }}
      />

      {/* Display Min and Max Values */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>${minVal}</span>
        <span>${maxVal}</span>
      </div>
    </div>
  );
}
