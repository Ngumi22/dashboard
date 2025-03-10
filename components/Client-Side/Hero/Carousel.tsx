"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import CarouselSlide from "./Carousel-Slide";
import { useCarouselsQuery } from "@/lib/actions/Hooks/useCarousel";
import { useDebounce } from "@/lib/hooks/use-debounce";
// If you want to use debounce (optional), you can import it from lodash
// import debounce from "lodash/debounce";

export default function Carousel() {
  // The hook will instantly return prefetched data (if available)
  const { data, isLoading } = useCarouselsQuery();
  const carousels = data || [];

  // Manage active index state and animation flag
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Extend the carousel list to allow infinite scrolling
  const extendedProducts = useMemo(
    () => [...carousels, ...carousels, ...carousels],
    [carousels]
  );

  // Set activeIndex once carousels are loaded and activeIndex is still 0
  useEffect(() => {
    if (carousels.length > 0 && activeIndex === 0) {
      setActiveIndex(carousels.length);
    }
  }, [carousels, activeIndex]);

  // Handle slide changes (next/prev) with boundary logic
  const handleSlideChange = useCallback(
    (direction: "next" | "prev") => {
      if (isAnimating) return;
      setIsAnimating(true);

      setActiveIndex((prev) => {
        const maxIndex = carousels.length * 2;
        const minIndex = carousels.length;
        let newIndex = direction === "next" ? prev + 1 : prev - 1;

        if (newIndex >= maxIndex) return minIndex;
        if (newIndex < minIndex) return maxIndex - 1;
        return newIndex;
      });
    },
    [carousels.length, isAnimating]
  );

  // (Optional) Debounced version to prevent rapid clicks (uncomment if needed)
  // const debouncedSlideChange = useCallback(
  //   useDebounce(
  //     (direction: "next" | "prev") => handleSlideChange(direction),
  //     300
  //   ),
  //   [handleSlideChange]
  // );

  const nextSlide = useCallback(() => {
    handleSlideChange("next");
    // If using debounce: debouncedSlideChange("next");
  }, [handleSlideChange]);

  const prevSlide = useCallback(() => {
    handleSlideChange("prev");
    // If using debounce: debouncedSlideChange("prev");
  }, [handleSlideChange]);

  const handleTransitionEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Auto play logic: Only set interval if data is available and not already set
  useEffect(() => {
    if (!carousels.length) return;

    if (!autoPlayRef.current) {
      autoPlayRef.current = setInterval(nextSlide, 7000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [carousels.length, nextSlide]);

  const pauseAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (!autoPlayRef.current && carousels.length > 0) {
      autoPlayRef.current = setInterval(nextSlide, 7000);
    }
  }, [nextSlide, carousels.length]);

  // Touch and mouse events for swipe support
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  // Helper to determine swipe end action
  const handleSwipeEnd = (deltaX: number) => {
    if (Math.abs(deltaX) > 50) {
      deltaX < 0 ? nextSlide() : prevSlide();
    }
  };

  const handleTouchEnd = () => {
    handleSwipeEnd(touchEndX.current - touchStartX.current);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    touchStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.clientX;
  };

  const handleMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleSwipeEnd(touchEndX.current - touchStartX.current);
  };

  // Conditional rendering for better UX: Show placeholder if loading or no data
  if (isLoading || !carousels.length) {
    return (
      <div className="relative w-full h-52 md:h-96 overflow-hidden bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <div
      className="relative w-full h-52 md:h-96 overflow-hidden"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}>
      <div
        ref={carouselRef}
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        onTransitionEnd={handleTransitionEnd}>
        {extendedProducts.map((carousel, index) => (
          <div
            key={`${carousel.carousel_id}-${index}`}
            className="flex-shrink-0 w-full h-full">
            <CarouselSlide
              carousel={carousel}
              isActive={index === activeIndex}
              isAnimating={isAnimating}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
        <button
          onClick={prevSlide}
          className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
          aria-label="Previous slide">
          <ChevronUp className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
          aria-label="Next slide">
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* Dots Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {carousels.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index + carousels.length);
              setIsAnimating(true);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              (activeIndex - carousels.length) % carousels.length === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
