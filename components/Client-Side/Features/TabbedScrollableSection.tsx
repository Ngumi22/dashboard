"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCards from "./ProductCard";
import { TabbedScrollableSectionProps } from "@/lib/definitions";

const TabbedScrollableSection: React.FC<TabbedScrollableSectionProps> = ({
  categories,
  className = "",
  itemClassName = "",
}) => {
  const [activeTab, setActiveTab] = useState(0);
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
  }, [checkScroll, activeTab]); // Re-check when active tab changes or on resize

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      const newScrollPosition =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex space-x-1 overflow-x-auto">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className={`p-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-white text-secondary-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setActiveTab(index)}>
              {category.name}
            </button>
          ))}
        </div>
        {/* Conditionally render arrows only if the content is scrollable */}
        {isScrollable && (
          <div className="flex space-x-2 ml-2">
            <button
              onClick={() => scroll("left")}
              className={`p-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-opacity duration-300 ${
                showLeftArrow ? "opacity-100" : "opacity-80 pointer-events-none"
              }`}
              disabled={!showLeftArrow}
              aria-label="Scroll left">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className={`p-1 rounded-full bg-primary text-white hover:bg-primary/90 transition-opacity duration-300 ${
                showRightArrow
                  ? "opacity-100"
                  : "opacity-80 pointer-events-none"
              }`}
              disabled={!showRightArrow}
              aria-label="Scroll right">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="flex gap-x-4">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide space-x-4 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={checkScroll}>
            {categories[activeTab].products.map((product) => (
              <div
                key={product.id}
                className={`flex-shrink-0 ${itemClassName} snap-start`}>
                <ProductCards {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbedScrollableSection;
