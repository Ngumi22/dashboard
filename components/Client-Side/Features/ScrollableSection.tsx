"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollableSectionProps } from "@/lib/definitions";
import BannerCarousel from "./BannerCarousel";

// Skeleton Loader
const ProductCardSkeleton = () => (
  <div className="relative flex w-[50vw] md:w-[33.33vw] lg:w-[25vw] xl:w-[20vw] flex-col bg-gray-200 animate-pulse rounded-md p-4">
    <div className="w-full aspect-square bg-gray-300 rounded-md"></div>
    <div className="mt-2 h-4 w-3/4 bg-gray-300 rounded"></div>
    <div className="mt-1 h-4 w-1/2 bg-gray-300 rounded"></div>
    <div className="mt-2 flex gap-2">
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
    </div>
  </div>
);

const ScrollableSection: React.FC<ScrollableSectionProps> = ({
  title,
  items,
  className = "",
  itemClassName = "",
  banner,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      const canScroll = scrollWidth > clientWidth;
      setIsScrollable(canScroll);
      setShowLeftArrow(canScroll && scrollLeft > 0);
      setShowRightArrow(canScroll && scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Simulate data fetching
    const timeout = setTimeout(() => {
      if (!items) {
        setError("Failed to load items.");
      }
      setLoading(false);
    }, 1500);

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkScroll);
    };
  }, [items, checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {isScrollable && (
          <div className="flex space-x-2 py-2">
            <button
              onClick={() => scroll("left")}
              className={`p-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-opacity duration-300 ${
                showLeftArrow ? "opacity-100" : "opacity-80 cursor-default"
              }`}
              disabled={!showLeftArrow}
              aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className={`p-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-opacity duration-300 ${
                showRightArrow ? "opacity-100" : "opacity-80 cursor-default"
              }`}
              disabled={!showRightArrow}
              aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="flex">
        <div className="hidden lg:flex">
          {banner && (
            <div className={`flex-shrink-0 ${itemClassName}`}>
              <BannerCarousel {...banner} />
            </div>
          )}
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar space-x-4 flex-grow scroll-smooth snap-x snap-mandatory"
          onScroll={checkScroll}>
          {loading ? (
            // Show Skeletons While Loading
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className={`flex-shrink-0 ${itemClassName} snap-start`}>
                <ProductCardSkeleton />
              </div>
            ))
          ) : error ? (
            // Show Error Message
            <div className="text-red-500 text-lg font-semibold">{error}</div>
          ) : items?.length > 0 ? (
            // Show Items When Data is Available
            items.map((item) => (
              <div
                key={item.id}
                className={`flex-shrink-0 ${itemClassName} snap-start`}>
                {item.content}
              </div>
            ))
          ) : (
            // Show Empty State if No Items
            <div className="text-gray-500 text-lg font-semibold">
              No items available.
              <ProductCardSkeleton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrollableSection;
