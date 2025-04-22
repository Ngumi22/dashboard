"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import ProductCard, {
  ProductCardSkeleton,
} from "@/components/Product/ProductCards/product-card";
import ScrollableTabbedSection from "@/components/Client-Side/Features/TabbedScrollableSection";
import { fetchProducts } from "@/lib/actions/Product/actions/getData";
import type { Product } from "@/lib/actions/Product/actions/search-params";

type DiscountedCategory = {
  id: string | number;
  name: string;
  products: Product[];
};

type DiscountedOffersProps = {
  maxProductsPerCategory?: number;
  minDiscountPercentage?: number;
};

export default function DiscountedOffers({
  maxProductsPerCategory = 5,
  minDiscountPercentage = 2,
}: DiscountedOffersProps) {
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useQuery<DiscountedCategory[]>({
    queryKey: ["discounted-offers", minDiscountPercentage],
    queryFn: async () => {
      try {
        const result = await fetchProducts({
          minDiscount: minDiscountPercentage,
          perPage: 100,
          sort: "discount-desc",
        });

        if (!result) {
          throw new Error("No response from API");
        }
        const categoryMap = new Map<string | number, DiscountedCategory>();
        result.products.forEach((product) => {
          if (
            !product.category_name ||
            !product.discount ||
            product.discount < minDiscountPercentage
          ) {
            return;
          }
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
          const avgDiscountA =
            a.products.reduce((sum, p) => sum + (p.discount || 0), 0) /
            a.products.length;
          const avgDiscountB =
            b.products.reduce((sum, p) => sum + (p.discount || 0), 0) /
            b.products.length;
          return avgDiscountB - avgDiscountA;
        });

        if (categoriesArray.length === 0) {
          console.warn("No discounted categories found");
        }

        return categoriesArray;
      } catch (error) {
        console.error("Error fetching discounted products:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
        .sort((a, b) => (b.discount || 0) - (a.discount || 0)) // Sort by discount
        .slice(0, maxProductsPerCategory) // Limit products
        .map((product) => ({
          ...product,
          category_id: String(product.category_id ?? ""),
        })),
    }));
  }, [categories, maxProductsPerCategory]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  if (isLoading && !categories.length) {
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

  if (isError) {
    return (
      <div className="text-center space-y-2 py-4">
        <h2 className="text-lg font-semibold">Discounted Offers</h2>
        <p className="text-red-500">
          {error instanceof Error
            ? error.message
            : "Failed to load discounted products"}
        </p>
      </div>
    );
  }
  if (!categories.length) {
    return null;
  }

  return (
    <section className="mb-12">
      <ScrollableTabbedSection
        title={`Discounted Offers`}
        tabs={tabs}
        activeTab={activeTab ?? tabs[0]?.id}
        onTabChange={handleTabChange}
        ProductCard={ProductCard}
        ProductCardSkeleton={ProductCardSkeleton}
      />
    </section>
  );
}
