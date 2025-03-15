"use client";

import type React from "react";
import { useRef, useEffect, useCallback, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { MinimalProduct } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

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
  const [showProductLeftArrow, setShowProductLeftArrow] = useState(false);
  const [showProductRightArrow, setShowProductRightArrow] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>(tabs);
  const [hiddenTabs, setHiddenTabs] = useState<Tab[]>([]);

  const activeTabData = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) || tabs[0],
    [tabs, activeTab]
  );

  const updateTabsVisibility = useCallback(() => {
    if (!tabsRef.current) return;
    const containerWidth = tabsRef.current.clientWidth;
    let totalWidth = 0;
    let visible: Tab[] = [];
    let hidden: Tab[] = [];

    tabs.forEach((tab) => {
      const tabWidth = 100; // Estimated width per tab
      if (totalWidth + tabWidth > containerWidth - 120) {
        hidden.push(tab);
      } else {
        visible.push(tab);
        totalWidth += tabWidth;
      }
    });

    setVisibleTabs(visible);
    setHiddenTabs(hidden);
  }, [tabs]);

  const updateArrowsVisibility = useCallback(() => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  const updateProductArrowsVisibility = useCallback(() => {
    if (productsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = productsRef.current;
      setShowProductLeftArrow(scrollLeft > 0);
      setShowProductRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  }, []);

  useEffect(() => {
    updateTabsVisibility();
    updateArrowsVisibility();
    updateProductArrowsVisibility();
    window.addEventListener("resize", updateTabsVisibility);
    return () => window.removeEventListener("resize", updateTabsVisibility);
  }, [
    updateTabsVisibility,
    updateArrowsVisibility,
    updateProductArrowsVisibility,
  ]);

  useEffect(() => {
    const tabsContainer = tabsRef.current;
    if (tabsContainer) {
      tabsContainer.addEventListener("scroll", updateArrowsVisibility);
      return () =>
        tabsContainer.removeEventListener("scroll", updateArrowsVisibility);
    }
  }, [updateArrowsVisibility]);

  useEffect(() => {
    const productsContainer = productsRef.current;
    if (productsContainer) {
      productsContainer.addEventListener(
        "scroll",
        updateProductArrowsVisibility
      );
      return () =>
        productsContainer.removeEventListener(
          "scroll",
          updateProductArrowsVisibility
        );
    }
  }, [updateProductArrowsVisibility]);

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = tabsRef.current.clientWidth / 2;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollProducts = (direction: "left" | "right") => {
    if (productsRef.current) {
      const scrollAmount = productsRef.current.clientWidth / 2;
      productsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`mx-auto py-8 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <Link
          href={"/products"}
          prefetch={true}
          className="text-md flex gap-2 items-center text-sm">
          <Button>
            Shop All <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
      <div className="relative mb-4">
        <div className="flex justify-between items-center">
          <div
            ref={tabsRef}
            className="flex space-x-1 overflow-x-auto flex-grow scrollbar-hide">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`md:px-4 px-2 py-2 whitespace-nowrap transition-colors text-[0.8rem] lg:text-sm font-medium rounded-none ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-foreground hover:bg-muted"
                }`}>
                {tab.label}
              </Button>
            ))}
            {hiddenTabs.length > 0 && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-2 py-2 rounded-none border-none">
                    More <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="rounded-none scrollbar">
                  {hiddenTabs.map((tab) => (
                    <DropdownMenuItem key={tab.id} className="rounded-none">
                      <Button
                        onClick={() => onTabChange(tab.id)}
                        className={`md:px-4 p-1 whitespace-nowrap transition-colors text-[0.8rem] lg:text-sm font-medium rounded-none ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-foreground hover:bg-muted"
                        }`}>
                        {tab.label}
                      </Button>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="flex space-x-2 mt-2 justify-end">
            <button
              onClick={() => scrollProducts("left")}
              className={`p-1 rounded-full bg-primary text-white ${
                showProductLeftArrow
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-label="Scroll products left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scrollProducts("right")}
              className={`p-1 rounded-full bg-primary text-white ${
                showProductRightArrow
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
              aria-label="Scroll products right">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div ref={productsRef} className="flex overflow-x-auto scrollbar gap-2">
          {activeTabData.products.length > 0
            ? activeTabData.products.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[200px] sm:w-[250px] md:w-[300px] lg:w-[350px]">
                  <ProductCard {...product} />
                </div>
              ))
            : Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[200px] sm:w-[250px] md:w-[300px] lg:w-[350px]">
                  <ProductCardSkeleton />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableTabbedSection;
