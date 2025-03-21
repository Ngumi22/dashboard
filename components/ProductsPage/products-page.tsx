"use client";

import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SortBar } from "./sort-bar";
import {
  parseSearchParams,
  SearchParams,
} from "@/lib/actions/Product/search-params";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";
import { Pagination } from "./pagination";
import { useProductFilters } from "@/lib/hooks/use-product-filters";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";
import { useDebounce } from "@/lib/hooks/use-debounce";
import Loading from "@/app/(client)/loading";

const MINUTE = 1000 * 60;

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [gridLayout, setGridLayout] = useState(4);
  const parsedParams = parseSearchParams(searchParams);
  const { setFilters, ...filters } = useProductFilters(parsedParams);

  const debouncedFilters = useDebounce(filters, 500);

  const { data, isFetching, error } = useQuery({
    queryKey: ["products", debouncedFilters],
    queryFn: () => fetchProductsAndFilters(debouncedFilters),
    placeholderData: keepPreviousData,
    staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
    gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
  });

  if (error) return <div>An error occurred: {(error as Error).message}</div>;
  if (!data) return <div>No data available</div>;

  const {
    products,
    totalProducts,
    totalPages,
    filters: availableFilters,
  } = data;

  return (
    <div className="md:container grid gap-6 my-8 bg-muted/80">
      <SortBar
        totalProducts={totalProducts}
        totalAllProducts={totalProducts}
        onGridChange={setGridLayout}
        initialSort={filters.sort}
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[240px_1fr]">
        <ProductFilters
          availableFilters={availableFilters}
          currentFilters={filters as Partial<SearchParams>}
          setFilters={setFilters as (filters: Partial<SearchParams>) => void}
        />
        <div className="flex flex-col gap-6">
          {isFetching ? (
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
