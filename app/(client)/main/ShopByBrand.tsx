"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { useQuery } from "@tanstack/react-query";
import { fetchProductsGroupedByBrand } from "@/lib/actions/Product/fetchProductByBrand";

export default function ShopByBrand() {
  // Directly use the server action in React Query
  const {
    data: brands = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["brandProducts"],
    queryFn: () => fetchProductsGroupedByBrand(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Optimized tab initialization
  useEffect(() => {
    if (brands.length > 0 && !activeTab) {
      setActiveTab(brands[0].name);
    }
  }, [brands, activeTab]);

  // Memoized tabs computation
  const tabs = useMemo(() => {
    return brands.map(({ name, products }) => ({
      id: name,
      label: name,
      products: products
        .slice() // Create a copy before sorting
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 5), // Get top 5 discounted products
    }));
  }, [brands]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Improved loading state with proper skeleton count
  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-4">Shop By Brand</h2>
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
        Failed to load brands. Please try again later.
      </div>
    );
  }

  return (
    <section>
      {activeTab && (
        <ScrollableTabbedSection
          title="Shop By Brand"
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
