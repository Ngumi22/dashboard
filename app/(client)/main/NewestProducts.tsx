"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import type { Product } from "@/lib/actions/Product/actions/search-params";

type NewArrivalsCategory = {
  id: string | number;
  name: string;
  products: Product[];
};

type NewArrivalsProps = {
  initialData?: NewArrivalsCategory[];
  daysThreshold?: number; // Products added in last X days
  maxProductsPerCategory?: number;
};

export default function NewArrivals({
  daysThreshold = 30,
  maxProductsPerCategory = 6,
}: NewArrivalsProps) {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<NewArrivalsCategory[]>({
    queryKey: ["new-arrivals", daysThreshold],
    queryFn: async () => {
      try {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
        const result = await fetchProducts({
          sort: "newest",
          perPage: 100,
          createdAfter: thresholdDate.toISOString(),
        });

        if (!result) {
          throw new Error("No response from API");
        }

        const categoryMap = new Map<string | number, NewArrivalsCategory>();

        result.products.forEach((product) => {
          if (!product.category_name) return;

          const categoryId = product.category_id || product.category_name;
          const categoryName = product.category_name;

          if (!categoryMap.has(categoryId)) {
            categoryMap.set(categoryId, {
              id: categoryId,
              name: categoryName,
              products: [],
            });
          }

          categoryMap.get(categoryId)?.products.push(product);
        });

        const categoriesArray = Array.from(categoryMap.values());

        categoriesArray.sort((a, b) => {
          const newestA = Math.max(
            ...a.products.map((p) => new Date(p.created_at).getTime())
          );
          const newestB = Math.max(
            ...b.products.map((p) => new Date(p.created_at).getTime())
          );
          return newestB - newestA;
        });

        if (categoriesArray.length === 0) {
          console.warn("No new arrivals found in the specified period");
        }

        return categoriesArray;
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  const [activeTab, setActiveTab] = useState<string | null>(null);
  useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].name);
    }
  }, [categories, activeTab]);
  const tabs = useMemo(() => {
    return categories.map((category) => ({
      id: category.name,
      label: category.name,
      products: [...category.products]
        .map((product) => ({
          ...product,
          category_id: product.category_id?.toString() || "",
        }))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, maxProductsPerCategory),
    }));
  }, [categories, maxProductsPerCategory]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (isLoading && !categories.length) {
    return (
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">New Arrivals</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: maxProductsPerCategory }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      </section>
    );
  }
  if (isError) {
    return null;
  }

  if (!categories.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <ScrollableTabbedSection
        title={`New Arrivals`}
        tabs={tabs}
        activeTab={activeTab ?? tabs[0]?.id}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
