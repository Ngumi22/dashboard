"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCards from "./ProductCard";
import { TabbedScrollableSectionProps } from "@/lib/definitions";
import BannerCarousel from "./BannerCarousel";

const TabbedScrollableSection: React.FC<TabbedScrollableSectionProps> = ({
  categories,
  className = "",
  itemClassName = "",
  banner,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

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
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4 overflow-x-auto">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                activeTab === index
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              onClick={() => setActiveTab(index)}>
              {category.name}
            </button>
          ))}
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => scroll("left")}
            className={`p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-opacity duration-300 ${
              showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            disabled={!showLeftArrow}
            aria-label="Scroll left">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className={`p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-opacity duration-300 ${
              showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            disabled={!showRightArrow}
            aria-label="Scroll right">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="relative">
        <h2 className="text-2xl font-bold mb-4">
          {categories[activeTab].name}
        </h2>

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
          <div>
            {banner && (
              <div className={`flex-shrink-0 ${itemClassName}`}>
                <BannerCarousel {...banner} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbedScrollableSection;
