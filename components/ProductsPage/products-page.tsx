"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";
import { parseSearchParams } from "@/lib/actions/Product/search-params";

// Debounce & Cache Time Constants
const DEBOUNCE_DELAY = 400;
const STALE_TIME = 1000 * 60 * 5; // 5 minutes

// Dynamic Imports for Heavy Components
const ProductGrid = dynamic(
  () => import("./product-grid").then((mod) => mod.ProductGrid),
  { ssr: false }
);
const SortBar = dynamic(() => import("./sort-bar").then((mod) => mod.SortBar));
const ProductFilters = dynamic(
  () => import("./product-filters").then((mod) => mod.ProductFilters),
  { ssr: false }
);
const Pagination = dynamic(() =>
  import("./pagination").then((mod) => mod.Pagination)
);
const MobileFiltersDrawer = dynamic(
  () =>
    import("./mobile-filters-drawer").then((mod) => mod.MobileFiltersDrawer),
  { ssr: false }
);

export type ProductsPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ProductsPageClient({
  searchParams,
}: ProductsPageProps) {
  const parsedParams = parseSearchParams(searchParams);
  const { setFilters, ...filters } = useProductFilters(parsedParams);
  const debouncedFilters = useDebounce(filters, DEBOUNCE_DELAY);
  const deferredFilters = useDeferredValue(debouncedFilters);
  const [gridLayout, setGridLayout] = useState(4);

  const { data, isError, isFetching } = useQuery({
    queryKey: ["products", deferredFilters],
    queryFn: () => fetchProductsAndFilters(deferredFilters),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });

  const availableFilters = useMemo(() => {
    if (!data?.filters) return null;
    return {
      categories: data.filters.categories || [],
      brands: data.filters.brands || [],
      specifications: data.filters.specifications || [],
      minPrice: data.filters.minPrice || 0,
      maxPrice: data.filters.maxPrice || 0,
    };
  }, [data?.filters]);

  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Error loading products
        <button
          onClick={() => window.location.reload()}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 my-8 bg-muted/80">
      <SortBar
        totalProducts={data?.totalProducts || 0}
        totalAllProducts={data?.totalProducts || 0}
        onGridChange={setGridLayout}
        initialSort={filters.sort}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        {availableFilters && (
          <>
            <MobileFiltersDrawer
              availableFilters={availableFilters}
              currentFilters={filters}
              setFilters={setFilters}
            />
            <ProductFilters
              availableFilters={availableFilters}
              currentFilters={filters}
              setFilters={setFilters}
            />
          </>
        )}

        <div className="flex flex-col gap-6">
          <ProductGrid
            products={data?.products || []}
            gridLayout={gridLayout}
            isLoading={isFetching}
          />
          <Pagination
            currentPage={filters.page || 1}
            totalPages={data?.totalPages || 1}
          />
        </div>
      </div>
    </div>
  );
}
