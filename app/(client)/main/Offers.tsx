"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { useQuery } from "@tanstack/react-query";
import {
  DiscountedCategory,
  fetchAllTopDiscountedProducts,
} from "@/lib/actions/Product/fetchMostDiscountedProducts";

interface DiscountedOffersProps {
  initialData?: DiscountedCategory[];
}

export default function DiscountedOffers({
  initialData,
}: DiscountedOffersProps) {
  const {
    data: categories = initialData ?? [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<DiscountedCategory[]>({
    queryKey: ["topDiscountedProducts"],
    queryFn: fetchAllTopDiscountedProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    initialData,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Initialize active tab
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].name);
    }
  }, [categories, activeTab]);

  // Memoized tabs data
  const tabs = useMemo(() => {
    return categories.map(({ name, products }) => ({
      id: name,
      label: name,
      products: [...products] // Create a new array
        .sort((a, b) => b.discount - a.discount) // Sort by discount
        .slice(0, 5), // Top 5 products
    }));
  }, [categories]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Loading state (only when no initialData)
  if (isLoading && !initialData) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Discounted Offers</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }

  // Error handling
  if (isError) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!categories.length) {
    return (
      <section>
        <h2 className="text-lg font-semibold">Discounted Offers</h2>
        <p className="text-gray-500">No discounted products available</p>
      </section>
    );
  }

  return (
    <section>
      <ScrollableTabbedSection
        title="Discounted Offers"
        tabs={tabs}
        activeTab={activeTab ?? tabs[0]?.id}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
