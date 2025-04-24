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

  const activeTabData = useMemo(() => {
    return (
      tabs.find((tab) => tab.id === activeTab) || tabs[0] || { products: [] }
    );
  }, [tabs, activeTab]);

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
    const container = productsRef.current;
    if (!container) return;

    const card = container.querySelector("div.snap-start") as HTMLElement;
    if (!card) return;

    const cardWidth = card.offsetWidth;
    const gap = 16;
    const scrollAmount = cardWidth + gap;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (direction === "right") {
      const newScrollLeft = container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: newScrollLeft >= maxScrollLeft ? 0 : newScrollLeft,
        behavior: "smooth",
      });
    } else {
      const newScrollLeft = container.scrollLeft - scrollAmount;
      container.scrollTo({
        left: newScrollLeft <= 0 ? maxScrollLeft : newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={`mx-auto ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <Link href={`/products`}>
          <Button className="rounded-none text-sm md:text-md flex gap-1 p-2 items-center">
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
                className={`md:px-4 p-2 whitespace-nowrap transition-colors text-[0.8rem] lg:text-sm font-medium rounded-none ${
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
                    className="p-2 rounded-none border-none">
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
        {/* Scrollable container */}
        <div
          ref={productsRef}
          className="
      flex
      overflow-x-auto
      scroll-smooth
      snap-x snap-mandatory
      gap-4
      px-4
      [scroll-padding-left:1rem] [scroll-padding-right:1rem]
      scrollbar
    ">
          {(activeTabData?.products ?? []).length > 0
            ? activeTabData.products.map((product) => (
                <div
                  key={product.id}
                  className="
              flex-shrink-0
              w-64
              snap-start
            ">
                  <ProductCard {...product} />
                </div>
              ))
            : Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="
              flex-shrink-0
              w-64
              snap-start
            ">
                  <ProductCardSkeleton />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollableTabbedSection;
