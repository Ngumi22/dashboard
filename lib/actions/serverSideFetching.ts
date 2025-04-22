// lib/actions/serverSideFetching.ts
import { getQueryClient } from "@/components/Client-Side/get-query-client";
import { dehydrate } from "@tanstack/react-query";
import { fetchBannersByContext } from "./Banners/fetch";
import { parseSearchParams } from "@/lib/actions/Product/search-params";
import { fetchProductsAndFilters } from "./Product/fetchByFilters";
import { fetchProducts } from "./Product/actions/getData";
import { getUniqueCarousels } from "./Carousel/fetch";

const MINUTE = 1000 * 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface PrefetchParams {
  categoryNames?: string[];
  searchParams?: { [key: string]: string | string[] | undefined };
}

export async function prefetchData(params?: PrefetchParams) {
  const parsedParams = parseSearchParams(params?.searchParams || {});
  const queryClient = getQueryClient();
  const currentPage = parsedParams.page || 1;

  const globalPrefetches = [
    queryClient.prefetchQuery({
      queryKey: ["bannerData", "hero"],
      queryFn: () => fetchBannersByContext("hero"),
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),

    queryClient.prefetchQuery({
      queryKey: ["carousels"],
      queryFn: () => getUniqueCarousels(),
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),

    queryClient.prefetchQuery({
      queryKey: ["prods", parsedParams],
      queryFn: () => fetchProducts(parsedParams),
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", parsedParams],
      queryFn: () => fetchProductsAndFilters(parsedParams),
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),

    // Prefetch next pages
    ...[1, 2, 3, 4].map((pageOffset) =>
      queryClient.prefetchQuery({
        queryKey: [
          "products",
          { ...parsedParams, page: currentPage + pageOffset },
        ],
        queryFn: () =>
          fetchProductsAndFilters({
            ...parsedParams,
            page: currentPage + pageOffset,
          }),
        staleTime: DAY,
        gcTime: 2 * DAY,
      })
    ),
    // Prefetch next pages
    ...[1, 2].map((pageOffset) =>
      queryClient.prefetchQuery({
        queryKey: [
          "products",
          { ...parsedParams, page: currentPage + pageOffset },
        ],
        queryFn: () =>
          fetchProductsAndFilters({
            ...parsedParams,
            page: currentPage + pageOffset,
          }),
        staleTime: DAY,
        gcTime: 2 * DAY,
      })
    ),
  ];

  try {
    await Promise.all([...globalPrefetches]);
    return dehydrate(queryClient);
  } catch (error) {
    console.error("Prefetching failed:", error);
    // Return dehydrated state even if some prefetches failed
    return dehydrate(queryClient);
  }
}
