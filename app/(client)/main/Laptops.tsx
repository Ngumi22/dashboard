"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import {
  CategoryWithProducts,
  fetchCategoryWithProducts,
} from "@/lib/actions/Product/fetchSub";

type SubCategoryProductsProps = {
  categoryName: string;
  initialData?: CategoryWithProducts;
};

export default function SubCategoryProducts({
  categoryName,
  initialData, // Passed from server
}: SubCategoryProductsProps) {
  const {
    data: categoryData = initialData,
    isLoading,
    isError,
    error,
    refetch, // Allows retrying manually
  } = useQuery({
    queryKey: [`category-products:${categoryName}`, categoryName],
    queryFn: () => fetchCategoryWithProducts(categoryName),
    initialData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false, // Prevent refetching when switching tabs
  });

  // Memoize tabs to prevent unnecessary recalculations
  const tabs = useMemo(() => {
    return (
      categoryData?.subCategories?.map((subCategory) => ({
        id: subCategory.name,
        label: subCategory.name,
        products: subCategory.products,
      })) || []
    );
  }, [categoryData]);

  // Manage active tab efficiently
  const [activeTab, setActiveTab] = useState<string>(() =>
    tabs.length > 0 ? tabs[0].id : ""
  );

  useEffect(() => {
    if (tabs.length > 0 && !tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(tabs[0].id);
    }
  }, [tabs, activeTab]);

  // Memoized handler to avoid unnecessary re-renders
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Error Handling with Retry
  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>
          {error instanceof Error ? error.message : "Failed to load products"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  // Show Skeleton Loader while loading
  if (isLoading) {
    return (
      <div className="grid grid-flow-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // If no data, return null
  if (!categoryData || tabs.length === 0) {
    return null;
  }

  return (
    <section>
      <ScrollableTabbedSection
        title={`Shop ${categoryName}`}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
