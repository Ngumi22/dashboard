// lib/actions/serverSideFetching.ts
import { getQueryClient } from "@/components/Client-Side/get-query-client";
import { dehydrate } from "@tanstack/react-query";
import { getUniqueBrands } from "./Brand/fetch";
import { fetchCategoryWithSubCat, getUniqueCategories } from "./Category/fetch";
import { fetchProducts } from "./Product/fetch";
import { fetchCarousels } from "./Carousel/fetch";
import { getUniqueBanners, fetchBannersByContext } from "./Banners/fetch";
import { fetchProductsByTag } from "./Product/fetchByTag";

const MINUTE = 1000 * 60;

export async function prefetchData() {
  const queryClient = getQueryClient();

  await Promise.all([
    await queryClient.prefetchQuery({
      queryKey: ["carouselsData"],
      queryFn: fetchCarousels,
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),

    queryClient.prefetchQuery({
      queryKey: ["bannersData"],
      queryFn: getUniqueBanners,
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: ["bannerData", "hero"], // Example context: "hero"
      queryFn: () => fetchBannersByContext("hero"),
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: ["brandData"],
      queryFn: getUniqueBrands,
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryData"],
      queryFn: getUniqueCategories,
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", 1, {}],
      queryFn: () => fetchProducts(1, {}),
      staleTime: 1000 * 60 * 10, // 10 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryDataWithSub"],
      queryFn: fetchCategoryWithSubCat,
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
    queryClient.prefetchQuery({
      queryKey: ["tagProducts"],
      queryFn: ({ queryKey }) => fetchProductsByTag(queryKey[1] as string),
      staleTime: 24 * 60 * MINUTE, // Data is fresh for 24 hours
      gcTime: 48 * 60 * MINUTE, // Garbage collection time is 48 hourss
    }),
  ]);

  return dehydrate(queryClient);
}
