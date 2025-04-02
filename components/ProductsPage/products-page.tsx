"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";

// Static imports (smaller components)

import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { useMediaQuery } from "@/hooks/use-media-query";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";
import { parseSearchParams } from "@/lib/actions/Product/search-params";

// Dynamic imports for heavy components

// Replace all dynamic imports with explicit loading components
const SortBar = dynamic(() => import("./sort-bar").then((mod) => mod.SortBar), {
  loading: () => <div className="h-12 bg-gray-100 rounded animate-pulse" />,
  ssr: false,
});

const ProductFilters = dynamic(
  () => import("./product-filters").then((mod) => mod.ProductFilters),
  {
    loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }
);

const ProductGrid = dynamic(
  () => import("./product-grid").then((mod) => mod.ProductGrid),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    ),
    ssr: false,
  }
);

const Pagination = dynamic(
  () => import("./pagination").then((mod) => mod.Pagination),
  {
    loading: () => <div className="h-10 bg-gray-100 rounded animate-pulse" />,
    ssr: false,
  }
);

const MobileFiltersDrawer = dynamic(
  () =>
    import("./mobile-filters-drawer").then((mod) => mod.MobileFiltersDrawer),
  {
    loading: () => null, // No loading for drawer as it's triggered by user
    ssr: false,
  }
);

const MINUTE = 1000 * 60;

export type ProductsPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function ProductsPageClient({
  searchParams,
}: ProductsPageProps) {
  const [gridLayout, setGridLayout] = useState(4);
  const parsedParams = parseSearchParams(searchParams);
  const { setFilters, ...filters } = useProductFilters(parsedParams);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const debouncedFilters = useDebounce(filters, 400);

  const { data, isError, refetch } = useQuery({
    queryKey: ["products", debouncedFilters],
    queryFn: () => fetchProductsAndFilters(debouncedFilters),
    staleTime: 5 * MINUTE,
    gcTime: 10 * MINUTE,
    refetchOnWindowFocus: false,
  });

  const availableFilters = useMemo(
    () => ({
      categories: data?.filters?.categories || [],
      brands: data?.filters?.brands || [],
      specifications: data?.filters?.specifications || [],
      minPrice: data?.filters?.minPrice || 0,
      maxPrice: data?.filters?.maxPrice || 0,
    }),
    [data?.filters]
  );

  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Error loading products
        <button
          onClick={() => refetch()}
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
        {!isDesktop && (
          <div className="px-4 mb-4">
            <MobileFiltersDrawer
              availableFilters={availableFilters}
              currentFilters={filters}
              setFilters={setFilters}
            />
          </div>
        )}

        {isDesktop && (
          <ProductFilters
            availableFilters={availableFilters}
            currentFilters={filters}
            setFilters={setFilters}
          />
        )}

        <div className="flex flex-col gap-6">
          <ProductGrid
            products={data?.products || []}
            gridLayout={gridLayout}
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
