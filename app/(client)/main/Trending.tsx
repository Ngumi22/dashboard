"use client";

import { useStore } from "@/app/store";
import { useFilterStore } from "@/app/store/filterStore";
import ScrollableSection from "@/components/Client-Side/Features/ScrollableSection";
import ProductCard from "@/components/Product/ProductCards/product-card";
import { useProductsQuery } from "@/lib/actions/Hooks/useProducts";
import { useRouter, useSearchParams } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

export default function TrendingProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleProducts, setVisibleProducts] = useState(10);
  // Zustand filter state
  const { filters, setFilter, clearFilters } = useFilterStore();

  // Convert URL search params into an object
  const urlFilters = useMemo(() => {
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        params[key] = Array.isArray(params[key])
          ? [...(params[key] as string[]), value]
          : [params[key] as string, value];
      } else {
        params[key] = value;
      }
    });
    return params;
  }, [searchParams]);

  // Sync URL filters with Zustand state
  useMemo(() => {
    Object.entries(urlFilters).forEach(([key, value]) => {
      setFilter(key, value);
    });
  }, [urlFilters, setFilter]);

  // Use React Query Hook for fetching products
  const { data: products, isLoading, isError } = useProductsQuery(1, filters);

  // Filter products on the client side
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.products.filter((product) => {
      for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
          if (
            value.length > 0 &&
            !value.includes(String(product[key as keyof typeof product] ?? ""))
          ) {
            return false;
          }
        } else if (typeof value === "string") {
          if (key === "minPrice" && product.price < Number.parseFloat(value)) {
            return false;
          }
          if (key === "maxPrice" && product.price > Number.parseFloat(value)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [products, filters]);

  return (
    <ScrollableSection
      title="Trending Products"
      items={filteredProducts?.map((product) => ({
        id: product.id,
        content: (
          <ProductCard
            main_image={product.main_image}
            price={product.price}
            id={product.id}
            name={product.name}
            discount={product.discount}
            description={product.description}
            quantity={product.quantity}
            ratings={product.ratings}
          />
        ),
      }))}
      className="mb-8"
      itemClassName=""
    />
  );
}
