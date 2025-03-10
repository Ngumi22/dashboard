// app/products/page.tsx
import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  keepPreviousData,
} from "@tanstack/react-query";
import ProductsPage from "@/components/ProductsPage/products-page";
import { getQueryClient } from "@/components/Client-Side/get-query-client";
import { ProductsPageSkeleton } from "@/components/ProductsPage/skeletons";
import { parseSearchParams } from "@/lib/actions/Product/search-params";
import { fetchProductsAndFilters } from "@/lib/actions/Product/fetchByFilters";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const queryClient = getQueryClient();
  const parsedParams = parseSearchParams(searchParams);

  const MINUTE = 1000 * 60;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["products", parsedParams],
      queryFn: () => fetchProductsAndFilters(parsedParams),
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: [
        "products",
        { ...parsedParams, page: (parsedParams.page || 1) + 1 },
      ],
      queryFn: () =>
        fetchProductsAndFilters({
          ...parsedParams,
          page: (parsedParams.page || 1) + 1,
        }),
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: [
        "products",
        { ...parsedParams, page: (parsedParams.page || 1) + 2 },
      ],
      queryFn: () =>
        fetchProductsAndFilters({
          ...parsedParams,
          page: (parsedParams.page || 1) + 2,
        }),
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ProductsPage searchParams={searchParams} />
      </Suspense>
    </HydrationBoundary>
  );
}
