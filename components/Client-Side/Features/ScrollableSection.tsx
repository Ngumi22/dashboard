"use client";

import type React from "react";
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollableSectionProps } from "@/lib/definitions";
import BannerCarousel from "./BannerCarousel";

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
  const [isScrollable, setIsScrollable] = useState(false); // New state to track if scrolling is possible

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // Check if the content is scrollable
      const canScroll = scrollWidth > clientWidth;
      setIsScrollable(canScroll);

      // Show/hide arrows based on scroll position
      setShowLeftArrow(canScroll && scrollLeft > 0);
      setShowRightArrow(canScroll && scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [items, checkScroll]); // Re-check when items change or on resize

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
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        {/* Conditionally render arrows only if the content is scrollable */}
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
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex-shrink-0 ${itemClassName} snap-start`}>
              {item.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableSection;
