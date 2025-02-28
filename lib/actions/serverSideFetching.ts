// app/prefetch-data.ts
import { getQueryClient } from "@/components/Client-Side/get-query-client";
import { dehydrate } from "@tanstack/react-query";
import { getUniqueBrands } from "./Brand/fetch";
import { getUniqueCategories } from "./Category/fetch";
import { fetchProducts } from "./Product/fetch";
import { fetchCarousels } from "./Carousel/fetch";
import { getUniqueBanners } from "./Banners/fetch";

export async function prefetchData() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["brandData"],
      queryFn: getUniqueBrands,
    }),
    queryClient.prefetchQuery({
      queryKey: ["categoryData"],
      queryFn: getUniqueCategories,
    }),
    queryClient.prefetchQuery({
      queryKey: ["products", 1, {}],
      queryFn: () => fetchProducts(1, {}),
    }),
    queryClient.prefetchQuery({
      queryKey: ["carouselData"],
      queryFn: fetchCarousels,
    }),
    queryClient.prefetchQuery({
      queryKey: ["bannerData"],
      queryFn: getUniqueBanners,
    }),
  ]);

  return dehydrate(queryClient);
}
