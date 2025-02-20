"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useProductsQuery } from "@/lib/actions/Hooks/useProducts";
import ProductsHeader from "@/components/Client-Side/Products/ProductsHeader";
import ProductsGrid from "@/components/Client-Side/Products/ProductsGrid";
import FilterSidebar from "@/components/Client-Side/Products/FilterSidebar";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/app/store/filterStore";

export default function ProductsPage() {
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

  // Load more products
  const loadMoreProducts = () => setVisibleProducts((prev) => prev + 10);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <FilterSidebar />
      <div className="flex-1">
        <ProductsHeader
          onProductsPerRowChange={(value) => console.log(value)}
          onProductsPerPageChange={(value) => console.log(value)}
          onSortByChange={(value) => console.log(value)}
          productsPerPage="10"
          sortBy="alphabetical_asc"
        />
        {isLoading ? (
          <div>Loading...</div>
        ) : isError ? (
          <div>Error loading products</div>
        ) : (
          <ProductsGrid
            products={filteredProducts.slice(0, visibleProducts)}
            productsPerRow="4"
            productsPerPage="10"
            sortBy="alphabetical_asc"
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {visibleProducts < filteredProducts.length && (
          <Button onClick={loadMoreProducts}>Load More</Button>
        )}
      </div>
    </div>
  );
}
