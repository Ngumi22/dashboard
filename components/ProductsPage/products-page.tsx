"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SortBar } from "./sort-bar";
import {
  parseSearchParams,
  type SearchParams,
} from "@/lib/actions/Product/search-params";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";
import { Pagination } from "./pagination";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";
import { useDebounce } from "@/lib/hooks/use-debounce";
import Loading from "@/app/(client)/loading";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MobileFiltersDrawer } from "./mobile-filters-drawer";

const MINUTE = 1000 * 60;

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [gridLayout, setGridLayout] = useState(4);
  const parsedParams = parseSearchParams(searchParams);
  const { setFilters, ...filters } = useProductFilters(parsedParams);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Slightly reduced debounce time for better UX
  const debouncedFilters = useDebounce(filters, 400);

  const { data, isFetching, error, isPlaceholderData } = useQuery({
    queryKey: ["products", debouncedFilters],
    queryFn: () => fetchProductsAndFilters(debouncedFilters),
    placeholderData: keepPreviousData,
    staleTime: 24 * 60 * MINUTE,
    gcTime: 48 * 60 * MINUTE,
  });

  if (error)
    return <div className="p-4 text-red-600">Error loading products</div>;

  // Safely destructure with defaults
  const products = data?.products || [];
  const totalProducts = data?.totalProducts || 0;
  const totalPages = data?.totalPages || 1;
  const availableFilters = data?.filters || {
    categories: [],
    brands: [],
    specifications: [],
    minPrice: 0,
    maxPrice: 0,
  };

  return (
    <div className="grid gap-4 my-8 bg-muted/80">
      <SortBar
        totalProducts={totalProducts}
        totalAllProducts={totalProducts}
        onGridChange={setGridLayout}
        initialSort={filters.sort}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        {/* Mobile filters */}
        {!isDesktop && (
          <div className="px-4 mb-4">
            <MobileFiltersDrawer
              availableFilters={availableFilters}
              currentFilters={filters}
              setFilters={setFilters}
            />
          </div>
        )}

        {/* Desktop filters */}
        {isDesktop && (
          <ProductFilters
            availableFilters={availableFilters}
            currentFilters={filters}
            setFilters={setFilters}
          />
        )}

        <div className="flex flex-col gap-6">
          {isFetching && !isPlaceholderData ? (
            <Loading />
          ) : (
            <ProductGrid products={products} gridLayout={gridLayout} />
          )}

          <Pagination currentPage={filters.page || 1} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
