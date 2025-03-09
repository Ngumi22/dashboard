"use client";

import type React from "react";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TabsContainerProps {
  heading?: string;
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  className?: string;
}

export function TabbedContainer({
  heading,
  tabs,
  className,
}: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const [visibleTabs, setVisibleTabs] = useState<typeof tabs>([tabs[0]]);
  const [overflowTabs, setOverflowTabs] = useState<typeof tabs>([]);
  const [showLeftContentScroll, setShowLeftContentScroll] = useState(false);
  const [showRightContentScroll, setShowRightContentScroll] = useState(false);

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollButtonsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const isCalculatingRef = useRef(false);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced calculation function
  const debouncedCalculateVisibleTabs = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      calculateVisibleTabs();
    }, 150); // Debounce for 150ms
  }, []);

  // Calculate which tabs are visible and which should go to dropdown
  const calculateVisibleTabs = () => {
    // Prevent recursive calculations
    if (isCalculatingRef.current) return;
    isCalculatingRef.current = true;

    if (!tabsContainerRef.current) {
      isCalculatingRef.current = false;
      return;
    }

    const containerWidth = tabsContainerRef.current.clientWidth;
    // Space needed for scroll buttons
    const scrollButtonsWidth = scrollButtonsRef.current?.offsetWidth || 80;
    // Fixed space for dropdown button
    const dropdownButtonWidth = 48;
    // Reserve space for these elements plus some padding
    const reservedSpace = scrollButtonsWidth + 16;
    const availableWidth = containerWidth - reservedSpace;

    // Create a copy of tabs for manipulation
    const allTabs = [...tabs];
    // Always keep the first tab visible (Featured Products)
    const firstTab = allTabs.shift();

    if (!firstTab) {
      isCalculatingRef.current = false;
      return; // Safety check
    }

    const visible = [firstTab];
    const overflow: typeof tabs = [];

    // First, calculate width of the first tab (which always remains visible)
    const firstTabElement = tabRefs.current.get(firstTab.id);
    let usedWidth = firstTabElement?.offsetWidth || 0;

    // Always reserve space for the dropdown button to prevent layout shifts
    const availableForTabs = availableWidth - dropdownButtonWidth;

    // Calculate how many additional tabs can fit
    for (const tab of allTabs) {
      const tabElement = tabRefs.current.get(tab.id);
      const tabWidth = tabElement?.offsetWidth || 0;

      if (usedWidth + tabWidth <= availableForTabs) {
        visible.push(tab);
        usedWidth += tabWidth + 8; // 8px for gap
      } else {
        overflow.push(tab);
      }
    }

    // Only update state if there's an actual change to prevent unnecessary renders
    const visibleIdsString = visible.map((t) => t.id).join(",");
    const currentVisibleIdsString = visibleTabs.map((t) => t.id).join(",");

    if (visibleIdsString !== currentVisibleIdsString) {
      setVisibleTabs(visible);
      setOverflowTabs(overflow);
    }

    isCalculatingRef.current = false;
  };

  const checkContentScrollButtons = useCallback(() => {
    if (contentRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = contentRef.current;
      setShowLeftContentScroll(scrollLeft > 0);
      setShowRightContentScroll(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
    }
  }, []);

  // Initial calculation and resize handler
  useEffect(() => {
    // Add a slight delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      calculateVisibleTabs();
      checkContentScrollButtons();
    }, 200);

    const handleResize = () => {
      debouncedCalculateVisibleTabs();
      checkContentScrollButtons();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timer);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [checkContentScrollButtons, debouncedCalculateVisibleTabs]);

  // Update calculations when tab refs change
  useEffect(() => {
    if (tabRefs.current.size === tabs.length) {
      // Only calculate if we have all tab refs
      const timer = setTimeout(() => {
        calculateVisibleTabs();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [tabRefs.current.size, tabs.length]);

  // Check content scroll when active tab changes
  useEffect(() => {
    checkContentScrollButtons();
  }, [activeTab, checkContentScrollButtons]);

  const scrollContent = (direction: "left" | "right") => {
    if (contentRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === "left"
          ? contentRef.current.scrollLeft - scrollAmount
          : contentRef.current.scrollLeft + scrollAmount;

      contentRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      // Update scroll buttons after scrolling
      setTimeout(checkContentScrollButtons, 300);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    // Reset content scroll position when changing tabs
    if (contentRef.current) {
      contentRef.current.scrollLeft = 0;
      checkContentScrollButtons();
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn("w-full space-y-4", className)}>
      {heading && <h2 className="text-2xl font-bold">{heading}</h2>}

      <div className="flex items-center h-10" ref={tabsContainerRef}>
        {/* Tabs + Dropdown Container */}
        <div className="flex-1 flex items-center overflow-hidden">
          {/* Always visible tabs */}
          <div className="flex gap-2 overflow-x-hidden transition-all duration-200 ease-in-out">
            {visibleTabs.map((tab) => (
              <Button
                key={tab.id}
                ref={(el) => {
                  if (el) tabRefs.current.set(tab.id, el);
                }}
                variant={activeTab === tab.id ? "default" : "outline"}
                className={cn(
                  "whitespace-nowrap transition-all min-w-[80px]",
                  activeTab === tab.id ? "font-medium" : "text-muted-foreground"
                )}
                onClick={() => handleTabClick(tab.id)}>
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Dropdown for overflow tabs - always reserve space for it */}
          <div
            className={cn(
              "ml-2 transition-opacity duration-200",
              overflowTabs.length === 0
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  ref={dropdownRef}
                  className="w-10 h-10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {overflowTabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={cn(
                      "cursor-pointer",
                      activeTab === tab.id && "bg-muted font-medium"
                    )}>
                    {tab.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content scroll buttons */}
        <div className="flex items-center gap-1 ml-2" ref={scrollButtonsRef}>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "flex-shrink-0 transition-opacity duration-200",
              !showLeftContentScroll && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => scrollContent("left")}
            disabled={!showLeftContentScroll}
            aria-label="Scroll content left">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "flex-shrink-0 transition-opacity duration-200",
              !showRightContentScroll && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => scrollContent("right")}
            disabled={!showRightContentScroll}
            aria-label="Scroll content right">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab content with horizontal scroll */}
      <div
        ref={contentRef}
        className="overflow-x-auto rounded-lg border p-4"
        onScroll={checkContentScrollButtons}>
        <div className="min-w-max">{activeTabContent}</div>
      </div>
    </div>
  );
}
