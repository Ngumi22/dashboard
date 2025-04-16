"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

import dynamic from "next/dynamic";

// Lazy load icons and skeleton
const ArrowUp = dynamic(
  () => import("lucide-react").then((mod) => mod.ArrowUp),
  { ssr: false }
);
const ArrowDown = dynamic(
  () => import("lucide-react").then((mod) => mod.ArrowDown),
  { ssr: false }
);
const CarouselSlide = dynamic(() => import("./Carousel-Slide"), { ssr: false });

import { useQuery } from "@tanstack/react-query";
import { fetchCarousels } from "@/lib/actions/Carousel/fetch";
import { Skeleton } from "@/components/ui/skeleton";
import { MiniCarousel } from "@/lib/actions/Carousel/carouselTypes";

const MINUTE = 1000 * 60;

interface CarouselProps {
  initialData?: MiniCarousel[];
  isAdmin: boolean;
}

export default function Carousel({
  initialData,
  isAdmin = false,
}: CarouselProps) {
  const {
    data: carouselData = initialData, // Fallback to server data
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["carouselsData"],
    queryFn: () => fetchCarousels(),
    initialData,
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });

  // Wrap the initialization of 'carousels' in useMemo
  const carousels = useMemo(() => carouselData || [], [carouselData]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const extendedProducts = useMemo(
    () => [...carousels, ...carousels, ...carousels],
    [carousels]
  );

  useEffect(() => {
    if (carousels.length > 0 && activeIndex === 0) {
      setActiveIndex(carousels.length);
    }
  }, [carousels, activeIndex]);

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

  const nextSlide = useCallback(() => {
    handleSlideChange("next");
  }, [handleSlideChange]);

  const prevSlide = useCallback(() => {
    handleSlideChange("prev");
  }, [handleSlideChange]);

  const handleTransitionEnd = useCallback(() => {
    setIsAnimating(false);
  }, []);

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

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

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

  // Loading state (only shows if no initialData)
  if ((isLoading && !initialData) || !carouselData) {
    return (
      <Skeleton className="h-52 md:h-96 overflow-hidden bg-gray-200 animate-pulse w-full rounded-lg" />
    );
  }
  if (isError || !carouselData) return <div>Error fetching categories</div>;

  return (
    <div
      className="md:max-w-3xl w-full relative h-52 md:h-96 overflow-hidden"
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

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
        <ArrowUp
          className="cursor-pointer h-6 w-6 md:h-8 md:w-8 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
          onClick={prevSlide}
          aria-label="Previous slide"
        />
        <ArrowDown
          className="cursor-pointer h-6 w-6 md:h-8 md:w-8 bg-black/30 hover:bg-black/50 text-white rounded-full p-1 transition-colors"
          onClick={nextSlide}
          aria-label="Next slide"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {carousels.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveIndex(index + carousels.length);
              setIsAnimating(true);
            }}
            className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 ${
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
