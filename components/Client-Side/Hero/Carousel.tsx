"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import CarouselSlide from "./Carousel-Slide";
import { useCarouselsQuery } from "@/lib/actions/Hooks/useCarousel";

export default function Carousel() {
  const { data, isLoading } = useCarouselsQuery();
  const carousels = data || []; // Fallback to empty array if no data

  const [activeIndex, setActiveIndex] = useState(carousels.length);
  const [isAnimating, setIsAnimating] = useState(false); // Track animation state
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Extend carousels for smooth infinite scrolling
  const extendedProducts = useMemo(
    () => [...carousels, ...carousels, ...carousels],
    [carousels]
  );

  // Initialize activeIndex when carousels are loaded
  useEffect(() => {
    if (carousels.length > 0) {
      setActiveIndex(carousels.length); // Start in the middle of the extended array
    }
  }, [carousels]);

  // Handle slide change (next or previous)
  const handleSlideChange = useCallback(
    (direction: "next" | "prev") => {
      if (isAnimating) return; // Prevent multiple clicks during animation
      setIsAnimating(true);

      setActiveIndex((prev) => {
        let newIndex = direction === "next" ? prev + 1 : prev - 1;

        // Handle infinite scroll reset
        if (newIndex >= carousels.length * 2) {
          newIndex = carousels.length;
        } else if (newIndex < carousels.length) {
          newIndex = carousels.length * 2 - 1;
        }

        return newIndex;
      });
    },
    [carousels.length, isAnimating]
  );

  // Handle next slide
  const nextSlide = useCallback(() => {
    handleSlideChange("next");
  }, [handleSlideChange]);

  // Handle previous slide
  const prevSlide = useCallback(() => {
    handleSlideChange("prev");
  }, [handleSlideChange]);

  // Handle transition end to re-enable transitions and stop animation
  const handleTransitionEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Handle auto-play
  useEffect(() => {
    if (carousels.length > 0) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [nextSlide, carousels.length]);

  // Pause auto-play on hover
  const pauseAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  // Resume auto-play on hover out
  const resumeAutoPlay = useCallback(() => {
    if (!autoPlayRef.current && carousels.length > 0) {
      autoPlayRef.current = setInterval(nextSlide, 5000);
    }
  }, [nextSlide, carousels.length]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="relative w-full h-52 md:h-96 overflow-hidden"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}>
      <div
        ref={carouselRef}
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
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
              setIsAnimating(true); // Trigger animation
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
