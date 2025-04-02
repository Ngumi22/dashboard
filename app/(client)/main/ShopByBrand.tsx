"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProductsGroupedByBrand,
  ProductBrand,
} from "@/lib/actions/Product/fetchProductByBrand";
interface ShopByBrandProps {
  initialData?: ProductBrand[];
}

export default function ShopByBrand({ initialData }: ShopByBrandProps) {
  const {
    data: brands = initialData ?? [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ProductBrand[]>({
    queryKey: ["brandProducts"],
    queryFn: fetchProductsGroupedByBrand,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    initialData,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Initialize active tab
  useEffect(() => {
    if (brands.length > 0 && !activeTab) {
      setActiveTab(brands[0].name);
    }
  }, [brands, activeTab]);

  // Memoized tabs data
  const tabs = useMemo(() => {
    return brands.map(({ name, products }) => ({
      id: name,
      label: name,
      products: [...products] // Create a new array to avoid mutating original
        .sort((a, b) => b.discount - a.discount) // Sort by discount
        .slice(0, 5), // Top 5 products
    }));
  }, [brands]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  // Loading state (only when no initialData)
  if (isLoading && !initialData) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Shop By Brand</h2>
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
      <div className="text-center space-y-2 py-4">
        <p className="text-red-500">
          {error?.message || "Failed to load brands"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!brands.length) {
    return (
      <section>
        <h2 className="text-lg font-semibold">Shop By Brand</h2>
        <p className="text-gray-500">No brands available</p>
      </section>
    );
  }

  return (
    <section>
      <ScrollableTabbedSection
        title="Shop By Brand"
        tabs={tabs}
        activeTab={activeTab ?? tabs[0]?.id}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
