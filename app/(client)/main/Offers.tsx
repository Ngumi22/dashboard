"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { useQuery } from "@tanstack/react-query";
import { fetchAllTopDiscountedProducts } from "@/lib/actions/Product/fetchMostDiscountedProducts";

export default function DiscountedOffers() {
  // Directly use the server action in React Query
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["topDiscountedProducts"],
    queryFn: () => fetchAllTopDiscountedProducts(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Optimized tab initialization
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].name);
    }
  }, [categories, activeTab]);

  // Memoized tabs computation
  const tabs = useMemo(() => {
    return categories.map(({ name, products }) => ({
      id: name,
      label: name,
      products: products
        .slice() // Create a copy before sorting
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 5), // Get top 5 discounted products
    }));
  }, [categories]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Improved loading state with proper skeleton count
  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-4">Discounted Offers</h2>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // Improved error handling
  if (isError) {
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load categories. Please try again later.
      </div>
    );
  }

  return (
    <section>
      {activeTab && (
        <ScrollableTabbedSection
          title="Discounted Offers"
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          ProductCard={ProductCard}
          ProductCardSkeleton={ProductCardSkeleton}
        />
      )}
    </section>
  );
}
