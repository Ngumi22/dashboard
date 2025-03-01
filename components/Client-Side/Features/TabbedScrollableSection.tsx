"use client";

import type React from "react";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MinimalProduct } from "@/lib/definitions";

interface Tab {
  id: string;
  label: string;
  products: MinimalProduct[];
}

interface ScrollableTabbedSectionProps {
  title: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  ProductCard: React.ComponentType<MinimalProduct>;
  ProductCardSkeleton: React.ComponentType;
}

const ScrollableTabbedSection: React.FC<ScrollableTabbedSectionProps> = ({
  title,
  tabs,
  activeTab,
  onTabChange,
  className = "",
  ProductCard,
  ProductCardSkeleton,
}) => {
  const tabsRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const activeTabData = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) || tabs[0],
    [tabs, activeTab]
  );

  const checkTabsOverflow = useCallback(() => {
    if (tabsRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    checkTabsOverflow();
    window.addEventListener("resize", checkTabsOverflow);
    return () => window.removeEventListener("resize", checkTabsOverflow);
  }, [checkTabsOverflow]);

  const scrollTabs = useCallback((direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = tabsRef.current.clientWidth / 2;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className={`mx-auto py-8 max-w-9xl ${className}`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative mb-4">
        <div className="flex items-center justify-between">
          <div
            ref={tabsRef}
            className="flex space-x-2 overflow-x-auto scrollbar-hide flex-grow"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={checkTabsOverflow}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button" // Prevent form submission
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 whitespace-nowrap transition-colors text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex space-x-2 ml-2">
            <button
              onClick={() => scrollTabs("left")}
              className={`p-1 rounded-full bg-primary text-primary-foreground ${
                showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Scroll tabs left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollTabs("right")}
              className={`p-1 rounded-full bg-primary text-primary-foreground ${
                showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Scroll tabs right">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={productsRef}
        className="grid grid-flow-col overflow-hidden scrollbar md:grid-cols-2 lg:grid-cols-4 gap-2">
        {activeTabData.products.length > 0
          ? activeTabData.products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))
          : Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
      </div>
    </div>
  );
};

export default ScrollableTabbedSection;
