"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TabbedScrollableSectionProps } from "@/lib/definitions";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";

const TabbedScrollableSection: React.FC<TabbedScrollableSectionProps> = ({
  categories = [],
  className = "",
  itemClassName = "flex justify-between gap-4 items-center",
  onCategorySelect,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isScrollable, setIsScrollable] = useState(false);

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
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, activeTab]);

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

  const handleTabClick = (index: number, categoryName: string) => {
    setActiveTab(index);
    onCategorySelect(categoryName); // Call the handler with the selected category name
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tabs */}
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
              onClick={() => handleTabClick(index, category.name)}>
              {category.name}
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
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

      {/* Products */}
      <div className="relative">
        <div className="flex">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide space-x-4 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={checkScroll}>
            {/* Prevents errors by ensuring `categories[activeTab]` exists */}
            {categories[activeTab]?.products?.length > 0 ? (
              categories[activeTab].products.map((product) => (
                <div
                  key={product.id}
                  className={`flex justify-between items-center gap-4 w-full my-4 ${itemClassName} snap-start`}>
                  <ProductCard {...product} id={product.id} />
                </div>
              ))
            ) : (
              // Show skeleton loaders when no products are available
              <div className="flex gap-4 my-4">
                {[...Array(4)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbedScrollableSection;
