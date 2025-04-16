// lib/actions/serverSideFetching.ts
import { getQueryClient } from "@/components/Client-Side/get-query-client";
import { dehydrate } from "@tanstack/react-query";
import { fetchCategoryWithSubCat, getUniqueCategories } from "./Category/fetch";
import { fetchCarousels } from "./Carousel/fetch";
import { fetchBannersByContext } from "./Banners/fetch";
import { fetchProductsByTag } from "./Product/fetchByTag";
import { fetchProductsGroupedByBrand } from "./Product/fetchProductByBrand";
import { fetchAllTopDiscountedProducts } from "./Product/fetchMostDiscountedProducts";
import { fetchCategoryWithProducts } from "./Product/fetchSub";
import { parseSearchParams } from "@/lib/actions/Product/search-params";
import { fetchProductsAndFilters } from "./Product/fetchByFilters";

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
    // Global data (used across all pages)
    queryClient.prefetchQuery({
      queryKey: ["carouselsData"],
      queryFn: fetchCarousels,
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),

    queryClient.prefetchQuery({
      queryKey: ["bannerData", "hero"],
      queryFn: () => fetchBannersByContext("hero"),
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),
    queryClient.prefetchQuery({
      queryKey: ["brandProducts"],
      queryFn: fetchProductsGroupedByBrand,
      staleTime: 5 * MINUTE,
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryDataWithSub"],
      queryFn: fetchCategoryWithSubCat,
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryData"],
      queryFn: getUniqueCategories,
      staleTime: DAY,
      gcTime: 2 * DAY,
    }),
    queryClient.prefetchQuery({
      queryKey: ["topDiscountedProducts"],
      queryFn: fetchAllTopDiscountedProducts,
      staleTime: 5 * MINUTE,
    }),
    queryClient.prefetchQuery({
      queryKey: ["tagProducts"],
      queryFn: ({ queryKey }) => fetchProductsByTag(queryKey[1] as string),
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

  // Category-specific prefetches
  const categoryPrefetches =
    params?.categoryNames?.map((categoryName) =>
      queryClient.prefetchQuery({
        queryKey: [`category-products:${categoryName}`, categoryName],
        queryFn: () => fetchCategoryWithProducts(categoryName),
        staleTime: 5 * MINUTE,
        gcTime: 10 * MINUTE,
      })
    ) || [];

  try {
    await Promise.all([...globalPrefetches, ...categoryPrefetches]);
    return dehydrate(queryClient);
  } catch (error) {
    console.error("Prefetching failed:", error);
    // Return dehydrated state even if some prefetches failed
    return dehydrate(queryClient);
  }
}
